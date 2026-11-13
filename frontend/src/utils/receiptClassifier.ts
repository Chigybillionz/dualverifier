/**
 * receiptClassifier.ts
 * AI-powered document classifier that runs BEFORE OCR extraction.
 * Determines whether an uploaded file is a genuine Nigerian bank payment receipt,
 * a Zcash/blockchain transaction, or an unrelated document (invoice, chat screenshot, ID, etc.)
 *
 * Tier 1 — Heuristic keyword scan (always runs, no API key needed)
 * Tier 2 — Gemini 1.5 Flash Vision multimodal (optional, with API key)
 */

import { createWorker } from 'tesseract.js';
import { apiUrl } from './api';

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
// Keyword Banks
// ─────────────────────────────────────────────────────────────────────────────

/** High-signal phrases that only appear on real Nigerian bank transfer receipts */
const PAYMENT_KEYWORDS_HIGH: string[] = [
  'session id',
  'transaction no',
  'transaction no.',
  'transaction number',
  'transaction receipt',
  'share receipt',
  'payment receipt',
  'transfer receipt',
  'nibss',
  'nip',
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
  'opay',
  'moniepoint',
  'palmpay',
  'kuda',
  'central bank of nigeria',
  'licensed by the central bank',
  'insured by the ndic',
  'insured by ndic',
  'ndic'
];

/** Medium-signal banking words — common in receipts but also in invoices */
const PAYMENT_KEYWORDS_MEDIUM: string[] = [
  'amount',
  'transfer',
  'debit',
  'credit',
  'balance',
  'available balance',
  'account number',
  'bank',
  'gtbank', 'gtb',
  'access bank',
  'zenith bank',
  'zenith',
  'first bank', 'firstbank', 'fbn',
  'uba', 'united bank',
  'wema', 'alat',
  'paycom',
  'monie point',
  'palm pay',
  'stanbic', 'stanbic ibtc',
  'sterling bank',
  'fidelity bank',
  'union bank',
  'polaris bank',
  'fcmb',
  'keystone bank',
  'ecobank',
  'chipper cash',
  'carbon',
  'paga',
  '₦',
  'ngn',
];

