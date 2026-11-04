import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { verifyAndAnchorLocalBankReceipt, extractReceiptFromImage } from './services/nibssVerifier.js';
import { zcashVerifier } from './services/zcashVerifier.js';
import { zcashMemoRegistry } from './services/zcashMemoRegistry.js';
import { getAllCbnBanks } from './config/cbnBankCodes.js';
import { MOCK_DEMO_PRESETS } from './data/mockDemoPresets.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    protocol: 'DualVerifier Privacy-Preserving Engine v2.0',
    track: 'Intelligence: AI & Web3 Without Borders (BlockchainUNN Hackathon)',
    zcashNetwork: 'Zcash Mainnet / Lightwalletd Proxy',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// 1. Rail 1: Local Bank Receipt Verifier (NIBSS + Zcash Shielded Memo Anchor)
app.post('/api/verify/local', upload.single('receipt'), async (req, res) => {
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

    if (file) {
      const extracted = await extractReceiptFromImage(file.buffer, file.mimetype, file.originalname);
      sessionId = sessionId || extracted.sessionId;
      senderBank = senderBank || extracted.senderBank;
      senderName = senderName || extracted.senderName;
      receiverBank = receiverBank || extracted.receiverBank;
      receiverName = receiverName || extracted.receiverName;
      receiverAccount = receiverAccount || extracted.receiverAccount;
      amount = amount || extracted.amount;
      receiptTimestamp = receiptTimestamp || extracted.receiptTimestamp;
    }

    sessionId = (sessionId || '').replace(/[^0-9]/g, '');
    amount = Number(amount) || 0;
    senderBank = senderBank || 'Guaranty Trust Bank (GTBank)';
    receiverBank = receiverBank || 'OPay Digital Services';

    const blueCard = await verifyAndAnchorLocalBankReceipt({
      sessionId,
      senderBank,
      senderName,
      receiverBank,
      receiverName,
      receiverAccount,
      amount,
      currency,
      receiptTimestamp,
      simulatedTamperScore: simulatedTamperScore ? Number(simulatedTamperScore) : undefined,
      flaggedSoftware
    });

    res.status(200).json({ success: true, blueCard });
  } catch (err: any) {
    console.error('[API /verify/local] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Local verification error' });
  }
});

// 2. Rail 2: Zcash On-Chain Verifier (Shielded Orchard/Sapling & Transparent Explorer)
app.post('/api/verify/zcash', async (req, res) => {
  try {
    const { txid, unifiedAddress, viewingKey } = req.body;

    if (!txid) {
      res.status(400).json({ success: false, error: 'Zcash Transaction ID (txid) is required' });
      return;
    }

    const trace = await zcashVerifier.verifyZcashTransaction({
      txid,
      unifiedAddress,
      viewingKey
    });

    // Format into standardized Blue Card
    const hasViewingKey = trace.selectiveDisclosure.viewingKeyProvided;
    const isShielded = trace.poolTransit.isFullyShielded;

    let badgeTitle = 'SHIELDED VERIFIED (SELECTIVE DISCLOSURE)';
    let badgeColor: 'emerald' | 'amber' | 'crimson' | 'blue' = 'blue';

    if (!isShielded) {
      badgeTitle = 'TRANSPARENT TRANSACTION VERIFIED';
      badgeColor = 'blue';
    } else if (!hasViewingKey) {
      badgeTitle = 'SHIELDED NOTE CONFIRMED (ZERO-KNOWLEDGE)';
      badgeColor = 'amber';
    }

    const blueCard = {
      rail: 'ZCASH',
      status: 'VERIFIED',
      badgeTitle,
      badgeColor,
      timestamp: trace.blockTimestamp,
      proofHash: trace.txid,
      routingPipeline: {
        sender: {
          title: 'Sender Pool (From)',
          identifier: isShielded ? 'Shielded Pool (Halo 2 ZK)' : trace.sender.addressOrPool,
          institution: isShielded ? 'Zcash Orchard Pool' : 'Transparent (t-addr)',
          bankLogoColor: '#3b82f6',
          verified: true
        },
        rail: {
          type: `Zcash ${trace.poolTransit.classification}`,
          identifier: trace.txid,
          timestamp: new Date(trace.blockTimestamp).toLocaleString(),
          protocol: `Zcash Mainnet • Block #${trace.blockHeight}`,
          verified: true
        },
        receiver: {
          title: 'Recipient (To)',
          identifier: trace.receiver.unifiedAddress
            ? `${trace.receiver.unifiedAddress.slice(0, 10)}...${trace.receiver.unifiedAddress.slice(-8)}`
            : trace.receiver.addressOrPool,
          institution: 'Unified Address (ZIP-316)',
          amountFormatted: trace.amount.displayAmountZec,
          currency: 'ZEC',
          verified: true
        }
      },
      zcashDetails: trace,
      forensics: {
        geminiAiNotes: trace.selectiveDisclosure.disclosureStatement,
        flags: isShielded && !hasViewingKey
          ? ['Zero-Knowledge Protected: Note amount and 512-byte memo are shielded. Supply a Unified Viewing Key (uview1...) to selectively decrypt.']
          : []
      }
    };

    res.status(200).json({ success: true, blueCard, trace });
  } catch (err: any) {
    console.error('[API /verify/zcash] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Zcash verification error' });
  }
});

// Demo Presets
app.get('/api/presets', (_req, res) => {
  res.json({ success: true, presets: MOCK_DEMO_PRESETS });
});

// CBN Bank Directory
app.get('/api/cbn/banks', (_req, res) => {
  res.json({ success: true, banks: getAllCbnBanks() });
});

// Zcash 512-Byte Memo Registry Records
app.get('/api/zcash/memos', (_req, res) => {
  res.json({ success: true, records: zcashMemoRegistry.getAllRecords() });
});

// Reset Proof for Demo Replay
app.post('/api/zcash/reset/:proofHash', (req, res) => {
  const { proofHash } = req.params;
  zcashMemoRegistry.resetProof(proofHash);
  res.json({ success: true, message: 'Zcash memo proof reset' });
});

app.listen(PORT, () => {
  console.log(`
===========================================================
  🛡️ DualVerifier Zcash & Local Bank Engine Active
  📍 Port: http://localhost:${PORT}
  🏦 Rail 1: Local Bank (NIBSS + Zcash 512B Memo): POST /api/verify/local
  🛡️ Rail 2: Zcash Shielded Explorer (uview/u1):   POST /api/verify/zcash
  📝 Presets: GET /api/presets
===========================================================
  `);
});
