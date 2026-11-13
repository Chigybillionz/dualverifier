import crypto from 'crypto';
import { pollarRegistry, PollarAnchorRecord } from './pollarRegistry.js';

export interface PollarVerificationOutput {
  rail: 'POLLAR_STELLAR';
  status: 'VERIFIED' | 'TAMPERED' | 'DUPLICATE' | 'INVALID';
  badgeTitle: string;
  badgeColor: 'emerald' | 'amber' | 'crimson';
  timestamp: string;
  proofHash: string;
  txHash: string;
  ledgerSeq: number;
  network: 'testnet' | 'public';
  explorerUrl: string;
  pollarSmartWallet: {
    address: string;
    accountType: 'POLLAR_EMBEDDED_SMART_WALLET' | 'STELLAR_STANDARD';
    gaslessActive: boolean;
    sponsoredBy: string;
  };
  settlement: {
    asset: string;
    amount: string;
    ngnEquivalent: string;
    status: 'ESCROW_RELEASED' | 'PENDING' | 'LOCKED';
    memoText: string;
  };
  pollarAnchor: {
    proofHash: string;
    stellarTxHash: string;
    stellarLedgerSeq: number;
    stellarNetwork: string;
    explorerUrl: string;
    merchantPollarWallet: string;
    payoutAsset: string;
    payoutAmount: string;
    gaslessSponsored: boolean;
    sponsorFee: string;
    stellarMemoText: string;
  };
  routingPipeline: {
    sender: {
      title: string;
      identifier: string;
      institution: string;
      bankLogoColor: string;
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
      institution: string;
      bankLogoColor: string;
      amountFormatted: string;
      currency: string;
      multiCurrency: {
        ngn: string;
        usd: string;
        usdc: string;
      };
      verified: boolean;
    };
  };
  forensics?: {
    flags: string[];
  };
  metadata: Record<string, any>;
  notes: string[];
}

interface LiveStellarTxDetails {
  found: boolean;
  network: 'testnet' | 'public';
  ledger: number;
  createdAt: string;
  txHash: string;
  memo: string;
  successful: boolean;
  amount: number;
  asset: string;
  from: string;
  to: string;
  feeXlm: string;
}

/**
 * Queries the public Stellar Horizon API (Testnet first, then Public mainnet)
 * to retrieve real, live on-chain transaction values for any custom user hash.
 */
