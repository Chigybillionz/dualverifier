import crypto from 'crypto';

export interface ZcashMemoRecord {
  proofHash: string;            // SHA-256 fingerprint of the Web2 receipt
  sessionId: string;            // 30-digit NIBSS session ID
  sender: string;
  receiver: string;
  amount: string;
  currency: string;
  firstAnchoredAt: number;      // Unix timestamp (sec)
  firstAnchoredIso: string;
  claimCount: number;           // 1 for original, >1 indicates replay attack
  isReplay: boolean;
  zcashAnchorTxId: string;      // Simulated/real Zcash Shielded TxID containing the memo
  zcashBlockHeight: number;
  zcashPool: 'ORCHARD' | 'SAPLING';
  memoUtf8: string;             // Human-readable 512-byte payload content
  memoHex: string;              // 1024 hex chars (exactly 512 bytes)
  memoBytesLength: number;      // 512
  replayAttempts?: { timestamp: number; memoReadAttempt: number }[];
}

export class ZcashMemoRegistry {
  private registry: Map<string, ZcashMemoRecord> = new Map();
  private currentZcashBlock = 2549102; // Recent Zcash mainnet height

  constructor() {
    this.seedDemoRegistry();
  }

  /**
   * Calculates deterministic SHA-256 receipt fingerprint
   */
  computeReceiptProofHash(params: {
    sessionId: string;
    sender: string;
    receiver: string;
    amount: string | number;
    currency?: string;
  }): string {
    const normSession = params.sessionId.trim();
    const normSender = params.sender.trim().toLowerCase();
    const normReceiver = params.receiver.trim().toLowerCase();
    const normAmount = String(params.amount).trim();
    const normCurrency = (params.currency || 'NGN').toUpperCase();

    const raw = `ZCASH_DUALVERIFIER:${normSession}:${normSender}:${normReceiver}:${normAmount}:${normCurrency}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Formats structured anti-replay proof into a strict 512-byte Zcash Shielded Memo
   * (Zcash ZIP-302 standard specifies 512 bytes for shielded note memos)
   */
  encodeZcash512ByteMemo(params: {
    proofHash: string;
    sessionId: string;
    sender: string;
    receiver: string;
    amount: string;
    currency: string;
    timestampIso: string;
  }): { memoUtf8: string; memoHex: string } {
    const header = `[DUALVERIFIER-ZCASH-PROOF-V1]`;
    const payload = `${header} PROOF:${params.proofHash} | NIBSS:${params.sessionId} | AMT:${params.amount} ${params.currency} | FROM:${params.sender} | TO:${params.receiver} | AT:${params.timestampIso} | SHIELDED_ANTI_REPLAY_MEMO`;

    // A Zcash memo is exactly 512 bytes. We convert string to Buffer and zero-pad to 512 bytes.
    const buffer = Buffer.alloc(512);
    buffer.write(payload, 'utf8');

    const memoHex = buffer.toString('hex');
    return {
      memoUtf8: payload,
      memoHex
    };
  }

  /**
   * Anchors receipt proof hash into Zcash Shielded Memo registry
   */
  async anchorReceiptProof(params: {
    sessionId: string;
    sender: string;
    receiver: string;
    amount: string | number;
    currency?: string;
    receiptTimestamp?: string;
  }): Promise<{
    proofHash: string;
    isFirstTime: boolean;
    claimCount: number;
    record: ZcashMemoRecord;
    zcashTxId: string;
    blockHeight: number;
    memoUtf8: string;
    memoHex: string;
  }> {
    const proofHash = this.computeReceiptProofHash({
      sessionId: params.sessionId,
      sender: params.sender,
      receiver: params.receiver,
      amount: params.amount,
      currency: params.currency
    });

    const now = Math.floor(Date.now() / 1000);
    const nowIso = new Date(now * 1000).toISOString();

    let record = this.registry.get(proofHash);
    let isFirstTime = false;

    if (!record) {
      // First-time authentic verification
      isFirstTime = true;
      this.currentZcashBlock += 1;

      // Deterministic Zcash TxID generated from proofHash
      const txDigest = crypto.createHash('sha256').update(`zcash:shielded:${proofHash}:${now}`).digest('hex');
      const zcashTxId = `0x${txDigest}`;

      const { memoUtf8, memoHex } = this.encodeZcash512ByteMemo({
        proofHash,
        sessionId: params.sessionId,
        sender: params.sender,
        receiver: params.receiver,
        amount: String(params.amount),
        currency: params.currency || 'NGN',
        timestampIso: params.receiptTimestamp || nowIso
      });

      record = {
        proofHash,
        sessionId: params.sessionId,
        sender: params.sender,
        receiver: params.receiver,
        amount: String(params.amount),
        currency: params.currency || 'NGN',
        firstAnchoredAt: now,
        firstAnchoredIso: nowIso,
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
      // REPLAY ATTACK INTERCEPTED!
      isFirstTime = false;
      record.claimCount += 1;
      record.isReplay = true;
      if (!record.replayAttempts) record.replayAttempts = [];
      record.replayAttempts.push({
        timestamp: now,
        memoReadAttempt: record.claimCount
      });
      this.registry.set(proofHash, record);
    }

    return {
      proofHash,
      isFirstTime,
      claimCount: record.claimCount,
      record,
      zcashTxId: record.zcashAnchorTxId,
      blockHeight: record.zcashBlockHeight,
      memoUtf8: record.memoUtf8,
      memoHex: record.memoHex
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
    return Array.from(this.registry.values()).sort((a, b) => b.firstAnchoredAt - a.firstAnchoredAt);
  }

  /**
   * Seed a sample historical record
   */
  private seedDemoRegistry() {
    const sampleProof = '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a';
    const pastTime = Math.floor(Date.now() / 1000) - 86400;

    const { memoUtf8, memoHex } = this.encodeZcash512ByteMemo({
      proofHash: sampleProof,
      sessionId: '000015250410123045982143658709',
      sender: 'Zenith Bank PLC',
      receiver: 'Moniepoint MFB',
      amount: '120000',
      currency: 'NGN',
      timestampIso: new Date(pastTime * 1000).toISOString()
    });

    this.registry.set(sampleProof, {
      proofHash: sampleProof,
      sessionId: '000015250410123045982143658709',
      sender: 'Zenith Bank PLC',
      receiver: 'Moniepoint MFB',
      amount: '120000',
      currency: 'NGN',
      firstAnchoredAt: pastTime,
      firstAnchoredIso: new Date(pastTime * 1000).toISOString(),
      claimCount: 1,
      isReplay: false,
      zcashAnchorTxId: '0x99281a8c3d2e1f4b5a6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
      zcashBlockHeight: 2548810,
      zcashPool: 'ORCHARD',
      memoUtf8,
      memoHex,
      memoBytesLength: 512,
      replayAttempts: []
    });
  }
}

export const zcashMemoRegistry = new ZcashMemoRegistry();
