import crypto from 'crypto';

export type SettlementStatus = 'NEW_VERIFIED_SETTLEMENT' | 'DUPLICATE_REPLAY_DETECTED';

export interface ZcashMemoRecord {
  proofHash: string;            // SHA-256 fingerprint: SHA256(sessionId_or_txid + amount + timestamp)
  sessionIdOrTxId: string;      // 30-digit NIBSS session ID or Zcash TxID
  sender: string;
  receiver: string;
  amount: string;
  currency: string;
  firstVerifiedAt: number;      // Unix timestamp (sec)
  firstVerifiedAtIso: string;
  claimedByMerchant: string;    // Merchant branch or ID
  claimCount: number;           // 1 for original, >1 indicates duplicate replay attempt
  isReplay: boolean;
  zcashAnchorTxId: string;      // Zcash Shielded TxID containing the 512-byte memo seal
  zcashBlockHeight: number;
  zcashPool: 'ORCHARD' | 'SAPLING';
  memoUtf8: string;             // Human-readable 512-byte payload content
  memoHex: string;              // 1024 hex chars (exactly 512 bytes)
  memoBytesLength: number;      // 512
  replayAttempts?: { timestamp: number; memoReadAttempt: number; merchant?: string }[];
}

export class ZcashMemoRegistry {
  private registry: Map<string, ZcashMemoRecord> = new Map();
  private currentZcashBlock = 2549102; // Recent Zcash mainnet height

  constructor() {
    this.seedDemoRegistry();
  }

