import crypto from 'crypto';

export interface VerificationRecord {
  proofHash: string;            // 0x + 64 hex chars (SHA-256)
  railType: 1 | 2;              // 1 = LOCAL_BANK_NIBSS, 2 = ONCHAIN_WEB3
  verifierOracle: string;       // Oracle signer address
  verifiedAt: number;           // Unix timestamp (seconds)
  verifiedAtFormatted: string;  // Human readable ISO
  verificationCount: number;    // 1 for original, >1 indicates replay attempt
  routingSummary: string;       // e.g. "GTB->OPAY:NGN:50000" or "USDC:BASE:250"
  attestationTxHash: string;    // On-chain transaction hash
  blockNumber: number;
  network: string;
  isReplay: boolean;
  replayHistory?: { timestamp: number; ipOrUser?: string }[];
}

export interface AnchorRequest {
  railType: 1 | 2;
  identifier: string; // 30-digit NIBSS Session ID or On-chain Tx Hash
  sender: string;
  receiver: string;
  amount: string | number;
  currencyOrToken: string;
  routingSummary?: string;
}

export interface AnchorResult {
  proofHash: string;
  isFirstTime: boolean;
  verificationCount: number;
  firstVerifiedAt: number;
  firstVerifiedAtFormatted: string;
  attestationTxHash: string;
  blockNumber: number;
  contractAddress: string;
  explorerUrl: string;
  record: VerificationRecord;
}

export class ContractRegistryService {
  // Default oracle address representing DualVerifier Backend Signer
  private oracleAddress = '0x1A2B3C4D5E6F708192aBcDeF1234567890aBcDeF';
  private contractAddress = '0x89C5420A861066B3F0230fEAbcA3f885e3532729'; // DualVerifierRegistry on Base Sepolia
  private registryStore: Map<string, VerificationRecord> = new Map();
  private blockCounter = 21950400;

  constructor() {
    this.seedInitialState();
  }

  /**
   * Computes SHA-256 proofHash as specified in PRD Section 4:
   * SHA-256(railType + sessionIdOrTxHash + sender + receiver + amount)
   */
  computeProofHash(params: {
    railType: 1 | 2;
    identifier: string;
    sender: string;
    receiver: string;
    amount: string | number;
  }): string {
    const normIdentifier = params.identifier.trim().toLowerCase();
    const normSender = params.sender.trim().toLowerCase();
    const normReceiver = params.receiver.trim().toLowerCase();
    const normAmount = String(params.amount).trim();

    const payload = `${params.railType}:${normIdentifier}:${normSender}:${normReceiver}:${normAmount}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Anchors a verification proof on-chain or updates claim counter if replayed
   */
  async anchorProof(req: AnchorRequest): Promise<AnchorResult> {
    const proofHash = this.computeProofHash({
      railType: req.railType,
      identifier: req.identifier,
      sender: req.sender,
      receiver: req.receiver,
      amount: req.amount
    });

    const now = Math.floor(Date.now() / 1000);
    const summary = req.routingSummary || `${req.sender}->${req.receiver}:${req.currencyOrToken}:${req.amount}`;

    let record = this.registryStore.get(proofHash);
    let isFirstTime = false;

    if (!record) {
      // First-time authentic verification
      isFirstTime = true;
      this.blockCounter += 1;

      // Deterministic pseudo-txHash based on proofHash + timestamp
      const txDigest = crypto.createHash('sha256').update(`attest:${proofHash}:${now}`).digest('hex');
      const attestationTxHash = `0x${txDigest}`;

      record = {
        proofHash,
        railType: req.railType,
        verifierOracle: this.oracleAddress,
        verifiedAt: now,
        verifiedAtFormatted: new Date(now * 1000).toISOString(),
        verificationCount: 1,
        routingSummary: summary,
        attestationTxHash,
        blockNumber: this.blockCounter,
        network: 'Base Sepolia (L2)',
        isReplay: false,
        replayHistory: []
      };

      this.registryStore.set(proofHash, record);
    } else {
      // Replay attack intercepted!
      isFirstTime = false;
      record.verificationCount += 1;
      record.isReplay = true;
      if (!record.replayHistory) record.replayHistory = [];
      record.replayHistory.push({ timestamp: now });
      this.registryStore.set(proofHash, record);
    }

    const explorerUrl = `https://sepolia.basescan.org/tx/${record.attestationTxHash}`;

    return {
      proofHash,
      isFirstTime,
      verificationCount: record.verificationCount,
      firstVerifiedAt: record.verifiedAt,
      firstVerifiedAtFormatted: record.verifiedAtFormatted,
      attestationTxHash: record.attestationTxHash,
      blockNumber: record.blockNumber,
      contractAddress: this.contractAddress,
      explorerUrl,
      record
    };
  }

  /**
   * Look up proof status by proofHash
   */
  lookupProof(proofHash: string): VerificationRecord | null {
    return this.registryStore.get(proofHash.toLowerCase()) || null;
  }

  /**
   * Reset or clear specific proof (useful for testing replay scenarios)
   */
  resetProof(proofHash: string): boolean {
    return this.registryStore.delete(proofHash.toLowerCase());
  }

  /**
   * Return all anchored records sorted newest first
   */
  getAllRecords(): VerificationRecord[] {
    return Array.from(this.registryStore.values()).sort((a, b) => b.verifiedAt - a.verifiedAt);
  }

  /**
   * Seeds demo data so that the app immediately has verifiable history
   */
  private seedInitialState() {
    // We leave clean so user can execute the stage demo steps fresh, or seed 1 past record
    const pastTx = '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b';
    const pastProof = this.computeProofHash({
      railType: 2,
      identifier: pastTx,
      sender: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
      receiver: '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB',
      amount: '500'
    });

    const seedTime = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
    this.registryStore.set(pastProof, {
      proofHash: pastProof,
      railType: 2,
      verifierOracle: this.oracleAddress,
      verifiedAt: seedTime,
      verifiedAtFormatted: new Date(seedTime * 1000).toISOString(),
      verificationCount: 2, // Already replayed once as test
      routingSummary: 'USDC:BASE:500 (Pre-audited Demo)',
      attestationTxHash: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      blockNumber: 21941200,
      network: 'Base Sepolia (L2)',
      isReplay: true,
      replayHistory: [{ timestamp: seedTime + 3600 }]
    });
  }
}

export const contractRegistry = new ContractRegistryService();