/** Phrases that signal the document is strictly NOT a payment receipt */
const NOT_RECEIPT_SIGNALS: string[] = [
  'certify',
  'certificate',
  'certification',
  'this is to certify',
  'siwes',
  'industrial training',
  'internship',
  'matriculation',
  'admission',
  'student',
  'university',
  'polytechnic',
  'college',
  'school',
  'diploma',
  'degree',
  'transcript',
  'curriculum vitae',
  'resume',
  'invoice',
  'invoice no',
  'invoice number',
  'proforma',
  'bill to',
  'sold to',
  'purchase order',
  'quotation',
  'delivery note',
  'waybill',
  'packing slip',
  'payslip',
  'pay stub',
  'salary slip',
  'airtime purchase',
  'data bundle purchase',
  'national id',
  'voter card',
  'voters card',
  'passport',
  'driving licence',
  'driver license',
  'nin slip',
  'birth certificate',
  'academic certificate',
  'degree certificate',
  'statement of account',
  'bank statement',
  'account statement',
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

/**
 * Counts how many keywords from a list appear in the given text (case-insensitive).
 * Returns { score, found } where score = number of unique keywords matched.
 */
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
 * Checks whether the text contains at least one long numeric sequence
 * (10–34 digits), which is characteristic of transaction references.
 */
function hasLongNumericSequence(text: string): boolean {
  return /\b[0-9]{10,34}\b/.test(text);
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
 * Does NOT require any API key.
 */
async function classifyWithHeuristics(file: File): Promise<ReceiptClassification> {
  let rawText = '';

  try {
    const worker = await createWorker('eng');
    const result = await worker.recognize(file);
    await worker.terminate();
    rawText = result.data.text || '';
  } catch {
    // If OCR itself fails (e.g., PDF without embedded text), return UNKNOWN
    return {
      documentType: 'UNKNOWN',
      confidence: 'LOW',
      reason: 'Could not read text from the uploaded file. Please ensure it is a clear image.',
      detectedKeywords: [],
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 0,
    };
  }

  // --- Score the raw OCR text ---
  const { score: highScore, found: highFound } = scoreKeywords(rawText, PAYMENT_KEYWORDS_HIGH);
  const { score: mediumScore, found: mediumFound } = scoreKeywords(rawText, PAYMENT_KEYWORDS_MEDIUM);
  const { score: blockchainScore, found: blockchainFound } = scoreKeywords(rawText, BLOCKCHAIN_KEYWORDS);
  const { score: negScore, found: negFound } = scoreKeywords(rawText, NOT_RECEIPT_SIGNALS);

  const totalPaymentScore = highScore * 2 + mediumScore; // high-signal keywords count double
  const hasLongNum = hasLongNumericSequence(rawText);
  const hasAcct = hasAccountNumber(rawText);
  const allFound = [...new Set([...highFound, ...mediumFound])];

  // --- Decision Tree ---

  // 1. Blockchain / Zcash
  if (blockchainScore >= 2) {
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

  // 2. HARD GUARD 1: Non-receipt indicators (Certificate, SIWES, Invoice, ID card) without a reference number
  if (negScore > 0 && !hasLongNum) {
    return {
      documentType: 'NOT_A_RECEIPT',
      confidence: 'HIGH',
      reason: `Document identified as a ${negFound[0]} (detected: ${negFound.slice(0, 3).join(', ')}). No banking transaction reference found.`,
      detectedKeywords: negFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 0,
    };
  }

  // 3. HARD GUARD 2: A document CANNOT be a payment receipt if it has NO reference number AND NO transfer amount
  const hasCurrencyAmount = /(?:₦|NGN|\bN\b|\$)\s*[0-9,]+(?:\.[0-9]{2})?/i.test(rawText) || /(?:amount|total|amt)[\s:.-]+[0-9,]+(?:\.[0-9]{2})?/i.test(rawText);
  if (!hasLongNum && !hasCurrencyAmount) {
    return {
      documentType: 'NOT_A_RECEIPT',
      confidence: 'HIGH',
      reason: 'No transaction reference number (Session ID) or transfer amount detected in this document.',
      detectedKeywords: negFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 0,
    };
  }

  // 4. Strong not-a-receipt signal overrides weak payment signals
  if (negScore >= 2 && highScore === 0) {
    return {
      documentType: 'NOT_A_RECEIPT',
      confidence: 'HIGH',
      reason: `Document appears to be a ${negFound[0]} — not a valid inter-bank payment receipt.`,
      detectedKeywords: negFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 0,
    };
  }

  // 5. Genuine Nigerian bank / FinTech payment receipt:
  // Must have a transaction reference number (10-34 digits) AND at least one payment keyword
  if (hasLongNum && (highScore >= 1 || mediumScore >= 1) && negScore === 0) {
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: (highScore >= 2 || totalPaymentScore >= 3) ? 'HIGH' : 'MEDIUM',
      reason: `Authentic Nigerian transfer receipt confirmed: ${allFound.slice(0, 4).join(', ')}. Reference number detected.`,
      detectedKeywords: allFound,
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: totalPaymentScore,
    };
  }

  // 6. High-signal keywords with confirmed transfer amount
  if (highScore >= 2 && hasCurrencyAmount && negScore <= 1) {
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: 'HIGH',
      reason: `Receipt indicators confirmed: ${highFound.slice(0, 4).join(', ')}.`,
      detectedKeywords: allFound,
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: totalPaymentScore,
    };
  }

  // 7. Medium confidence payment indicators
  if ((highScore >= 1 && hasAcct) || (totalPaymentScore >= 3 && hasCurrencyAmount && negScore === 0)) {
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: 'MEDIUM',
      reason: `Partial receipt indicators found (${allFound.slice(0, 4).join(', ')}). Review extracted fields in the inspection panel.`,
      detectedKeywords: allFound,
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: totalPaymentScore,
    };
  }

  // 8. Default: not a receipt
  return {
    documentType: 'NOT_A_RECEIPT',
    confidence: negScore >= 1 ? 'HIGH' : 'MEDIUM',
    reason: negScore >= 1
      ? `Document appears to be a ${negFound[0]} — no payment receipt indicators detected.`
      : 'No Nigerian bank transfer keywords or reference numbers found in this document.',
    detectedKeywords: [],
    isPaymentReceipt: false,
    classifiedBy: 'KEYWORD_HEURISTIC',
    score: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 2 — Gemini 1.5 Flash Vision Classifier (optional, with API key)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sends the file to Gemini 1.5 Flash Vision via the DualVerifier backend proxy.
 * Falls back to null if the request fails (caller will fall back to heuristic).
 */
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
      documentType: c.documentType || 'UNKNOWN',
      confidence: c.confidence || 'LOW',
      reason: c.reason || 'Classified by Gemini Vision.',
      detectedKeywords: c.detectedKeywords || [],
      isPaymentReceipt: Boolean(c.isPaymentReceipt),
      classifiedBy: 'GEMINI_VISION',
      score: c.score || 0,
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Entry Point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classifies an uploaded document as a payment receipt, blockchain transaction,
 * or unrelated document.
 *
 * Strategy:
 * 1. If a Gemini API key is available, try Gemini Vision first (most accurate).
 * 2. Always fall back to on-device Tesseract.js keyword heuristics.
 *
 * @param file           The uploaded image or PDF file.
 * @param options.customGeminiKey  Optional Gemini API key override.
 */
export async function classifyReceiptDocument(
  file: File,
  options?: { customGeminiKey?: string }
): Promise<ReceiptClassification> {
  const geminiKey =
    options?.customGeminiKey ||
    localStorage.getItem('dualverifier_gemini_api_key') ||
    '';

  // Tier 2: Gemini Vision (if key available)
  if (geminiKey) {
    const geminiResult = await classifyWithGemini(file, geminiKey);
    if (geminiResult) {
      return geminiResult;
    }
    // Fall through to heuristic if Gemini fails
  }

  // Tier 1: On-device keyword heuristic
  return classifyWithHeuristics(file);
}