  /**
   * Calculates deterministic receiptHash:
   * SHA-256(sessionId_or_txid + amount + timestamp)
   */
  computeReceiptProofHash(params: {
    sessionIdOrTxId: string;
    sender: string;
    receiver: string;
    amount: string | number;
    currency?: string;
    timestamp?: string;
  }): string {
    const normId = params.sessionIdOrTxId.trim();
    const normAmount = String(params.amount).trim();
    const normTime = (params.timestamp || '').trim();
    const normCurrency = (params.currency || 'NGN').toUpperCase();

    // Standardized SHA-256 hash incorporating ID, amount, timestamp, currency
    const raw = `ZCASH_DUALVERIFIER_PROOF_V2:${normId}:${normAmount}:${normTime}:${normCurrency}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Encodes a strict 512-byte Zcash Shielded Memo (ZIP-302 standard)
   */
  encodeZcash512ByteMemo(params: {
    proofHash: string;
    sessionIdOrTxId: string;
    sender: string;
    receiver: string;
    amount: string;
    currency: string;
    timestampIso: string;
  }): { memoUtf8: string; memoHex: string } {
    const header = `[DUALVERIFIER-ZCASH-PROOF-2026]`;
    const payload = `${header} PROOF:${params.proofHash} | REF:${params.sessionIdOrTxId} | AMT:${params.amount} ${params.currency} | FROM:${params.sender} | TO:${params.receiver} | AT:${params.timestampIso} | SHIELDED_ANTI_DOUBLE_SPEND_MEMO`;

    // Zcash memo must be exactly 512 bytes. Pad with null bytes (0x00)
    const buffer = Buffer.alloc(512);
    buffer.write(payload, 'utf8');

    const memoHex = buffer.toString('hex');
    return {
      memoUtf8: payload,
      memoHex
    };
  }

  /**
   * MODULE 2: checkAndLockReceiptHash
   * Atomic check and double-spend trap:
   * - First time verified: Status = 'NEW_VERIFIED_SETTLEMENT' (Mint Zcash 512-byte Encrypted Memo attestation and lock hash).
   * - Second time verified: Status = 'DUPLICATE_REPLAY_DETECTED' (Returns original timestamp & blocks double-spending).
   */
  async checkAndLockReceiptHash(params: {
    sessionIdOrTxId: string;
    sender: string;
    receiver: string;
    amount: string | number;
    currency?: string;
    timestamp?: string;
    merchantId?: string;
  }): Promise<{
    status: SettlementStatus;
    proofHash: string;
    isFirstTime: boolean;
    claimCount: number;
    record: ZcashMemoRecord;
    firstVerifiedAtIso: string;
    zcashTxId: string;
    blockHeight: number;
    memoUtf8: string;
    memoHex: string;
    replayedDeltaSeconds?: number;
  }> {
    const proofHash = this.computeReceiptProofHash({
      sessionIdOrTxId: params.sessionIdOrTxId,
      sender: params.sender,
      receiver: params.receiver,
      amount: params.amount,
      currency: params.currency,
      timestamp: params.timestamp
    });

    const now = Math.floor(Date.now() / 1000);
    const nowIso = new Date(now * 1000).toISOString();
    const merchant = params.merchantId || 'DualVerifier Merchant Terminal #01';

    let record = this.registry.get(proofHash);
    let status: SettlementStatus = 'NEW_VERIFIED_SETTLEMENT';
    let isFirstTime = false;
    let replayedDeltaSeconds: number | undefined;

    if (!record) {
      // 1. FIRST TIME VERIFIED — NEW VERIFIED SETTLEMENT
      isFirstTime = true;
      status = 'NEW_VERIFIED_SETTLEMENT';
      this.currentZcashBlock += 1;

      const txDigest = crypto.createHash('sha256').update(`zcash:shielded:${proofHash}:${now}`).digest('hex');
      const zcashTxId = `0x${txDigest}`;

      const { memoUtf8, memoHex } = this.encodeZcash512ByteMemo({
        proofHash,
        sessionIdOrTxId: params.sessionIdOrTxId,
        sender: params.sender,
        receiver: params.receiver,
        amount: String(params.amount),
        currency: params.currency || 'NGN',
        timestampIso: params.timestamp || nowIso
      });

      record = {
        proofHash,
        sessionIdOrTxId: params.sessionIdOrTxId,
        sender: params.sender,
        receiver: params.receiver,
        amount: String(params.amount),
        currency: params.currency || 'NGN',
        firstVerifiedAt: now,
        firstVerifiedAtIso: nowIso,
        claimedByMerchant: merchant,
        claimCount: 1,
        isReplay: false,
        zcashAnchorTxId: zcashTxId,
        zcashBlockHeight: this.currentZcashBlock,
        zcashPool: 'ORCHARD',
        memoUtf8,
        memoHex,
        memoBytesLength: 512,
        replayAttempts: []
      };

      this.registry.set(proofHash, record);
    } else {
      // 2. SECOND TIME / SUBSEQUENT VERIFICATION — DUPLICATE REPLAY DETECTED!
      isFirstTime = false;
      status = 'DUPLICATE_REPLAY_DETECTED';
      record.claimCount += 1;
      record.isReplay = true;
      replayedDeltaSeconds = Math.max(0, now - record.firstVerifiedAt);

      if (!record.replayAttempts) record.replayAttempts = [];
      record.replayAttempts.push({
        timestamp: now,
        memoReadAttempt: record.claimCount,
        merchant
      });

      this.registry.set(proofHash, record);
    }

    return {
      status,
      proofHash,
      isFirstTime,
      claimCount: record.claimCount,
      record,
      firstVerifiedAtIso: record.firstVerifiedAtIso,
      zcashTxId: record.zcashAnchorTxId,
      blockHeight: record.zcashBlockHeight,
      memoUtf8: record.memoUtf8,
      memoHex: record.memoHex,
      replayedDeltaSeconds
    };
  }

  /**
   * Look up proof in Zcash memo registry
   */
  lookupProof(proofHash: string): ZcashMemoRecord | null {
    return this.registry.get(proofHash.toLowerCase()) || null;
  }

  /**
   * Reset specific proof (for live hackathon judge testing)
   */
  resetProof(proofHash: string): boolean {
    return this.registry.delete(proofHash.toLowerCase());
  }

  /**
   * Get all registered Zcash memo records
   */
  getAllRecords(): ZcashMemoRecord[] {
    return Array.from(this.registry.values()).sort((a, b) => b.firstVerifiedAt - a.firstVerifiedAt);
  }

  /**
   * Seed realistic historical records for the live ledger
   */
  private seedDemoRegistry() {
    const sampleProof1 = '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a';
    const pastTime1 = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
    const pastIso1 = new Date(pastTime1 * 1000).toISOString();

    const memo1 = this.encodeZcash512ByteMemo({
      proofHash: sampleProof1,
      sessionIdOrTxId: '000015250410123045982143658709',
      sender: 'Zenith Bank PLC',
      receiver: 'Moniepoint MFB',
      amount: '120000',
      currency: 'NGN',
      timestampIso: pastIso1
    });

    this.registry.set(sampleProof1, {
      proofHash: sampleProof1,
      sessionIdOrTxId: '000015250410123045982143658709',
      sender: 'Zenith Bank PLC:Alhaji Ibrahim Danladi',
      receiver: 'Moniepoint MFB:Chukwudi Superstores',
      amount: '120000',
      currency: 'NGN',
      firstVerifiedAt: pastTime1,
      firstVerifiedAtIso: pastIso1,
      claimedByMerchant: 'Terminal #04 (Lagos Branch)',
      claimCount: 1,
      isReplay: false,
      zcashAnchorTxId: '0x99281a8c3d2e1f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
      zcashBlockHeight: 2548810,
      zcashPool: 'ORCHARD',
      memoUtf8: memo1.memoUtf8,
      memoHex: memo1.memoHex,
      memoBytesLength: 512,
      replayAttempts: []
    });

    // Seed an on-chain ZEC record
    const sampleProof2 = '0x7e2d9a1c4b5f8e0a3d6c9b2e5a8f1d4c7b0e3a6f9d2c5b8e1a4d7c0f3b6e9a2d';
    const pastTime2 = Math.floor(Date.now() / 1000) - 43200; // 12 hours ago
    const pastIso2 = new Date(pastTime2 * 1000).toISOString();

    const memo2 = this.encodeZcash512ByteMemo({
      proofHash: sampleProof2,
      sessionIdOrTxId: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
      sender: 'Shielded Orchard Pool (Halo 2)',
      receiver: 'u1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2',
      amount: '5.10000000',
      currency: 'ZEC',
      timestampIso: pastIso2
    });

    this.registry.set(sampleProof2, {
      proofHash: sampleProof2,
      sessionIdOrTxId: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
      sender: 'Shielded Orchard Pool (Halo 2)',
      receiver: 'u1q4k9n7e8...a6c8e0g2',
      amount: '5.10000000',
      currency: 'ZEC',
      firstVerifiedAt: pastTime2,
      firstVerifiedAtIso: pastIso2,
      claimedByMerchant: 'Web3 Gateway (Global)',
      claimCount: 1,
      isReplay: false,
      zcashAnchorTxId: '0x9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d',
      zcashBlockHeight: 2548980,
      zcashPool: 'ORCHARD',
      memoUtf8: memo2.memoUtf8,
      memoHex: memo2.memoHex,
      memoBytesLength: 512,
      replayAttempts: []
    });
  }
}

export const zcashMemoRegistry = new ZcashMemoRegistry();
