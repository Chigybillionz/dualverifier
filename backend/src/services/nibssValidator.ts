import { lookupBankByNameOrCode, CBNBankInfo } from './cbnRegistry.js';

export interface NIBSSValidationResult {
  rawSessionId: string;
  isFormatValid: boolean;
  formatErrors: string[];
  bankCodeSegment: {
    raw: string;
    resolvedBank: CBNBankInfo | null;
    claimedBankMatches: boolean;
    claimedBankName?: string;
    warning?: string;
  };
  timestampSegment: {
    raw: string;
    parsedIso: string;
    parsedHuman: string;
    parsedDate: Date | null;
    isValidDate: boolean;
    receiptTimeClaimed?: string;
    deltaSeconds?: number;
    isTimeTampered: boolean;
    timeTamperReason?: string;
  };
  serialEntropySegment: {
    raw: string;
    entropyScore: number; // 0 to 100
    isSuspicious: boolean;
    hasRepeatingPattern: boolean;
    hasSequentialPattern: boolean;
    suspiciousReason?: string;
  };
  overallVerdict: 'AUTHENTIC' | 'SUSPICIOUS_TAMPERED' | 'INVALID_SYNTAX';
  flags: string[];
}

/**
 * Calculates Shannon entropy of a numeric string
 */
function calculateShannonEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy; // For 10 digits (0-9), max entropy is log2(10) ≈ 3.32 bits
}

/**
 * Checks for repeating single characters or simple repeated sequences (e.g. "111111111111", "121212121212")
 */
function hasRepetitivePattern(str: string): boolean {
  // All same digit
  if (/^(\d)\1+$/.test(str)) return true;
  // Two-digit repeating (e.g. 121212121212)
  if (/^(\d{2})\1+$/.test(str)) return true;
  // Three-digit repeating (e.g. 123123123123)
  if (/^(\d{3})\1+$/.test(str)) return true;

  // Max frequency of any single digit in 12 chars: if >= 9 out of 12, heavily biased
  const counts: Record<string, number> = {};
  for (const c of str) counts[c] = (counts[c] || 0) + 1;
  if (Object.values(counts).some(c => c >= 9)) return true;

  return false;
}

/**
 * Checks for ascending or descending sequential patterns (e.g. "123456789012" or "987654321098")
 */
function hasSequentialPattern(str: string): boolean {
  const ascending = '01234567890123456789';
  const descending = '98765432109876543210';
  if (ascending.includes(str) || descending.includes(str)) return true;

  // Check if at least 7 consecutive numbers are in sequence
  let sequentialCount = 1;
  for (let i = 1; i < str.length; i++) {
    const prev = parseInt(str[i - 1], 10);
    const curr = parseInt(str[i], 10);
    if ((prev + 1) % 10 === curr || (prev - 1 + 10) % 10 === curr) {
      sequentialCount++;
      if (sequentialCount >= 7) return true;
    } else {
      sequentialCount = 1;
    }
  }
  return false;
}

/**
 * Parse NIBSS 12-digit timestamp: YYMMDDHHMMSS (WAT / UTC+1)
 */
function parseNibssTimestamp(segment: string): { date: Date | null; iso: string; human: string; isValid: boolean } {
  if (segment.length !== 12 || !/^\d{12}$/.test(segment)) {
    return { date: null, iso: '', human: 'Invalid timestamp format', isValid: false };
  }

  const yy = parseInt(segment.substring(0, 2), 10);
  const mm = parseInt(segment.substring(2, 4), 10);
  const dd = parseInt(segment.substring(4, 6), 10);
  const hh = parseInt(segment.substring(6, 8), 10);
  const min = parseInt(segment.substring(8, 10), 10);
  const ss = parseInt(segment.substring(10, 12), 10);

  // Reasonable year check (2020 - 2035)
  const fullYear = 2000 + yy;
  if (fullYear < 2020 || fullYear > 2035 || mm < 1 || mm > 12 || dd < 1 || dd > 31 || hh > 23 || min > 59 || ss > 59) {
    return { date: null, iso: '', human: 'Out of range date values', isValid: false };
  }

  // NIBSS timestamps are in Nigeria Time (WAT = UTC+1)
  // Construct ISO string with +01:00 offset
  const pad = (n: number) => n.toString().padStart(2, '0');
  const isoStr = `${fullYear}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${pad(min)}:${pad(ss)}+01:00`;
  const dateObj = new Date(isoStr);

  if (isNaN(dateObj.getTime())) {
    return { date: null, iso: '', human: 'Invalid calendar date', isValid: false };
  }

  const human = dateObj.toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    dateStyle: 'medium',
    timeStyle: 'medium'
  });

  return { date: dateObj, iso: isoStr, human, isValid: true };
}

/**
 * Main Deterministic 30-Digit NIBSS Session ID Validator
 */
