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
  'stan',          // System Trace Audit Number
  'beneficiary',
  'beneficiary name',
  'recipient account',
  'account credited',
  'account debited',
  'sender name',
  'receiver name',
  'originating bank',
  'destination bank',
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
  'opay', 'paycom',
  'moniepoint', 'monie point',
  'palmpay', 'palm pay',
  'kuda',
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

/** Phrases that signal the document is NOT a payment receipt */
const NOT_RECEIPT_SIGNALS: string[] = [
  'invoice',
  'invoice no',
  'invoice number',
  'bill to',
  'sold to',
  'purchase order',
  'quotation',
  'delivery note',
  'packing slip',
  'payslip',
  'pay stub',
  'salary slip',
  'airtime',
  'data bundle',
  'subscription plan',
  'your plan',
  'chat',
  'whatsapp',
  'message',
  'sent',         // "sent" alone (WhatsApp message status)
  'national id',
  'passport',
  'driving licence',
  'certificate',
  'statement of account',
  'bank statement',
  'account statement',
];

/** Blockchain / Zcash keywords */
const BLOCKCHAIN_KEYWORDS: string[] = [
  'zcash',
  'zec',
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
 * Quick check for 10-digit Nigerian account number pattern
 */
function hasAccountNumber(text: string): boolean {
  return /\b[0-9]{10}\b/.test(text);
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

  // 2. Strong not-a-receipt signal overrides weak payment signals
  if (negScore >= 3 && totalPaymentScore <= 2) {
    return {
      documentType: 'NOT_A_RECEIPT',
      confidence: 'HIGH',
      reason: `Document appears to be a ${negFound[0] || 'non-payment document'} (detected: ${negFound.slice(0, 3).join(', ')}). No NIBSS transfer indicators found.`,
      detectedKeywords: negFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: 0,
    };
  }

  // 3. High-confidence payment receipt: 2+ high-signal keywords AND a long reference number
  if (highScore >= 2 && hasLongNum) {
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: 'HIGH',
      reason: `Receipt indicators confirmed: ${highFound.slice(0, 3).join(', ')}. Transaction reference number detected.`,
      detectedKeywords: allFound,
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: totalPaymentScore,
    };
  }

  // 4. Medium-confidence: at least 1 high-signal + account number, or 3+ medium-signal + long num
  if ((highScore >= 1 && hasAcct) || (mediumScore >= 3 && hasLongNum)) {
    return {
      documentType: 'PAYMENT_RECEIPT',
      confidence: 'MEDIUM',
      reason: `Partial receipt indicators found (${allFound.slice(0, 4).join(', ')}). Please confirm fields in the review panel.`,
      detectedKeywords: allFound,
      isPaymentReceipt: true,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: totalPaymentScore,
    };
  }

  // 5. Some banking keywords but weak evidence — flag as LOW CONFIDENCE
  if (totalPaymentScore >= 2) {
    return {
      documentType: 'UNKNOWN',
      confidence: 'LOW',
      reason: `Found some banking keywords (${allFound.slice(0, 3).join(', ')}) but insufficient evidence of a payment receipt. Please verify manually.`,
      detectedKeywords: allFound,
      isPaymentReceipt: false,
      classifiedBy: 'KEYWORD_HEURISTIC',
      score: totalPaymentScore,
    };
  }

  // 6. Default: not a receipt
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

    const res = await fetch('/api/classify/receipt', {
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
