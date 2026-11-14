import { createWorker } from 'tesseract.js';
import { apiUrl } from './api';
import { lookupCbnBank, CBN_BANK_REGISTRY } from './cbnBankCodes';

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
  { name: 'Guaranty Trust Bank PLC', patterns: [/guaranty trust/i, /\bgtbank\b/i, /\bgtb\b/i, /\bgtco\b/i] },
  { name: 'Access Bank PLC', patterns: [/\baccess bank\b/i, /\baccess\b/i, /\bdiamond bank\b/i] },
  { name: 'Zenith Bank PLC', patterns: [/\bzenith bank\b/i, /\bzenith\b/i] },
  { name: 'First Bank of Nigeria', patterns: [/\bfirst bank\b/i, /\bfirstbank\b/i, /\bfbn\b/i, /\bfirstmonie\b/i] },
  { name: 'United Bank for Africa', patterns: [/\bunited bank for africa\b/i, /\buba\b/i] },
  { name: 'Wema Bank PLC', patterns: [/\bwema bank\b/i, /\bwema\b/i, /\balat\b/i] },
  { name: 'OPay Digital Services (PayCom)', patterns: [/\bopay\b/i, /\bpaycom\b/i] },
  { name: 'Moniepoint Microfinance Bank', patterns: [/\bmoniepoint\b/i, /\bmonie point\b/i, /\bmoney point\b/i, /\bteamapt\b/i] },
  { name: 'PalmPay Limited', patterns: [/\bpalmpay\b/i, /\bpalm pay\b/i] },
  { name: 'Kuda Microfinance Bank', patterns: [/\bkuda\b/i, /\bkuda bank\b/i, /\bkudabank\b/i] },
  { name: 'Stanbic IBTC Bank', patterns: [/\bstanbic\b/i, /\bstanbic ibtc\b/i] },
  { name: 'Sterling Bank PLC', patterns: [/\bsterling bank\b/i, /\bsterling\b/i] },
  { name: 'Fidelity Bank PLC', patterns: [/\bfidelity bank\b/i, /\bfidelity\b/i] },
  { name: 'Union Bank of Nigeria', patterns: [/\bunion bank\b/i] },
  { name: 'Polaris Bank', patterns: [/\bpolaris\b/i, /\bskye bank\b/i] },
  { name: 'First City Monument Bank', patterns: [/\bfcmb\b/i, /\bfirst city monument\b/i] },
  { name: 'Keystone Bank', patterns: [/\bkeystone\b/i] },
  { name: 'Ecobank Nigeria', patterns: [/\becobank\b/i] },
  { name: 'Unity Bank PLC', patterns: [/\bunity bank\b/i] },
  { name: 'Standard Chartered Bank', patterns: [/\bstandard chartered\b/i, /\bstanchart\b/i] },
  { name: 'Providus Bank', patterns: [/\bprovidus\b/i] },
  { name: 'Jaiz Bank PLC', patterns: [/\bjaiz\b/i] },
  { name: 'TAJBank PLC', patterns: [/\btajbank\b/i, /\btaj bank\b/i] },
  { name: 'Lotus Bank', patterns: [/\blotus bank\b/i] },
  { name: 'Parallex Bank', patterns: [/\bparallex\b/i] },
  { name: 'PremiumTrust Bank', patterns: [/\bpremium trust\b/i, /\bpremiumtrust\b/i] },
  { name: 'VFD Microfinance Bank', patterns: [/\bvfd\b/i, /\bvbank\b/i] },
  { name: 'FairMoney Microfinance Bank', patterns: [/\bfairmoney\b/i] },
  { name: 'Carbon (One Finance)', patterns: [/\bcarbon\b/i, /\bone finance\b/i] },
  { name: 'Paga', patterns: [/\bpaga\b/i] },
  { name: 'Pocket by PiggyVest', patterns: [/\bpocket\b/i, /\bpiggyvest\b/i] }
];

/**
 * Robust monetary amount extractor for Nigerian banking receipts.
 * Nigerian Tesseract OCR commonly corrupts the Naira symbol (₦ U+20A6)
 * into '=', '-', '$', '#', 'ee', or leaves 'Amount' on a separate line above the number.
 */
