import { Request, Response } from 'express';
import { validateNibssSessionId } from '../services/nibssValidator.js';
import { analyzeImageTampering } from '../services/tamperForensics.js';
import { geminiService } from '../services/geminiService.js';
import { blockchainService } from '../services/blockchainService.js';
import { contractRegistry } from '../services/contractRegistry.js';
import { lookupBankByNameOrCode, getAllCBNBanks } from '../services/cbnRegistry.js';
import { STAGE_DEMO_PRESETS } from '../data/presets.js';

export interface BlueCardPayload {
  rail: 'LOCAL_BANK' | 'ONCHAIN';
  status: 'VERIFIED' | 'TAMPERED' | 'DUPLICATE' | 'INVALID';
  badgeTitle: string;
  badgeColor: 'blue' | 'amber' | 'crimson';
  timestamp: string;
  proofHash: string;
  routingPipeline: {
    sender: {
      title: string;
      identifier: string;
      institutionOrWallet: string;
      bankLogoColor?: string;
      verified: boolean;
    };
    rail: {
      type: string;
      identifier: string;
      timestamp: string;
      protocol: string;
      verified: boolean;
    };
    receiver: {
      title: string;
      identifier: string;
      institutionOrWallet: string;
      amountFormatted: string;
      currency: string;
      verified: boolean;
    };
  };
  forensics: {
    nibssAnalysis?: any;
    imageTamperAnalysis?: any;
    geminiSummary?: string;
    onchainDetails?: any;
    flags: string[];
  };
  onchainAnchor: {
    proofHash: string;
    isAnchored: boolean;
    attestationTxHash: string;
    blockNumber: number;
    verificationCount: number;
    firstVerifiedAt: string;
    isReplayAttack: boolean;
    explorerUrl: string;
    contractAddress: string;
  };
}

