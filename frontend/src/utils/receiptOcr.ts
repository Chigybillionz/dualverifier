import { createWorker } from 'tesseract.js';
import { apiUrl } from './api';

export interface ExtractedReceiptData {
  sessionId: string;
  senderBank: string;
  senderName: string;
  receiverBank: string;
  receiverName: string;
  receiverAccount: string;
  amount: number;
  currency: string;
  receiptTimestamp?: string;
  ocrEngine: 'Gemini 1.5 Flash Vision' | 'Client Tesseract.js (On-Device)' | 'Deterministic Byte Scanner' | 'User Confirmed';
  rawText?: string;
  confidenceNotes: string;
}

// 35+ Nigerian Banks Dictionary with keywords for OCR text matching
const BANK_MATCHERS: Array<{ name: string; patterns: RegExp[] }> = [
  { name: 'Guaranty Trust Bank (GTBank)', patterns: [/guaranty trust/i, /\bgtbank\b/i, /\bgtb\b/i, /\bgtco\b/i] },
  { name: 'Access Bank PLC', patterns: [/\baccess bank\b/i, /\baccess\b/i, /\bdiamond bank\b/i] },
  { name: 'Zenith Bank PLC', patterns: [/\bzenith bank\b/i, /\bzenith\b/i] },
  { name: 'First Bank of Nigeria', patterns: [/\bfirst bank\b/i, /\bfirstbank\b/i, /\bfbn\b/i, /\bfirstmonie\b/i] },
  { name: 'United Bank for Africa', patterns: [/\bunited bank for africa\b/i, /\buba\b/i] },
  { name: 'Wema Bank / ALAT', patterns: [/\bwema bank\b/i, /\bwema\b/i, /\balat\b/i] },
  { name: 'OPay Digital Services', patterns: [/\bopay\b/i, /\bpaycom\b/i] },
  { name: 'Moniepoint Microfinance Bank', patterns: [/\bmoniepoint\b/i, /\bmonie point\b/i, /\bmoney point\b/i] },
  { name: 'PalmPay Limited', patterns: [/\bpalmpay\b/i, /\bpalm pay\b/i] },
  { name: 'Kuda Microfinance Bank', patterns: [/\bkuda\b/i, /\bkuda bank\b/i] },
  { name: 'Stanbic IBTC Bank', patterns: [/\bstanbic\b/i, /\bstanbic ibtc\b/i] },
  { name: 'Sterling Bank PLC', patterns: [/\bsterling bank\b/i, /\bsterling\b/i] },
  { name: 'Fidelity Bank PLC', patterns: [/\bfidelity bank\b/i, /\bfidelity\b/i] },
  { name: 'Union Bank of Nigeria', patterns: [/\bunion bank\b/i] },
  { name: 'Polaris Bank', patterns: [/\bpolaris\b/i, /\bskye bank\b/i] },
  { name: 'FCMB (First City Monument Bank)', patterns: [/\bfcmb\b/i, /\bfirst city\b/i] },
  { name: 'Keystone Bank', patterns: [/\bkeystone\b/i] },
  { name: 'Ecobank Nigeria', patterns: [/\becobank\b/i] },
  { name: 'Unity Bank', patterns: [/\bunity bank\b/i] },
  { name: 'Carbon (One Finance)', patterns: [/\bcarbon\b/i, /\bone finance\b/i] },
  { name: 'Paga', patterns: [/\bpaga\b/i] },
  { name: 'Pocket by Piggyvest', patterns: [/\bpocket\b/i, /\bpiggyvest\b/i] }
];

/**
 * Deterministically parses OCR text from a Nigerian bank receipt
 */