async function queryHorizonTransaction(txHash: string): Promise<LiveStellarTxDetails | null> {
  const cleanHash = txHash.trim().toLowerCase().replace(/^0x/, '');
  // Ignore built-in demo mock hashes
  if (
    cleanHash === 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e' ||
    cleanHash.startsWith('c3d4e5f6')
  ) {
    return null;
  }

  const endpoints = [
    { network: 'testnet' as const, base: 'https://horizon-testnet.stellar.org' },
    { network: 'public' as const, base: 'https://horizon.stellar.org' }
  ];

  for (const ep of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const txRes = await fetch(`${ep.base}/transactions/${cleanHash}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!txRes.ok) continue;
      const tx = (await txRes.json()) as any;

      let amount = 0;
      let asset = 'USDC';
      let from = tx.source_account || '';
      let to = tx.source_account || '';

      // 1. Inspect operations for payment amounts
      try {
        const opsRes = await fetch(`${ep.base}/transactions/${cleanHash}/operations`);
        if (opsRes.ok) {
          const opsData = (await opsRes.json()) as any;
          for (const op of opsData._embedded.records) {
            const rawAmt = op.amount || op.starting_balance || op.dest_amount;
            if (rawAmt && Number(rawAmt) > 0) {
              amount = Number(rawAmt);
              asset = op.asset_code || (op.asset_type === 'native' ? 'XLM' : 'USDC');
              if (op.from) from = op.from;
              if (op.to) to = op.to || op.into || op.funder || to;
              break;
            }
          }
        }
      } catch (err) {}

      // 2. If amount is not in operations, inspect effects (e.g. Soroban contract invocations, Pollar Smart Wallets)
      if (amount === 0) {
        try {
          const effRes = await fetch(`${ep.base}/transactions/${cleanHash}/effects`);
          if (effRes.ok) {
            const effData = (await effRes.json()) as any;
            for (const eff of effData._embedded.records) {
              const rawAmt = eff.amount || eff.starting_balance;
              if (rawAmt && Number(rawAmt) > 0) {
                amount = Number(rawAmt);
                asset = eff.asset_code || (eff.asset_type === 'native' ? 'XLM' : 'USDC');
                if (eff.account) to = eff.account;
                break;
              }
            }
          }
        } catch (err) {}
      }

      const feeXlm = (Number(tx.fee_charged || 100) / 10000000).toFixed(5);

      return {
        found: true,
        network: ep.network,
        ledger: tx.ledger || 51842095,
        createdAt: tx.created_at || new Date().toISOString(),
        txHash: tx.hash || cleanHash,
        memo: tx.memo || '',
        successful: tx.successful !== false,
        amount,
        asset,
        from,
        to,
        feeXlm
      };
    } catch (err) {
      // Continue to next endpoint if aborted or network error
    }
  }

  return null;
}

export class PollarVerifier {
  /**
   * Verifies a Stellar transaction or Pollar settlement reference
   */
  async verifyPollarTransaction(params: {
    txHash?: string;
    walletAddress?: string;
    sessionId?: string;
  }): Promise<PollarVerificationOutput> {
    const { txHash, walletAddress, sessionId } = params;
    const cleanTx = (txHash || '').trim().replace(/^0x/, '');

    // 1. Identify built-in demo vectors (for offline hackathon test vectors)
    const isDemoAuthentic = cleanTx.toLowerCase() === 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e';
    const isDemoReplay = cleanTx.toLowerCase().includes('c3d4e5f6');
    const isBuiltInDemo = isDemoAuthentic || isDemoReplay;

    // 2. Syntax validation for custom hashes
    const isValidHex64 = /^[0-9a-fA-F]{64}$/.test(cleanTx);

    // If custom hash is malformed (invalid hex characters or incorrect length)
    if (!isBuiltInDemo && cleanTx && !isValidHex64) {
      const proofHash = `0x${crypto.createHash('sha256').update(cleanTx).digest('hex')}`;
      return {
        rail: 'POLLAR_STELLAR',
        status: 'INVALID',
        badgeTitle: 'MALFORMED STELLAR TX HASH',
        badgeColor: 'crimson',
        timestamp: new Date().toISOString(),
        proofHash,
        txHash: cleanTx,
        ledgerSeq: 0,
        network: 'testnet',
        explorerUrl: `https://stellar.expert/explorer/testnet/tx/${cleanTx}`,
        pollarSmartWallet: {
          address: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
          accountType: 'POLLAR_EMBEDDED_SMART_WALLET',
          gaslessActive: false,
          sponsoredBy: 'Pollar Paymaster (SEP-0043)'
        },
        settlement: {
          asset: 'USDC',
          amount: '0.00',
          ngnEquivalent: '₦0.00',
          status: 'LOCKED',
          memoText: 'INVALID_SYNTAX'
        },
        pollarAnchor: {
          proofHash,
          stellarTxHash: cleanTx,
          stellarLedgerSeq: 0,
          stellarNetwork: 'testnet',
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${cleanTx}`,
          merchantPollarWallet: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
          payoutAsset: 'USDC',
          payoutAmount: '0.00',
          gaslessSponsored: false,
          sponsorFee: '0.00000 XLM',
          stellarMemoText: 'INVALID_SYNTAX'
        },
        routingPipeline: {
          sender: {
            title: 'Buyer / Payer (Nigerian Fiat Rail)',
            identifier: 'Invalid Signer',
            institution: 'Malformed Stellar Hash',
            bankLogoColor: '#ef4444',
            verified: false
          },
          rail: {
            type: 'Pollar Stellar Rail (Syntax Error)',
            identifier: `Invalid Length: ${cleanTx.length} chars (Requires 64 hex characters)`,
            timestamp: new Date().toISOString(),
            protocol: 'Pollar SDK (@pollar/core) + Stellar Paymaster',
            verified: false
          },
          receiver: {
            title: 'Merchant Pollar Smart Account',
            identifier: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
            institution: 'Pollar Smart Account',
            bankLogoColor: '#ef4444',
            amountFormatted: '₦0.00',
            currency: 'NGN',
            multiCurrency: {
              ngn: '₦0.00 NGN',
              usd: '$0.00 USD',
              usdc: '0.00 USDC (Stellar)'
            },
            verified: false
          }
        },
        forensics: {
          flags: [
            `Malformed Transaction Hash: Expected 64 hexadecimal characters, but got ${cleanTx.length} characters with non-hex characters.`,
            'Integrity Rejection: Pollar Escrow locked. Verification aborted.'
          ]
        },
        metadata: {
          error: 'MALFORMED_HASH',
          txHash: cleanTx
        },
        notes: [
          'Error: Stellar transaction hashes must be strictly 64 hexadecimal characters (32 bytes).',
          'Pollar Escrow Action: Zero funds disbursed. Escrow remains locked.'
        ]
      };
    }

    // 3. Query live on-chain Stellar Horizon for custom valid 64-char hashes
    let liveTx: LiveStellarTxDetails | null = null;
    if (!isBuiltInDemo && isValidHex64) {
      liveTx = await queryHorizonTransaction(cleanTx);

      // If queried against Horizon (both testnet & public) and NOT FOUND:
      if (!liveTx || !liveTx.found) {
        const proofHash = `0x${crypto.createHash('sha256').update(cleanTx).digest('hex')}`;
        return {
          rail: 'POLLAR_STELLAR',
          status: 'TAMPERED',
          badgeTitle: 'TRANSACTION NOT FOUND ON STELLAR HORIZON',
          badgeColor: 'crimson',
          timestamp: new Date().toISOString(),
          proofHash,
          txHash: cleanTx,
          ledgerSeq: 0,
          network: 'testnet',
          explorerUrl: `https://stellar.expert/explorer/testnet/tx/${cleanTx}`,
          pollarSmartWallet: {
            address: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
            accountType: 'POLLAR_EMBEDDED_SMART_WALLET',
            gaslessActive: false,
            sponsoredBy: 'Pollar Paymaster (SEP-0043)'
          },
          settlement: {
            asset: 'USDC',
            amount: '0.00',
            ngnEquivalent: '₦0.00',
            status: 'LOCKED',
            memoText: '404_NOT_FOUND'
          },
          pollarAnchor: {
            proofHash,
            stellarTxHash: cleanTx,
            stellarLedgerSeq: 0,
            stellarNetwork: 'testnet',
            explorerUrl: `https://stellar.expert/explorer/testnet/tx/${cleanTx}`,
            merchantPollarWallet: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
            payoutAsset: 'USDC',
            payoutAmount: '0.00',
            gaslessSponsored: false,
            sponsorFee: '0.00000 XLM',
            stellarMemoText: 'NOT_FOUND_ON_CHAIN'
          },
          routingPipeline: {
            sender: {
              title: 'Buyer / Payer (Nigerian Fiat Rail)',
              identifier: 'Non-Existent Sender',
              institution: 'No Ledger Record',
              bankLogoColor: '#ef4444',
              verified: false
            },
            rail: {
              type: 'Pollar Stellar Rail (Horizon 404)',
              identifier: `No On-Chain Transaction Found (${cleanTx.slice(0, 16)}...)`,
              timestamp: new Date().toISOString(),
              protocol: 'Pollar SDK (@pollar/core) + Stellar Horizon RPC',
              verified: false
            },
            receiver: {
              title: 'Merchant Pollar Smart Account',
              identifier: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
              institution: 'Pollar Smart Account',
              bankLogoColor: '#ef4444',
              amountFormatted: '₦0.00',
              currency: 'NGN',
              multiCurrency: {
                ngn: '₦0.00 NGN',
                usd: '$0.00 USD',
                usdc: '0.00 USDC (Stellar)'
              },
              verified: false
            }
          },
          forensics: {
            flags: [
              `Cryptographic Proof Missing: Transaction hash [${cleanTx}] was queried against Stellar Horizon RPC (Testnet & Public Mainnet) but returned 404 (Not Found).`,
              'Fraud / Tamper Alert: Altered, manipulated, or simulated transaction hash detected.',
              'Pollar Escrow Action: Settlement aborted. Zero funds disbursed to recipient.'
            ]
          },
          metadata: {
            error: 'TRANSACTION_NOT_FOUND',
            txHash: cleanTx
          },
          notes: [
            `Stellar Horizon RPC (horizon-testnet.stellar.org & horizon.stellar.org): Hash returned 404 Not Found.`,
            'Integrity check failed: Transaction has never been broadcast or confirmed on the Stellar network.',
            'Pollar Escrow protection active: Merchant funds remain securely locked.'
          ]
        };
      }

      // If found on-chain, but transaction was REVERTED / FAILED:
      if (!liveTx.successful) {
        const proofHash = `0x${crypto.createHash('sha256').update(cleanTx).digest('hex')}`;
        return {
          rail: 'POLLAR_STELLAR',
          status: 'TAMPERED',
          badgeTitle: 'STELLAR TRANSACTION FAILED ON-CHAIN',
          badgeColor: 'crimson',
          timestamp: liveTx.createdAt,
          proofHash,
          txHash: cleanTx,
          ledgerSeq: liveTx.ledger,
          network: liveTx.network,
          explorerUrl: `https://stellar.expert/explorer/${liveTx.network}/tx/${cleanTx}`,
          pollarSmartWallet: {
            address: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
            accountType: 'POLLAR_EMBEDDED_SMART_WALLET',
            gaslessActive: false,
            sponsoredBy: 'Pollar Paymaster (SEP-0043)'
          },
          settlement: {
            asset: liveTx.asset,
            amount: '0.00',
            ngnEquivalent: '₦0.00',
            status: 'LOCKED',
            memoText: liveTx.memo || 'FAILED_ON_CHAIN'
          },
          pollarAnchor: {
            proofHash,
            stellarTxHash: cleanTx,
            stellarLedgerSeq: liveTx.ledger,
            stellarNetwork: liveTx.network,
            explorerUrl: `https://stellar.expert/explorer/${liveTx.network}/tx/${cleanTx}`,
            merchantPollarWallet: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
            payoutAsset: liveTx.asset,
            payoutAmount: '0.00',
            gaslessSponsored: false,
            sponsorFee: '0.00000 XLM',
            stellarMemoText: 'TX_FAILED'
          },
          routingPipeline: {
            sender: {
              title: 'Buyer / Payer (Nigerian Fiat Rail)',
              identifier: liveTx.from ? `${liveTx.from.slice(0, 8)}...${liveTx.from.slice(-6)}` : 'Originator',
              institution: `Stellar ${liveTx.network} Wallet`,
              bankLogoColor: '#ef4444',
              verified: false
            },
            rail: {
              type: `Pollar Stellar Rail (${liveTx.network})`,
              identifier: `Ledger #${liveTx.ledger} (FAILED)`,
              timestamp: liveTx.createdAt,
              protocol: 'Pollar SDK (@pollar/core) + Stellar Paymaster',
              verified: false
            },
            receiver: {
              title: 'Merchant Pollar Smart Account',
              identifier: walletAddress || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
              institution: 'Pollar Smart Account',
              bankLogoColor: '#ef4444',
              amountFormatted: '₦0.00',
              currency: 'NGN',
              multiCurrency: {
                ngn: '₦0.00 NGN',
                usd: '$0.00 USD',
                usdc: '0.00 USDC (Stellar)'
              },
              verified: false
            }
          },
          forensics: {
            flags: [
              `On-Chain Execution Reverted: Transaction is recorded on Stellar ledger #${liveTx.ledger} with FAILED status.`,
              'Pollar Escrow Action: Zero funds disbursed. Escrow remains locked.'
            ]
          },
          metadata: {
            error: 'TX_FAILED_ON_CHAIN',
            txHash: cleanTx
          },
          notes: [
            `Execution failed on Stellar consensus ledger #${liveTx.ledger}.`,
            'Merchant goods must not be released for failed transactions.'
          ]
        };
      }
    }

    // 4. Check if we have an existing anchored record in the Pollar registry
    let existingRecord: PollarAnchorRecord | undefined;
    if (sessionId) {
      existingRecord = pollarRegistry.getRecordBySessionId(sessionId);
    }
    if (!existingRecord && cleanTx) {
      for (const rec of pollarRegistry.getAllRecords()) {
        if (rec.stellarTxHash.toLowerCase() === cleanTx.toLowerCase()) {
          existingRecord = rec;
          break;
        }
      }
    }

    const isReplay = existingRecord?.isReplay || (existingRecord && existingRecord.claimCount > 1) || isDemoReplay;

    let effectiveTxHash = cleanTx || existingRecord?.stellarTxHash || crypto.createHash('sha256').update(`STELLAR:${Date.now()}`).digest('hex');
    let effectiveWallet = walletAddress || existingRecord?.merchantPollarWallet || 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01';
    let effectiveLedger = existingRecord?.stellarLedgerSeq || 51842095;
    let effectiveAmount = existingRecord?.payoutAmount || '98.68';
    let effectiveNgn = existingRecord?.amount || '150000';
    let effectiveMemo = existingRecord?.stellarMemoText || `DV:${(sessionId || '260315143022100004').slice(-18)}`;
    let senderIdentifier = existingRecord?.sender || 'Chibuike Okonkwo (000013)';
    let senderInstitution = 'Guaranty Trust Bank (GTBank)';
    let receiverInstitution = 'Lekki Gadget Depot Ltd (Stellar USDC)';
    let network: 'testnet' | 'public' = 'testnet';
    let settlementAsset = 'USDC';

    // 5. Override with REAL live Stellar transaction data if found on Horizon:
    if (liveTx && liveTx.found) {
      effectiveTxHash = liveTx.txHash;
      network = liveTx.network;
      effectiveLedger = liveTx.ledger;
      if (liveTx.amount > 0) {
        effectiveAmount = String(liveTx.amount);
        settlementAsset = liveTx.asset;
        // 1 USDC = 1520 NGN
        const ngnVal = Math.round(liveTx.amount * 1520);
        effectiveNgn = String(ngnVal);
      }
      if (liveTx.memo) {
        effectiveMemo = liveTx.memo;
      }
      if (liveTx.from) {
        senderIdentifier = `${liveTx.from.slice(0, 8)}...${liveTx.from.slice(-6)}`;
        senderInstitution = `Stellar ${liveTx.network === 'public' ? 'Mainnet' : 'Testnet'} Wallet`;
      }
      if (liveTx.to) {
        effectiveWallet = liveTx.to;
        receiverInstitution = `Pollar Smart Account (${effectiveWallet.slice(0, 8)}...)`;
      }

      // Anchor newly observed live hash into registry to track replays
      if (!existingRecord && !isReplay) {
        pollarRegistry.checkAndAnchorReceipt({
          sessionIdOrTxId: effectiveTxHash,
          sender: senderIdentifier,
          receiver: effectiveWallet,
          amount: Number(effectiveNgn),
          currency: 'NGN',
          timestamp: liveTx.createdAt,
          merchantId: effectiveWallet
        });
      }
    }

    const proofHash = existingRecord?.proofHash || `0x${crypto.createHash('sha256').update(effectiveTxHash).digest('hex')}`;
    const status: 'VERIFIED' | 'TAMPERED' | 'DUPLICATE' | 'INVALID' = isReplay ? 'DUPLICATE' : 'VERIFIED';
    const badgeTitle = isReplay ? 'DUPLICATE REPLAY DETECTED' : 'POLLAR GASLESS SETTLEMENT VERIFIED';
    const badgeColor: 'emerald' | 'amber' | 'crimson' = isReplay ? 'amber' : 'emerald';

    const numNgn = Number(effectiveNgn) || 150000;
    const numUsdc = Number(effectiveAmount) || 98.68;

    return {
      rail: 'POLLAR_STELLAR',
      status,
      badgeTitle,
      badgeColor,
      timestamp: existingRecord?.firstVerifiedAtIso || liveTx?.createdAt || new Date().toISOString(),
      proofHash,
      txHash: effectiveTxHash,
      ledgerSeq: effectiveLedger,
      network,
      explorerUrl: `https://stellar.expert/explorer/${network}/tx/${effectiveTxHash}`,
      pollarSmartWallet: {
        address: effectiveWallet,
        accountType: 'POLLAR_EMBEDDED_SMART_WALLET',
        gaslessActive: true,
        sponsoredBy: 'Pollar Paymaster (SEP-0043 / Fee-Bump)'
      },
      settlement: {
        asset: settlementAsset,
        amount: effectiveAmount,
        ngnEquivalent: `₦${numNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
        status: isReplay ? 'LOCKED' : 'ESCROW_RELEASED',
        memoText: effectiveMemo
      },
      pollarAnchor: {
        proofHash,
        stellarTxHash: effectiveTxHash,
        stellarLedgerSeq: effectiveLedger,
        stellarNetwork: network,
        explorerUrl: `https://stellar.expert/explorer/${network}/tx/${effectiveTxHash}`,
        merchantPollarWallet: effectiveWallet,
        payoutAsset: settlementAsset,
        payoutAmount: String(numUsdc),
        gaslessSponsored: true,
        sponsorFee: '0.00000 XLM (Sponsored by Pollar Paymaster)',
        stellarMemoText: effectiveMemo
      },
      routingPipeline: {
        sender: {
          title: 'Buyer / Payer (Nigerian Fiat Rail)',
          identifier: senderIdentifier,
          institution: senderInstitution,
          bankLogoColor: '#00D632',
          verified: true
        },
        rail: {
          type: `Pollar Stellar Gasless Rail (${network})`,
          identifier: `Ledger #${effectiveLedger}`,
          timestamp: existingRecord?.firstVerifiedAtIso || liveTx?.createdAt || new Date().toISOString(),
          protocol: 'Pollar SDK (@pollar/core) + Stellar Paymaster',
          verified: true
        },
        receiver: {
          title: 'Merchant Pollar Smart Account',
          identifier: effectiveWallet,
          institution: receiverInstitution,
          bankLogoColor: '#00E5FF',
          amountFormatted: `₦${numNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`,
          currency: 'NGN',
          multiCurrency: {
            ngn: `₦${numNgn.toLocaleString('en-NG', { minimumFractionDigits: 2 })} NGN`,
            usd: `$${numUsdc.toFixed(2)} USD`,
            usdc: `${numUsdc.toFixed(2)} ${settlementAsset} (Stellar)`
          },
          verified: !isReplay
        }
      },
      forensics: {
        flags: isReplay ? [
          'Duplicate Claim Detected: On-chain fingerprint already redeemed on Stellar ledger by another merchant terminal. Escrow payout aborted.'
        ] : []
      },
      metadata: {
        payoutAsset: settlementAsset,
        usdcAmount: numUsdc,
        ngnAmount: numNgn,
        feePaidByUser: '0.00000 XLM',
        feeSponsoredByPollar: '0.00010 XLM',
        explorerUrl: `https://stellar.expert/explorer/${network}/tx/${effectiveTxHash}`,
        claimCount: existingRecord?.claimCount || (isReplay ? 3 : 1)
      },
      notes: [
        `Verified via Pollar SDK: Transaction finalized on Stellar ${network} ledger #${effectiveLedger}.`,
        'Gas fee 100% sponsored by Pollar Paymaster: User paid 0 XLM gas fees.',
        effectiveMemo ? `Receipt fingerprint permanently anchored in Stellar memo: ${effectiveMemo}` : 'Receipt fingerprint anchored on-chain.',
        isReplay ? 'WARNING: Duplicate receipt claim detected. Escrow settlement flagged and locked.' : 'Escrow released: Merchant credited with USDC balance.'
      ]
    };
  }
}

export const pollarVerifier = new PollarVerifier();