export class VerifyController {
  /**
   * Rail 1: Local Bank Transfer Verification
   */
  async verifyLocalBank(req: Request, res: Response): Promise<void> {
    try {
      const file = req.file;
      let {
        sessionId,
        senderBank,
        senderName,
        receiverBank,
        receiverName,
        receiverAccount,
        amount,
        currency = 'NGN',
        receiptTimestamp,
        simulatedTamperScore,
        flaggedSoftware
      } = req.body;

      let tamperAnalysis: any = null;

      // 1. If file uploaded, run visual & EXIF tamper forensics and AI extraction
      if (file) {
        tamperAnalysis = await analyzeImageTampering(file.buffer, file.mimetype, file.originalname);
        const extracted = await geminiService.extractReceiptFields(file.buffer, file.mimetype, file.originalname);

        sessionId = sessionId || extracted.sessionId;
        senderBank = senderBank || extracted.senderBank;
        senderName = senderName || extracted.senderName;
        receiverBank = receiverBank || extracted.receiverBank;
        receiverName = receiverName || extracted.receiverName;
        receiverAccount = receiverAccount || extracted.receiverAccount;
        amount = amount || extracted.amount;
        receiptTimestamp = receiptTimestamp || extracted.receiptTimestamp;
      } else if (simulatedTamperScore !== undefined) {
        // Preset simulation support
        tamperAnalysis = {
          hasExifData: true,
          tamperRiskLevel: Number(simulatedTamperScore) < 50 ? 'FORGERY_DETECTED' : 'CLEAN',
          forensicScore: Number(simulatedTamperScore),
          flaggedSoftware: flaggedSoftware || undefined,
          metadataFlags: flaggedSoftware ? [`Software signature: ${flaggedSoftware}`] : [],
          exifDetails: { software: flaggedSoftware || 'None', fileFormat: 'image/png' },
          visualAnalysis: {
            fontConsistency: Number(simulatedTamperScore) < 50 ? 'MISMATCHED_WEIGHT' : 'NORMAL',
            pixelArtifacts: Number(simulatedTamperScore) < 50 ? 'EDIT_RESAMPLE_DETECTED' : 'CLEAN_UNCOMPRESSED',
            notes: ['Simulated forensic inspector executed.']
          }
        };
      }

      sessionId = (sessionId || '').replace(/[^0-9]/g, '');
      amount = Number(amount) || 0;
      senderBank = senderBank || 'Guaranty Trust Bank';
      senderName = senderName || 'Transfer Sender';
      receiverBank = receiverBank || 'OPay Digital Services';
      receiverName = receiverName || 'Merchant Recipient';
      receiverAccount = receiverAccount || '••••••••••';
      receiptTimestamp = receiptTimestamp || new Date().toISOString();

      // 2. Deterministic 30-digit NIBSS Session ID validation
      const nibssResult = validateNibssSessionId(sessionId, senderBank, receiptTimestamp);

      // Collect all forensic flags
      const allFlags: string[] = [
        ...nibssResult.flags,
        ...(tamperAnalysis?.metadataFlags || [])
      ];

      const isNibssValid = nibssResult.overallVerdict === 'AUTHENTIC';
      const isTamperClean = !tamperAnalysis || tamperAnalysis.tamperRiskLevel === 'CLEAN';
      const isGenuine = isNibssValid && isTamperClean;

      // 3. Smart Contract Registry & Anti-Replay Anchor
      // If genuine, or checking duplicate status, query/commit to registry
      let anchorResult = await contractRegistry.anchorProof({
        railType: 1,
        identifier: sessionId || 'INVALID_SESSION_ID',
        sender: `${senderBank}:${senderName}`,
        receiver: `${receiverBank}:${receiverAccount}`,
        amount: String(amount),
        currencyOrToken: currency,
        routingSummary: `${nibssResult.bankCodeSegment.resolvedBank?.shortName || senderBank}->${receiverBank}:NGN:${amount}`
      });

      // 4. Determine Unified Status and Color
      let status: 'VERIFIED' | 'TAMPERED' | 'DUPLICATE' | 'INVALID' = 'VERIFIED';
      let badgeTitle = 'VERIFIED AUTHENTIC';
      let badgeColor: 'blue' | 'amber' | 'crimson' = 'blue';

      if (!nibssResult.isFormatValid) {
        status = 'INVALID';
        badgeTitle = 'INVALID TRANSACTION / MALFORMED ID';
        badgeColor = 'crimson';
      } else if (!isGenuine) {
        status = 'TAMPERED';
        badgeTitle = 'FORGED / TAMPERED RECEIPT DETECTED';
        badgeColor = 'crimson';
      } else if (anchorResult.verificationCount > 1) {
        // Replay attack!
        status = 'DUPLICATE';
        badgeTitle = `DUPLICATE / ALREADY CLAIMED (ATTEMPT #${anchorResult.verificationCount})`;
        badgeColor = 'amber';
        allFlags.unshift(`CRITICAL REPLAY ALERT: This authentic receipt was already verified at ${anchorResult.firstVerifiedAtFormatted}. Double-spending attempt blocked by on-chain registry.`);
      }

      const senderBankInfo = lookupBankByNameOrCode(senderBank) || nibssResult.bankCodeSegment.resolvedBank;
      const receiverBankInfo = lookupBankByNameOrCode(receiverBank);

      const blueCard: BlueCardPayload = {
        rail: 'LOCAL_BANK',
        status,
        badgeTitle,
        badgeColor,
        timestamp: new Date().toISOString(),
        proofHash: anchorResult.proofHash,
        routingPipeline: {
          sender: {
            title: 'Originating Sender',
            identifier: senderName,
            institutionOrWallet: senderBankInfo ? `${senderBankInfo.shortName} (${senderBankInfo.code})` : senderBank,
            bankLogoColor: senderBankInfo?.primaryColor || '#0047ff',
            verified: nibssResult.bankCodeSegment.claimedBankMatches
          },
          rail: {
            type: 'NIBSS Instant Payment (NIP)',
            identifier: sessionId,
            timestamp: nibssResult.timestampSegment.parsedHuman || receiptTimestamp,
            protocol: 'CBN Central Clearing Gateway (30-Digit NIBSS)',
            verified: nibssResult.isFormatValid && !nibssResult.timestampSegment.isTimeTampered
          },
          receiver: {
            title: 'Settled Recipient',
            identifier: `${receiverName} (${receiverAccount})`,
            institutionOrWallet: receiverBankInfo ? receiverBankInfo.shortName : receiverBank,
            amountFormatted: `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
            currency: 'NGN',
            verified: isGenuine
          }
        },
        forensics: {
          nibssAnalysis: nibssResult,
          imageTamperAnalysis: tamperAnalysis,
          flags: allFlags
        },
        onchainAnchor: {
          proofHash: anchorResult.proofHash,
          isAnchored: true,
          attestationTxHash: anchorResult.attestationTxHash,
          blockNumber: anchorResult.blockNumber,
          verificationCount: anchorResult.verificationCount,
          firstVerifiedAt: anchorResult.firstVerifiedAtFormatted,
          isReplayAttack: anchorResult.verificationCount > 1,
          explorerUrl: anchorResult.explorerUrl,
          contractAddress: anchorResult.contractAddress
        }
      };

      res.status(200).json({ success: true, blueCard });
    } catch (err: any) {
      console.error('[VerifyController] Local bank verify error:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal verification error' });
    }
  }

  /**
   * Rail 2: On-Chain Blockchain Transfer Verification
   */
  async verifyOnChain(req: Request, res: Response): Promise<void> {
    try {
      const {
        txHash,
        chainKey = 'base',
        claimedSender,
        claimedReceiver,
        claimedContract
      } = req.body;

      if (!txHash) {
        res.status(400).json({ success: false, error: 'Transaction hash is required' });
        return;
      }

      // 1. Direct RPC Node & Indexer Lookup
      const onchainResult = await blockchainService.verifyTransaction({
        txHash,
        chainKey,
        claimedSender,
        claimedReceiver,
        claimedContract
      });

      // 2. Commit / check with Smart Contract Anti-Replay Registry
      const anchorResult = await contractRegistry.anchorProof({
        railType: 2,
        identifier: onchainResult.txHash,
        sender: onchainResult.senderAddress,
        receiver: onchainResult.receiverAddress,
        amount: onchainResult.asset.amount,
        currencyOrToken: onchainResult.asset.symbol,
        routingSummary: `${onchainResult.asset.symbol}:${onchainResult.chain.chainSlug.toUpperCase()}:${onchainResult.asset.amount}`
      });

      // 3. Determine Badge Status & Color
      let status: 'VERIFIED' | 'TAMPERED' | 'DUPLICATE' | 'INVALID' = 'VERIFIED';
      let badgeTitle = 'VERIFIED AUTHENTIC';
      let badgeColor: 'blue' | 'amber' | 'crimson' = 'blue';
      const flags: string[] = [];

      if (!onchainResult.isSuccess || onchainResult.status === 'REVERTED') {
        status = 'INVALID';
        badgeTitle = 'ON-CHAIN TRANSACTION REVERTED / FAILED';
        badgeColor = 'crimson';
        flags.push('Execution failed on-chain. State change reverted. Zero assets transferred.');
      } else if (onchainResult.status === 'COUNTERFEIT_ALERT') {
        status = 'TAMPERED';
        badgeTitle = 'COUNTERFEIT TOKEN SCAM DETECTED';
        badgeColor = 'crimson';
        flags.push('CRITICAL SCAM ALERT: The smart contract used is an unverified fake token, NOT the canonical official contract.');
      } else if (!onchainResult.isSenderMatch || !onchainResult.isReceiverMatch) {
        status = 'TAMPERED';
        badgeTitle = 'COUNTERPARTY WALLET MISMATCH';
        badgeColor = 'crimson';
        flags.push('Claimed recipient does not match the actual recipient indexed from event logs.');
      } else if (anchorResult.verificationCount > 1) {
        // Replay attack!
        status = 'DUPLICATE';
        badgeTitle = `DUPLICATE / ALREADY CLAIMED ON-CHAIN (ATTEMPT #${anchorResult.verificationCount})`;
        badgeColor = 'amber';
        flags.push(`REPLAY ATTACK INTERCEPTED: Transaction hash was previously claimed at ${anchorResult.firstVerifiedAtFormatted}. Multiple merchandise claims prevented.`);
      }

      const blueCard: BlueCardPayload = {
        rail: 'ONCHAIN',
        status,
        badgeTitle,
        badgeColor,
        timestamp: onchainResult.blockTimestamp,
        proofHash: anchorResult.proofHash,
        routingPipeline: {
          sender: {
            title: 'Originating Wallet (From)',
            identifier: onchainResult.senderAddress,
            institutionOrWallet: `Signer (${onchainResult.senderAddress.slice(0, 6)}...${onchainResult.senderAddress.slice(-4)})`,
            bankLogoColor: '#0052ff',
            verified: onchainResult.isSenderMatch
          },
          rail: {
            type: `${onchainResult.chain.name} RPC Execution`,
            identifier: onchainResult.txHash,
            timestamp: onchainResult.blockTimestamp,
            protocol: `EVM Block #${onchainResult.blockNumber}`,
            verified: onchainResult.isSuccess
          },
          receiver: {
            title: 'Settled Recipient (To)',
            identifier: onchainResult.receiverAddress,
            institutionOrWallet: `Merchant Wallet (${onchainResult.receiverAddress.slice(0, 6)}...${onchainResult.receiverAddress.slice(-4)})`,
            amountFormatted: `${onchainResult.asset.amount} ${onchainResult.asset.symbol}`,
            currency: onchainResult.asset.symbol,
            verified: onchainResult.isReceiverMatch && onchainResult.isSuccess
          }
        },
        forensics: {
          geminiSummary: onchainResult.geminiForensicSummary,
          onchainDetails: onchainResult,
          flags
        },
        onchainAnchor: {
          proofHash: anchorResult.proofHash,
          isAnchored: true,
          attestationTxHash: anchorResult.attestationTxHash,
          blockNumber: anchorResult.blockNumber,
          verificationCount: anchorResult.verificationCount,
          firstVerifiedAt: anchorResult.firstVerifiedAtFormatted,
          isReplayAttack: anchorResult.verificationCount > 1,
          explorerUrl: anchorResult.explorerUrl,
          contractAddress: anchorResult.contractAddress
        }
      };

      res.status(200).json({ success: true, blueCard });
    } catch (err: any) {
      console.error('[VerifyController] On-chain verify error:', err);
      res.status(500).json({ success: false, error: err.message || 'On-chain verification error' });
    }
  }

  /**
   * Anchor a proof manually or test anchor
   */
  async anchorProof(req: Request, res: Response): Promise<void> {
    try {
      const result = await contractRegistry.anchorProof(req.body);
      res.status(200).json({ success: true, result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get single proof status
   */
  async getProofStatus(req: Request, res: Response): Promise<void> {
    const proofHash = String(req.params.proofHash || '');
    const record = contractRegistry.lookupProof(proofHash);
    if (!record) {
      res.status(404).json({ success: false, error: 'Proof not found in registry' });
      return;
    }
    res.status(200).json({ success: true, record });
  }

  /**
   * Reset a proof (allows judges to replay the demo cycle)
   */
  async resetProof(req: Request, res: Response): Promise<void> {
    const proofHash = String(req.params.proofHash || '');
    contractRegistry.resetProof(proofHash);
    res.status(200).json({ success: true, message: 'Proof reset successfully' });
  }

  /**
   * Get all audited proofs
   */
  async getAllRecords(_req: Request, res: Response): Promise<void> {
    const records = contractRegistry.getAllRecords();
    res.status(200).json({ success: true, records });
  }

  /**
   * Get CBN Banks list
   */
  async getCBNBanks(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, banks: getAllCBNBanks() });
  }

  /**
   * Get Stage Demo Presets
   */
  async getPresets(_req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, presets: STAGE_DEMO_PRESETS });
  }
}

export const verifyController = new VerifyController();