export function extractAmountRobust(text: string): number {
  if (!text) return 0;
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Strategy 1: Explicit labels on same line or next 1-2 lines (e.g. "Transfer Amount\n8,000.00")
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignore lines that are transaction/session reference IDs or bank account numbers
    if (/(?:Transaction\s*(?:No|Number|ID|Ref|N)|Session\s*ID|Reference|Account\s*No)/i.test(line)) {
      continue;
    }

    if (/(?:Amount|Total|Amt|Transfer Amount|Transaction Amount|Debit|Paid|Sum)/i.test(line)) {
      // 1a: Check on same line
      const sameLineMatch = line.match(/(?:[₦Nn#=~*\-]|NGN|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]{3,8}(?:\.[0-9]{2})?)/i);
      if (sameLineMatch && sameLineMatch[1]) {
        const val = parseFloat(sameLineMatch[1].replace(/,/g, ''));
        if (!isNaN(val) && val >= 10 && val < 1000000000) return val;
      }
      // 1b: Check on next 1-2 lines (common in vertical mobile bank receipts)
      for (let j = 1; j <= 2 && i + j < lines.length; j++) {
        const nextLine = lines[i + j];
        if (/(?:Transaction\s*(?:No|Number|ID|Ref|N)|Session\s*ID|Reference|Account\s*No)/i.test(nextLine)) continue;
        const nextMatch = nextLine.match(/(?:[₦Nn#=~*\-]|NGN|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]{3,8}(?:\.[0-9]{2})?)/i);
        if (nextMatch && nextMatch[1]) {
          const val = parseFloat(nextMatch[1].replace(/,/g, ''));
          if (!isNaN(val) && val >= 10 && val < 1000000000) return val;
        }
      }
    }
  }

  // Strategy 2: Preceded by currency prefix or common OCR-corrupted symbols (₦, NGN, $, ee, =, -, #, *, ~)
  const currencyMatches = [...text.matchAll(/(?:₦|NGN|\$|\bee\b|[-=#*~])\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?|[0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,8}(?:\.[0-9]{2}))(?![0-9])/gi)];
  const candidates: number[] = [];
  for (const m of currencyMatches) {
    const val = parseFloat(m[1].replace(/,/g, ''));
    if (!isNaN(val) && val >= 50 && val < 1000000000) {
      candidates.push(val);
    }
  }
  if (candidates.length > 0) {
    const bigCandidates = candidates.filter(v => v >= 100);
    return bigCandidates.length > 0 ? Math.max(...bigCandidates) : Math.max(...candidates);
  }

  // Strategy 3: Standard comma-formatted monetary amounts (e.g. 150,000.00 or 8,000)
  const commaMatches = [...text.matchAll(/(?<![0-9])([0-9]{1,3}(?:,[0-9]{3})+(?:\.[0-9]{2})?)(?![0-9])/g)];
  for (const m of commaMatches) {
    const val = parseFloat(m[1].replace(/,/g, ''));
    if (!isNaN(val) && val >= 50 && val < 1000000000) {
      candidates.push(val);
    }
  }
  if (candidates.length > 0) {
    const bigCandidates = candidates.filter(v => v >= 100);
    return bigCandidates.length > 0 ? Math.max(...bigCandidates) : Math.max(...candidates);
  }

  // Strategy 4: Decimal formatted monetary amounts (e.g. 8000.00 or 150000.00)
  const decMatches = [...text.matchAll(/(?<![0-9])([0-9]{3,8}\.[0-9]{2})(?![0-9])/g)];
  for (const m of decMatches) {
    const val = parseFloat(m[1]);
    if (!isNaN(val) && val >= 50 && val < 1000000000) {
      candidates.push(val);
    }
  }
  if (candidates.length > 0) {
    const bigCandidates = candidates.filter(v => v >= 100);
    return bigCandidates.length > 0 ? Math.max(...bigCandidates) : Math.max(...candidates);
  }

  return 0;
}

/**
 * Deterministically parses OCR text from any Nigerian bank receipt
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
  // Strategy 1a: Labeled patterns with flexible spacing, hyphens, and slashes
  const labeledPatterns = [
    /(?:Session\s*ID|NIBSS(?:\s*NIP)?\s*(?:Ref|ID|Session)?|NIP\s*(?:Ref|ID|Session|Transaction)?|Transaction\s*(?:ID|Ref|No|Number|Reference)?|Payment\s*(?:Ref|ID|Reference)?|Transfer\s*(?:Ref|ID|Reference)?|Reference(?:\s*(?:No|Number|ID))?|Order\s*(?:No|Number|ID)?|Trace\s*ID|RRN)[\s:.\-#\n\r]*([0-9a-zA-Z\s\-\/]{10,45})/gi,
  ];

  for (const pat of labeledPatterns) {
    const matches = [...text.matchAll(pat)];
    for (const m of matches) {
      if (m && m[1]) {
        const clean = m[1].replace(/[^0-9]/g, '');
        if (clean.length >= 10 && clean.length <= 34) {
          sessionId = clean;
          break;
        }
      }
    }
    if (sessionId) break;
  }

  // Strategy 1b: Continuous 10 to 34 digits anywhere in text (check 30 digits first, then 10-29 digits)
  if (!sessionId) {
    const exact30Match = text.match(/\b([0-9]{30})\b/);
    const continuousMatch = text.match(/\b([0-9]{10,34})\b/);
    if (exact30Match) {
      sessionId = exact30Match[1];
    } else if (continuousMatch) {
      sessionId = continuousMatch[1];
    }
  }

  // Strategy 1c: Chunked digit patterns (e.g. "000014 261114 102030 492810 394812" or "100033 240130 144")
  if (!sessionId) {
    const chunkedMatch = text.match(/(?:[0-9]{3,8}[\s\-\/]){1,6}[0-9]{3,12}/);
    if (chunkedMatch) {
      const clean = chunkedMatch[0].replace(/[^0-9]/g, '');
      if (clean.length >= 10 && clean.length <= 34) {
        sessionId = clean;
      }
    }
  }

  // 2. Authoritative Bank Extraction from Session ID:
  // In NIP protocol, the first 6 digits of a 30-digit session ID identify the originating bank!
  if (sessionId.length >= 6) {
    const bankFromCode = lookupCbnBank(sessionId.substring(0, 6));
    if (bankFromCode) {
      senderBank = bankFromCode.name;
    }
  }

  // 3. Contextual Sender vs Receiver Bank from labeled lines
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:Sender\s*Bank|Source\s*Bank|Originating\s*Bank|Debit\s*Bank|From\s*Bank)[:\s]*(.*)/i.test(line)) {
      const match = line.replace(/(?:Sender\s*Bank|Source\s*Bank|Originating\s*Bank|Debit\s*Bank|From\s*Bank)[:\s]*/i, '').trim();
      const b = lookupCbnBank(match || line);
      if (b && !senderBank) senderBank = b.name;
    }
    if (/(?:Beneficiary\s*Bank|Recipient\s*Bank|Destination\s*Bank|Credit\s*Bank|To\s*Bank)[:\s]*(.*)/i.test(line)) {
      const match = line.replace(/(?:Beneficiary\s*Bank|Recipient\s*Bank|Destination\s*Bank|Credit\s*Bank|To\s*Bank)[:\s]*/i, '').trim();
      const b = lookupCbnBank(match || line);
      if (b) receiverBank = b.name;
    }
  }

  // 4. Secondary bank detection across text if sender or receiver bank is still undetermined
  const lowerText = text.toLowerCase();
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

  // If sender bank is still undetermined, default to a neutral label
  if (!senderBank) {
    senderBank = 'Nigerian Commercial Bank';
  }
  if (!receiverBank) {
    receiverBank = 'Inter-Bank Beneficiary';
  }

  // 5. Robust Amount extraction
  amount = extractAmountRobust(text);

  // 6. Sender & Receiver Name heuristic
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(?:Sender(?:\s*(?:Name|Details?))?|From|Payer|Debit Account)[:\s]*(.*)/i.test(line)) {
      const match = line.replace(/(?:Sender(?:\s*(?:Name|Details?))?|From|Payer|Debit Account)[:\s]*/i, '').trim();
      if (match.length > 2 && !/^(Bank|Transfer|Session|Transaction)/i.test(match)) {
        senderName = match;
      } else if (i + 1 < lines.length && lines[i + 1].length > 2) {
        senderName = lines[i + 1];
      }
    }
    if (/(?:Beneficiary(?:\s*(?:Name|Details?))?|Recipient(?:\s*(?:Name|Details?))?|To|Credit Account)[:\s]*(.*)/i.test(line)) {
      const match = line.replace(/(?:Beneficiary(?:\s*(?:Name|Details?))?|Recipient(?:\s*(?:Name|Details?))?|To|Credit Account)[:\s]*/i, '').trim();
      if (match.length > 2 && !/^(Bank|Transfer|Session|Transaction)/i.test(match)) {
        receiverName = match;
      } else if (i + 1 < lines.length && lines[i + 1].length > 2) {
        receiverName = lines[i + 1];
      }
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

  // 7. Date / Timestamp extraction
  const dateMatch = text.match(/([0-9]{4}-[0-9]{2}-[0-9]{2}[\sT][0-9]{2}:[0-9]{2}(?::[0-9]{2})?)/)
    || text.match(/([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?)/)
    || text.match(/(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{1,2}(?:st|nd|rd|th)?[\s,]+[0-9]{4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?)/i)
    || text.match(/([0-9]{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{4}(?:\s+[0-9]{1,2}:[0-9]{2}(?::[0-9]{2})?)?)/i);

  if (dateMatch && dateMatch[0]) {
    receiptTimestamp = dateMatch[0];
  } else if (sessionId.length >= 18) {
    // Determine whether timestamp starts at index 6 (Canonical 30-digit NIP) or index 0 (FinTech Direct)
    const bankCodeCheck = lookupCbnBank(sessionId.substring(0, 6));
    const timeSeg = bankCodeCheck ? sessionId.substring(6, 18) : sessionId.substring(0, 12);
    if (timeSeg.length === 12) {
      const yy = timeSeg.substring(0, 2);
      const mm = timeSeg.substring(2, 4);
      const dd = timeSeg.substring(4, 6);
      const hh = timeSeg.substring(6, 8);
      const min = timeSeg.substring(8, 10);
      const ss = timeSeg.substring(10, 12);
      const yNum = parseInt(yy, 10);
      const mNum = parseInt(mm, 10);
      const dNum = parseInt(dd, 10);
      if (yNum >= 20 && yNum <= 35 && mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
        receiptTimestamp = `20${yy}-${mm}-${dd} ${hh}:${min}:${ss} WAT`;
      }
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
    apiKey?: string;
    customGeminiKey?: string;
    onProgress?: (percent: number, stepText: string) => void;
  }
): Promise<ExtractedReceiptData> {
  const customKey = options?.apiKey || options?.customGeminiKey || localStorage.getItem('gemini_api_key') || localStorage.getItem('dualverifier_gemini_api_key') || '';

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
        options?.onProgress?.(100, 'Vision extraction complete');
        const rawSid = (data.extracted.sessionId || '').replace(/[^0-9]/g, '');
        // Resolve bank from session ID prefix if present
        const resolvedBank = rawSid.length >= 6 ? lookupCbnBank(rawSid.substring(0, 6)) : null;

        return {
          sessionId: rawSid,
          senderBank: data.extracted.senderBank || (resolvedBank ? resolvedBank.name : 'Nigerian Commercial Bank'),
          senderName: data.extracted.senderName || 'Verified Sender',
          receiverBank: data.extracted.receiverBank || 'Inter-Bank Beneficiary',
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

    // Resolve bank from session ID code
    const resolvedBank = (parsed.sessionId && parsed.sessionId.length >= 6)
      ? lookupCbnBank(parsed.sessionId.substring(0, 6))
      : null;

    const senderBank = parsed.senderBank && parsed.senderBank !== 'Nigerian Commercial Bank'
      ? parsed.senderBank
      : (resolvedBank ? resolvedBank.name : 'Nigerian Commercial Bank');

    return {
      sessionId: parsed.sessionId || '',
      senderBank,
      senderName: parsed.senderName || 'Account Holder',
      receiverBank: parsed.receiverBank || 'Inter-Bank Beneficiary',
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
      senderBank: 'Nigerian Commercial Bank',
      senderName: 'Account Holder',
      receiverBank: 'Inter-Bank Beneficiary',
      receiverName: 'Settled Beneficiary',
      receiverAccount: '••••••••••',
      amount: 0,
      currency: 'NGN',
      ocrEngine: 'Deterministic Byte Scanner',
      confidenceNotes: 'Could not auto-read text from image. Please enter the receipt Session ID manually below.'
    };
  }
}