export function validateNibssSessionId(
  sessionIdInput: string,
  claimedSenderBank?: string,
  claimedReceiptTime?: string | Date
): NIBSSValidationResult {
  // Strip whitespace, hyphens, and non-digit noise
  const cleanId = (sessionIdInput || '').replace(/[^0-9]/g, '');
  const flags: string[] = [];
  const formatErrors: string[] = [];

  const isExact30 = cleanId.length === 30;
  if (!isExact30) {
    formatErrors.push(`Session ID must be exactly 30 numeric digits (got ${cleanId.length} digits)`);
  }

  // Default empty segments if truncated
  const bankSegment = cleanId.substring(0, 6);
  const timeSegment = cleanId.substring(6, 18);
  const serialSegment = cleanId.substring(18, 30);

  // 1. Bank Code Slicing (Digits 1-6)
  const resolvedBank = lookupBankByNameOrCode(bankSegment);
  let claimedBankMatches = true;
  let bankWarning: string | undefined;

  if (cleanId.length >= 6) {
    if (!resolvedBank) {
      flags.push(`Unknown CBN Institution Code [${bankSegment}]. Not registered with NIBSS routing directory.`);
      bankWarning = `Unknown Bank Code ${bankSegment}`;
    } else if (claimedSenderBank) {
      const claimedResolved = lookupBankByNameOrCode(claimedSenderBank);
      if (claimedResolved && claimedResolved.code !== resolvedBank.code) {
        claimedBankMatches = false;
        const msg = `FORGERY DETECTED: Receipt claims sender is [${claimedSenderBank}] (${claimedResolved.shortName}), but NIBSS Session ID code [${bankSegment}] mathematically routes to [${resolvedBank.name}]!`;
        flags.push(msg);
        bankWarning = msg;
      }
    }
  }

  // 2. Timestamp Slicing (Digits 7-18)
  const parsedTime = parseNibssTimestamp(timeSegment);
  let isTimeTampered = false;
  let timeTamperReason: string | undefined;
  let deltaSeconds: number | undefined;

  if (!parsedTime.isValid) {
    flags.push(`Invalid execution timestamp encoded in digits 7-18: [${timeSegment}]`);
    isTimeTampered = true;
    timeTamperReason = 'NIBSS Session ID timestamp segment is non-chronological or corrupted.';
  } else if (claimedReceiptTime && parsedTime.date) {
    let claimedDate: Date;
    if (typeof claimedReceiptTime === 'string') {
      claimedDate = new Date(claimedReceiptTime);
    } else {
      claimedDate = claimedReceiptTime;
    }

    if (!isNaN(claimedDate.getTime())) {
      deltaSeconds = Math.abs(Math.floor((parsedTime.date.getTime() - claimedDate.getTime()) / 1000));
      // PRD Step 2: A mismatch greater than 120 seconds triggers a tamper alert
      if (deltaSeconds > 120) {
        isTimeTampered = true;
        timeTamperReason = `TIMESTAMP TAMPER ALERT: Visual receipt timestamp differs from cryptographic NIBSS timestamp by ${deltaSeconds}s (threshold: 120s max).`;
        flags.push(timeTamperReason);
      }
    }
  }

  // 3. 12-Digit Serial Entropy Check (Digits 19-30)
  const entropy = calculateShannonEntropy(serialSegment);
  const maxPossibleEntropy = 3.32; // log2(10)
  const entropyScore = Math.min(100, Math.max(0, Math.round((entropy / maxPossibleEntropy) * 100)));
  const repeating = hasRepetitivePattern(serialSegment);
  const sequential = hasSequentialPattern(serialSegment);

  let isSuspiciousEntropy = false;
  let suspiciousReason: string | undefined;

  if (cleanId.length === 30) {
    if (repeating) {
      isSuspiciousEntropy = true;
      suspiciousReason = `Low Entropy: Detected synthetic repeating patterns in serial segment (${serialSegment}). Common signature of fake-alert generators.`;
      flags.push(suspiciousReason);
    } else if (sequential) {
      isSuspiciousEntropy = true;
      suspiciousReason = `Low Entropy: Detected sequential numbering in serial segment (${serialSegment}). NIBSS serials require pseudo-random cryptographic entropy.`;
      flags.push(suspiciousReason);
    } else if (entropyScore < 55) {
      isSuspiciousEntropy = true;
      suspiciousReason = `Sub-par randomness entropy score (${entropyScore}/100) in serial digits. High probability of algorithmic tampering.`;
      flags.push(suspiciousReason);
    }
  }

  // Overall Verdict Determination
  let overallVerdict: 'AUTHENTIC' | 'SUSPICIOUS_TAMPERED' | 'INVALID_SYNTAX' = 'AUTHENTIC';

  if (!isExact30 || !parsedTime.isValid) {
    overallVerdict = 'INVALID_SYNTAX';
  } else if (!claimedBankMatches || isTimeTampered || isSuspiciousEntropy || !resolvedBank) {
    overallVerdict = 'SUSPICIOUS_TAMPERED';
  }

  return {
    rawSessionId: cleanId,
    isFormatValid: isExact30 && parsedTime.isValid,
    formatErrors,
    bankCodeSegment: {
      raw: bankSegment,
      resolvedBank,
      claimedBankMatches,
      claimedBankName: claimedSenderBank,
      warning: bankWarning
    },
    timestampSegment: {
      raw: timeSegment,
      parsedIso: parsedTime.iso,
      parsedHuman: parsedTime.human,
      parsedDate: parsedTime.date,
      isValidDate: parsedTime.isValid,
      receiptTimeClaimed: claimedReceiptTime ? new Date(claimedReceiptTime).toISOString() : undefined,
      deltaSeconds,
      isTimeTampered,
      timeTamperReason
    },
    serialEntropySegment: {
      raw: serialSegment,
      entropyScore,
      isSuspicious: isSuspiciousEntropy,
      hasRepeatingPattern: repeating,
      hasSequentialPattern: sequential,
      suspiciousReason
    },
    overallVerdict,
    flags
  };
}

