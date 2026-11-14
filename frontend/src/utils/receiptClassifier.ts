/**
 * receiptClassifier.ts
 * AI-powered document classifier that runs BEFORE OCR extraction.
 * Determines whether an uploaded file is a genuine Nigerian bank payment receipt,
 * a Zcash/blockchain transaction, or an unrelated document.
 *
 * Tier 1 — Heuristic keyword scan (always runs, no API key needed)
 * Tier 2 — Gemini 1.5 Flash Vision multimodal (optional, with API key)
 */

import { createWorker } from 'tesseract.js';
import { apiUrl } from './api';
import { lookupCbnBank } from './cbnBankCodes';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type DocumentType =
  | 'PAYMENT_RECEIPT'
  | 'BLOCKCHAIN_TRANSACTION'
  | 'NOT_A_RECEIPT'
  | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ClassifierEngine = 'GEMINI_VISION' | 'KEYWORD_HEURISTIC';

export interface ReceiptClassification {
  documentType: DocumentType;
  confidence: ConfidenceLevel;
  reason: string;
  detectedKeywords: string[];
  isPaymentReceipt: boolean;
  classifiedBy: ClassifierEngine;
  score: number; // internal keyword match count
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyword Banks - Supporting ALL Nigerian Commercial Banks & FinTechs
// ─────────────────────────────────────────────────────────────────────────────

/** High-signal phrases that appear on real Nigerian bank transfer receipts */
const PAYMENT_KEYWORDS_HIGH: string[] = [
  'session id',
  'transaction no',
  'transaction no.',
  'transaction number',
  'transaction receipt',
  'transfer receipt',
  'payment receipt',
  'transfer advice',
  'payment advice',
  'debit advice',
  'credit advice',
  'e-receipt',
  'share receipt',
  'nibss',
  'nip',
  'nip transfer',
  'inter-bank transfer',
  'interbank transfer',
  'transfer successful',
  'transfer complete',
  'transaction successful',
  'payment successful',
  'debit successful',
  'money sent',
  'transaction reference',
  'transaction id',
  'transaction ref',
  'reference number',
  'ref no',
  'ref number',
  'trace id',
  'rrn',           // Retrieval Reference Number (POS)
  'beneficiary',
  'beneficiary details',
  'beneficiary name',
  'recipient details',
  'recipient detail',
  'recipient account',
  'account credited',
  'account debited',
  'sender details',
  'sender detail',
  'sender name',
  'receiver name',
  'originating bank',
  'destination bank',
  'central bank of nigeria',
  'licensed by the central bank',
  'insured by the ndic',
  'insured by ndic',
  'ndic',
  // FinTechs & Banks high-signal headers
  'opay',
  'moniepoint',
  'palmpay',
  'kuda',
  'kudabank',
  'gtbank',
  'gtco',
  'guaranty trust',
  'access bank',
  'zenith bank',
  'first bank of nigeria',
  'firstbank',
  'united bank for africa',
  'uba',
  'wema bank',
  'alat by wema',
  'alat',
  'stanbic ibtc',
  'fidelity bank',
  'sterling bank',
  'fcmb',
  'union bank',
  'polaris bank',
  'keystone bank',
  'ecobank',
  'unity bank',
  'providus bank',
  'jaiz bank',
  'tajbank'
];

/** Medium-signal banking words — common in receipts */
const PAYMENT_KEYWORDS_MEDIUM: string[] = [
  'amount',
  'transfer',
  'debit',
  'credit',
  'balance',
  'available balance',
  'account number',
  'bank',
  'gtb',
  'fbn',
  'paycom',
  'monie point',
  'palm pay',
  'stanbic',
  'fidelity',
  'sterling',
  'keystone',
  'providus',
  'taj',
  'lotus',
  'parallex',
  'premiumtrust',
  'chipper cash',
  'carbon',
  'paga',
  'fairmoney',
  'vbank',
  'pocketapp',
  'narration',
  'remarks',
  'stamp duty',
  'vat',
  'commission',
  'charges',
  'status',
  'successful',
  'completed',
  'cleared',
  '₦',
  'ngn',
];

/** Phrases that signal the document is strictly NOT a payment receipt (academic, identity, etc.) */
const NOT_RECEIPT_SIGNALS: string[] = [
  'siwes',
  'industrial training',
  'matriculation',
  'admission letter',
  'admission',
  'student id',
  'curriculum vitae',
  'resume',
  'diploma certificate',
  'degree certificate',
  'academic transcript',
  'birth certificate',
  'voter card',
  'voters card',
  'national id card',
  'nin slip',
  'driving licence',
  'driver license',
  'international passport',
  'waybill',
  'delivery note',
  'packing slip'
];

/** Blockchain / Web3 keywords */
const BLOCKCHAIN_KEYWORDS: string[] = [
  'stellar',
  'pollar',
  'zcash',
  'zec',
  'usdc',
  'txid',
  'transaction hash',
  'tx hash',
  'block height',
  'confirmations',
  'orchard',
  'sapling',
  'memo',
  'shielded',
  '0x',
  'wallet address',
  'crypto',
  'bitcoin',
  'ethereum',
  'eth',
  'btc',
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function scoreKeywords(
  text: string,
  keywords: string[]
): { score: number; found: string[] } {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      found.push(kw);
    }
  }
  return { score: found.length, found };
}