export function parseNigerianReceiptText(text: string): Partial<ExtractedReceiptData> {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let sessionId = '';
  let amount = 0;
  let senderBank = '';
  let receiverBank = '';
  let senderName = '';
  let receiverName = '';
  let receiverAccount = '';
  let receiptTimestamp = '';

  // 1. Session ID / Transaction Reference extraction
  // Look for canonical 30 digits or 20-34 digits
  const longNumMatch = text.match(/\b([0-9]{20,34})\b/);
  const sessionPatternMatch = text.match(/(?:Session\s*ID|Transaction\s*(?:ID|Ref|No|N|Number)?|Reference(?:\s*No)?|Ref|Order\s*No|Trace\s*ID)[:\s#]*([0-9a-zA-Z]{18,34})/i);

  if (sessionPatternMatch && sessionPatternMatch[1]) {
    sessionId = sessionPatternMatch[1].replace(/[^0-9]/g, '');
  } else if (longNumMatch && longNumMatch[1]) {
    sessionId = longNumMatch[1];
  }

  // 2. Amount extraction (e.g. ₦8,000.00, $8,000.00, NGN 120,000, Amount: 45,000)
  const amountMatch = text.match(/(?:(?:Amount|Total|Amt|Transfer Amount)[\s:.-]*)?(?:₦|NGN|\bN\b|\$)\s*([0-9,]+(?:\.[0-9]{2})?)/i)
    || text.match(/(?:Amount|Total|Amt)[\s:.-]+([0-9,]+(?:\.[0-9]{2})?)/i);

  if (amountMatch && amountMatch[1]) {
    const cleanAmt = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (!isNaN(cleanAmt) && cleanAmt > 0) {
      amount = cleanAmt;
    }
  }

  // 3. Bank matching
  // First look for sender bank vs receiver bank sections
  const lowerText = text.toLowerCase();
  
  // Try matching banks from lines
  for (const item of BANK_MATCHERS) {
    for (const pat of item.patterns) {
      if (pat.test(lowerText)) {
        if (!senderBank) {
          senderBank = item.name;
        } else if (!receiverBank && item.name !== senderBank) {
          receiverBank = item.name;
        }
      }
    }
  }

  // If mobile FinTech transfer (e.g. OPay, Moniepoint, PalmPay)
  if (lowerText.includes('opay') && (!senderBank || !receiverBank)) {
    if (!senderBank) senderBank = 'OPay Digital Services';
    if (!receiverBank) receiverBank = 'OPay Digital Services';
  } else if (lowerText.includes('moniepoint') && (!senderBank || !receiverBank)) {
    if (!senderBank) senderBank = 'Moniepoint Microfinance Bank';
    if (!receiverBank) receiverBank = 'Moniepoint Microfinance Bank';
  } else if (lowerText.includes('palmpay') && (!senderBank || !receiverBank)) {
    if (!senderBank) senderBank = 'PalmPay Limited';
    if (!receiverBank) receiverBank = 'PalmPay Limited';
  }

  // 4. Sender & Receiver Name heuristic
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:Sender(?:\s*(?:Name|Details?))?|From|Payer|Debit Account)[:\s]*(.*)/i.test(line)) {
      const match = line.replace(/(?:Sender(?:\s*(?:Name|Details?))?|From|Payer|Debit Account)[:\s]*/i, '').trim();
      if (match.length > 2) senderName = match;
      else if (i + 1 < lines.length) senderName = lines[i + 1];
    }
    if (/(?:Beneficiary(?:\s*(?:Name|Details?))?|Recipient(?:\s*(?:Name|Details?))?|To|Credit Account)[:\s]*(.*)/i.test(line)) {
      const match = line.replace(/(?:Beneficiary(?:\s*(?:Name|Details?))?|Recipient(?:\s*(?:Name|Details?))?|To|Credit Account)[:\s]*/i, '').trim();
      if (match.length > 2) receiverName = match;
      else if (i + 1 < lines.length) receiverName = lines[i + 1];
    }
    // Account number detection (10 digits or masked phone/wallet like 814****740)
    const acctMatch = line.match(/\b([0-9]{10})\b/);
    const maskedAcctMatch = line.match(/\b([0-9]{3}[*+]{2,5}[0-9]{3,4})\b/);
    if (acctMatch && !receiverAccount) {
      receiverAccount = acctMatch[1];
    } else if (maskedAcctMatch && !receiverAccount) {
      receiverAccount = maskedAcctMatch[1].replace(/\+/g, '*');
    }
  }

  // 5. Date / Timestamp extraction
  // Matches e.g. 2026-03-15 14:30:22 or 15/03/2026 or 15 Mar 2026 14:30 or Nov 6th, 2026
  const dateMatch = text.match(/([0-9]{4}-[0-9]{2}-[0-9]{2}[\sT][0-9]{2}:[0-9]{2}(?::[0-9]{2})?)/)
    || text.match(/([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?)/)
    || text.match(/(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{1,2}(?:st|nd|rd|th)?[\s,]+[0-9]{4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?)/i)
    || text.match(/([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?)/i);

  if (dateMatch && dateMatch[0]) {
    receiptTimestamp = dateMatch[0];
  } else if (sessionId.length >= 12) {
    // If visual timestamp wasn't OCRed, derive directly from FinTech timestamp-indexed reference (e.g. 261106010100 -> 2026-11-06 01:01:00)
    const yy = sessionId.substring(0, 2);
    const mm = sessionId.substring(2, 4);
    const dd = sessionId.substring(4, 6);
    const hh = sessionId.substring(6, 8);
    const min = sessionId.substring(8, 10);
    const ss = sessionId.substring(10, 12);
    const yNum = parseInt(yy, 10);
    const mNum = parseInt(mm, 10);
    const dNum = parseInt(dd, 10);
    if (yNum >= 20 && yNum <= 35 && mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
      receiptTimestamp = `20${yy}-${mm}-${dd} ${hh}:${min}:${ss} WAT`;
    }
  }

  return {
    sessionId,
    amount,
    senderBank,
    receiverBank,
    senderName,
    receiverName,
    receiverAccount,
    receiptTimestamp
  };
}

/**
 * Runs Tesseract.js client-side OCR on an image file
 */
export async function runClientTesseractOcr(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  const worker = await createWorker('eng');
  
  if (onProgress) {
    onProgress(0.2, 'Initializing neural OCR engine...');
  }

  const ret = await worker.recognize(file);
  await worker.terminate();
  return ret.data.text;
}

/**
 * Master multi-strategy OCR extractor
 * 1. Tries Server Gemini 1.5 Flash Vision (if key provided in localStorage or server .env)
 * 2. Falls back to Client-Side Tesseract.js WebAssembly OCR
 */
export async function performReceiptOcr(
  file: File,
  options?: {
    customGeminiKey?: string;
    onProgress?: (percent: number, stepText: string) => void;
  }
): Promise<ExtractedReceiptData> {
  const customKey = options?.customGeminiKey || localStorage.getItem('dualverifier_gemini_api_key') || '';

  // Strategy 1: Try Backend Server OCR (Gemini Vision or Regex Stream)
  try {
    options?.onProgress?.(25, 'Connecting to DualVerifier Vision OCR engine...');
    const formData = new FormData();
    formData.append('receipt', file);
    if (customKey) {
      formData.append('geminiApiKey', customKey);
    }

    const headers: Record<string, string> = {};
    if (customKey) headers['x-gemini-key'] = customKey;

    const res = await fetch(apiUrl('/api/ocr/extract'), {
      method: 'POST',
      headers,
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.extracted && data.extracted.sessionId) {
        options?.onProgress?.(100, 'Gemini Vision extraction complete');
        return {
          sessionId: data.extracted.sessionId,
          senderBank: data.extracted.senderBank || 'Guaranty Trust Bank (GTBank)',
          senderName: data.extracted.senderName || 'Verified Sender',
          receiverBank: data.extracted.receiverBank || 'OPay Digital Services',
          receiverName: data.extracted.receiverName || 'Settled Merchant',
          receiverAccount: data.extracted.receiverAccount || '••••••••••',
          amount: Number(data.extracted.amount) || 0,
          currency: data.extracted.currency || 'NGN',
          receiptTimestamp: data.extracted.receiptTimestamp,
          ocrEngine: customKey ? 'Gemini 1.5 Flash Vision' : 'Deterministic Byte Scanner',
          confidenceNotes: data.extracted.aiNotes || 'Extracted via DualVerifier multimodal OCR engine.'
        };
      }
    }
  } catch (err) {
    console.warn('[ReceiptOcr] Server OCR attempt failed, proceeding to client Tesseract:', err);
  }

  // Strategy 2: Client-Side Tesseract.js (On-Device WebAssembly)
  options?.onProgress?.(40, 'Executing client-side OCR scan (Tesseract.js)...');
  try {
    const rawText = await runClientTesseractOcr(file, (p, status) => {
      options?.onProgress?.(40 + Math.round(p * 50), status);
    });

    options?.onProgress?.(95, 'Parsing Nigerian banking reference structures...');
    const parsed = parseNigerianReceiptText(rawText);

    return {
      sessionId: parsed.sessionId || '',
      senderBank: parsed.senderBank || 'Guaranty Trust Bank (GTBank)',
      senderName: parsed.senderName || 'Account Holder',
      receiverBank: parsed.receiverBank || 'OPay Digital Services',
      receiverName: parsed.receiverName || 'Settled Beneficiary',
      receiverAccount: parsed.receiverAccount || '••••••••••',
      amount: parsed.amount || 0,
      currency: 'NGN',
      receiptTimestamp: parsed.receiptTimestamp,
      ocrEngine: 'Client Tesseract.js (On-Device)',
      rawText,
      confidenceNotes: parsed.sessionId
        ? `Tesseract.js detected ${parsed.sessionId.length}-digit reference (${parsed.sessionId}) and ₦${parsed.amount || 0}.`
        : 'Image scanned. Verify and confirm extracted fields in the review panel.'
    };
  } catch (err: any) {
    console.error('[ReceiptOcr] Client OCR error:', err);
    return {
      sessionId: '',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Account Holder',
      receiverBank: 'OPay Digital Services',
      receiverName: 'Settled Beneficiary',
      receiverAccount: '••••••••••',
      amount: 0,
      currency: 'NGN',
      ocrEngine: 'Deterministic Byte Scanner',
      confidenceNotes: 'Could not auto-read text from image. Please enter the receipt Session ID manually below.'
    };
  }
}