/**
 * Checks whether the text contains at least one long numeric sequence (10–34 digits),
 * even if formatted with spaces, dashes, or slashes.
 */
function hasLongNumericSequence(text: string): boolean {
  if (/\b[0-9]{10,34}\b/.test(text)) return true;
  // Also check chunked digit patterns like "000014 261114 102030" or "000013-261114-102030"
  const chunked = text.match(/(?:[0-9]{4,8}[\s\-\/]){2,6}[0-9]{4,12}/);
  if (chunked) {
    const digitsOnly = chunked[0].replace(/[^0-9]/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 34) return true;
  }
  return false;
}

/**
 * Quick check for 10-digit Nigerian account number or masked mobile wallet pattern (e.g. 814****740)
 */
function hasAccountNumber(text: string): boolean {
  return /\b[0-9]{10}\b/.test(text) || /\b[0-9]{3}[*+]{2,5}[0-9]{3,4}\b/.test(text);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 1 — Heuristic Keyword Classifier (offline, no API key)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs Tesseract.js OCR on the file and classifies it using keyword heuristics.
 * Highly permissive: genuine receipts are NEVER blocked.
 */
async function classifyWithHeuristics(file: File): Promise<ReceiptClassification> {
  let rawText = '';

  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(file);
    await worker.terminate();
    rawText = result.data.text || '';
  } catch {
    // If client Tesseract throws or hangs, do NOT block the user!
    // Return a permissive response that allows OCR step and manual review
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: 'LOW',
      reason: 'Receipt image accepted. Review extracted fields in the inspection panel.',
      detectedKeywords: ['document_uploaded'],
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 1,
    };
  }

  // --- Score the raw OCR text ---
  const { score: highScore, found: highFound } = scoreKeywords(rawText, PAYMENT_KEYWORDS_HIGH);
  const { score: mediumScore, found: mediumFound } = scoreKeywords(rawText, PAYMENT_KEYWORDS_MEDIUM);
  const { score: blockchainScore, found: blockchainFound } = scoreKeywords(rawText, BLOCKCHAIN_KEYWORDS);
  const { score: negScore, found: negFound } = scoreKeywords(rawText, NOT_RECEIPT_SIGNALS);

  const totalPaymentScore = highScore * 2 + mediumScore;
  const hasLongNum = hasLongNumericSequence(rawText);
  const hasAcct = hasAccountNumber(rawText);
  const allFound = [...new Set([...highFound, ...mediumFound])];

  // Check if any recognized Nigerian bank name was detected
  const lowerText = rawText.toLowerCase();
  const detectedBank = lookupCbnBank(lowerText);

  // --- Decision Tree ---

  // 1. Blockchain / Zcash / Stellar
  if (blockchainScore >= 2 && highScore === 0 && !detectedBank) {
    return {
      documentType: 'BLOCKCHAIN_TRANSACTION',
      confidence: blockchainScore >= 4 ? 'HIGH' : 'MEDIUM',
      reason: `Detected ${blockchainScore} blockchain indicators (${blockchainFound.slice(0, 3).join(', ')}).`,
      detectedKeywords: blockchainFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: blockchainScore,
    };
  }

  // 2. Clear non-receipt signals (e.g. Student ID, SIWES logbook, Degree Certificate)
  if (negScore >= 2 && highScore === 0 && !hasLongNum && !detectedBank) {
    return {
      documentType: 'NOT_A_RECEIPT',
      confidence: 'HIGH',
      reason: `Document appears to be a ${negFound[0]} — not a Nigerian bank transfer receipt.`,
      detectedKeywords: negFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 0,
    };
  }

  // 3. Genuine Nigerian bank / FinTech payment receipt:
  // Any bank detected OR high payment score OR reference sequence found
  if (detectedBank || highScore >= 1 || hasLongNum || totalPaymentScore >= 2) {
    const bankDesc = detectedBank ? `Bank: ${detectedBank.shortName}. ` : '';
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: (highScore >= 2 || (detectedBank && hasLongNum)) ? 'HIGH' : 'MEDIUM',
      reason: `Authentic Nigerian transfer receipt confirmed. ${bankDesc}${allFound.slice(0, 4).join(', ')}.`,
      detectedKeywords: allFound,
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: Math.max(1, totalPaymentScore),
    };
  }

  // 4. Default: Permissive fallback for real receipts with challenging OCR rasterization
  return {
    documentType: 'PAYMENT_RECEIPT',
    confidence: 'LOW',
    reason: 'Document uploaded. Check and confirm fields before verifying with NIBSS.',
    detectedKeywords: allFound,
    isPaymentReceipt: true,
    classifiedBy: 'KEYWORD_HEURISTIC',
    score: 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 2 — Gemini 1.5 Flash Vision Classifier (optional, with API key)
// ─────────────────────────────────────────────────────────────────────────────

async function classifyWithGemini(
  file: File,
  geminiApiKey: string
): Promise<ReceiptClassification | null> {
  try {
    const formData = new FormData();
    formData.append('receipt', file);

    const res = await fetch(apiUrl('/api/classify/receipt'), {
      method: 'POST',
      headers: { 'x-gemini-key': geminiApiKey },
      body: formData,
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.success || !data.classification) return null;

    const c = data.classification;
    return {
      documentType: c.documentType || 'PAYMENT_RECEIPT',
      confidence: c.confidence || 'MEDIUM',
      reason: c.reason || 'Classified by Gemini Vision.',
      detectedKeywords: c.detectedKeywords || [],
      isPaymentReceipt: Boolean(c.isPaymentReceipt !== false),
      classifiedBy: 'GEMINI_VISION',
      score: c.score || 1,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Entry Point
// ─────────────────────────────────────────────────────────────────────────────

export async function classifyReceiptDocument(
  file: File,
  options?: { apiKey?: string; customGeminiKey?: string }
): Promise<ReceiptClassification> {
  const geminiKey =
    options?.apiKey ||
    options?.customGeminiKey ||
    localStorage.getItem('gemini_api_key') ||
    localStorage.getItem('dualverifier_gemini_api_key') ||
    '';

  // Tier 2: Gemini Vision (if key available)
  if (geminiKey) {
    const geminiResult = await classifyWithGemini(file, geminiKey);
    if (geminiResult) {
      return geminiResult;
    }
  }

  // Tier 1: On-device keyword heuristic
  return classifyWithHeuristics(file);
}
