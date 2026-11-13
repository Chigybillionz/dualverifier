import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { verifyAndAnchorLocalBankReceipt, extractReceiptFromImage } from './services/nibssVerifier.js';
import { pollarVerifier } from './services/pollarVerifier.js';
import { pollarRegistry } from './services/pollarRegistry.js';
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
    protocol: 'DualVerifier Pollar Gasless Engine v3.0',
    track: 'Intelligence: AI & Web3 Without Borders (BlockchainUNN Hackathon)',
    web3Rail: 'Pollar SDK (@pollar/core) + Stellar Testnet Paymaster',
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'),
    timestamp: new Date().toISOString()
  });
});

// 0. OCR Receipt Extraction Endpoint (Allows frontend inspection before verification)
app.post('/api/ocr/extract', upload.single('receipt'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No receipt file uploaded' });
      return;
    }
    const customApiKey = (req.headers['x-gemini-key'] as string) || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
    const extracted = await extractReceiptFromImage(file.buffer, file.mimetype, file.originalname, customApiKey);
    res.json({ success: true, extracted });
  } catch (err: any) {
    console.error('[API /ocr/extract] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'OCR extraction failed' });
  }
});

// 1. Rail 1: Local Bank Receipt Verifier (NIBSS + Zcash Shielded Memo Anchor)
app.post('/api/verify/local', upload.single('receipt'), async (req, res) => {
  try {
    const file = req.file;
    const customApiKey = (req.headers['x-gemini-key'] as string) || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
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
      const extracted = await extractReceiptFromImage(file.buffer, file.mimetype, file.originalname, customApiKey);
      // Prioritize client-confirmed/OCRed amount if provided
      const clientAmount = Number(amount);
      amount = (!isNaN(clientAmount) && clientAmount > 0) ? clientAmount : (extracted.amount || 0);

      sessionId = (sessionId && sessionId.trim().length >= 10) ? sessionId : (extracted.sessionId || sessionId);
      senderBank = (senderBank && senderBank.trim()) ? senderBank : (extracted.senderBank || 'Guaranty Trust Bank (GTBank)');
      senderName = (senderName && senderName.trim()) ? senderName : (extracted.senderName || 'Transfer Sender');
      receiverBank = (receiverBank && receiverBank.trim()) ? receiverBank : (extracted.receiverBank || 'OPay Digital Services');
      receiverName = (receiverName && receiverName.trim()) ? receiverName : (extracted.receiverName || 'Settled Recipient');
      receiverAccount = (receiverAccount && receiverAccount.trim()) ? receiverAccount : (extracted.receiverAccount || '••••••••••');
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
      flaggedSoftware,
      merchantId: req.body.claimantMerchant || req.body.merchantId
    });

    res.status(200).json({ success: true, blueCard });
  } catch (err: any) {
    console.error('[API /verify/local] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Local verification error' });
  }
});

// 2. Rail 2: Pollar Stellar Gasless Verifier & Escrow
app.post('/api/verify/pollar', async (req, res) => {
  try {
    const { txid, walletAddress, sessionId } = req.body;
    const blueCard = await pollarVerifier.verifyPollarTransaction({
      txHash: txid,
      walletAddress,
      sessionId
    });
    res.status(200).json({ success: true, blueCard });
  } catch (err: any) {
    console.error('[API /verify/pollar] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Pollar verification error' });
  }
});

// 2b. Rail 2 Legacy Fallback (Zcash)
app.post('/api/verify/zcash', async (req, res) => {
  try {
    const { txid, unifiedAddress, viewingKey, walletAddress, sessionId } = req.body;

    // If txid looks like a stellar hash or pollar verification is called:
    if (walletAddress || (txid && !txid.startsWith('u1') && !viewingKey)) {
      const blueCard = await pollarVerifier.verifyPollarTransaction({
        txHash: txid,
        walletAddress,
        sessionId
      });
      res.status(200).json({ success: true, blueCard });
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
          institution: isShielded ? 'Zcash Ironwood (NU6.3) / Orchard' : 'Transparent (t-addr)',
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
          multiCurrency: trace.amount.multiCurrency,
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

// 3. AI Receipt Document Classifier (runs BEFORE full OCR/verification)
// Determines if a file is a payment receipt, blockchain tx, or unrelated document.
app.post('/api/classify/receipt', upload.single('receipt'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, error: 'No receipt file uploaded' });
      return;
    }

    const customApiKey = (req.headers['x-gemini-key'] as string) || req.body.geminiApiKey || process.env.GEMINI_API_KEY;
    if (!customApiKey || customApiKey === 'YOUR_GEMINI_API_KEY') {
      res.status(503).json({ success: false, error: 'Gemini API key not configured. Use client-side heuristic classifier.' });
      return;
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(customApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const base64Data = file.buffer.toString('base64');
    const mimeType = file.mimetype as 'image/png' | 'image/jpeg' | 'image/webp' | 'application/pdf';

    const classificationPrompt = `You are an AI document classifier for a Nigerian bank receipt verification system called DualVerifier.

Examine this uploaded document image carefully and determine what type of document it is.

You must respond with ONLY a valid JSON object (no markdown, no explanation, just JSON):

{
  "documentType": "PAYMENT_RECEIPT" | "BLOCKCHAIN_TRANSACTION" | "NOT_A_RECEIPT",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "reason": "<one sentence explaining why>",
  "isPaymentReceipt": true | false,
  "detectedKeywords": ["<list of key words/phrases you spotted>"],
  "score": <integer 0-10 representing how confident you are>
}

Classification rules:
- PAYMENT_RECEIPT: Nigerian bank transfer receipts showing Session ID / NIP reference number, sender bank, receiver bank, amount in NGN (₦), transaction timestamp. This includes mobile banking apps (OPay, Moniepoint, PalmPay, Kuda, GTBank, Zenith, Access Bank, First Bank, UBA etc.)
- BLOCKCHAIN_TRANSACTION: Zcash, Bitcoin, Ethereum, or other crypto transaction receipts showing TXID / transaction hash, wallet addresses, block height, confirmations.
- NOT_A_RECEIPT: Anything else — invoices, purchase orders, delivery notes, WhatsApp/chat screenshots, ID cards, passports, certificates, blank images, selfies, unrelated photos, salary slips, airtime/data receipts, etc.

Be strict. If in doubt and the document does not clearly show a completed Nigerian bank transfer or crypto transaction, classify as NOT_A_RECEIPT.`;

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType } },
      classificationPrompt
    ]);

    const responseText = result.response.text().trim();
    // Strip markdown code fences if Gemini wraps in ```json ... ```
    const jsonText = responseText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const classification = JSON.parse(jsonText);

    res.json({ success: true, classification });
  } catch (err: any) {
    console.error('[API /classify/receipt] Error:', err);
    res.status(500).json({ success: false, error: err.message || 'Classification failed' });
  }
});

// Session Audit Ledger / Verified Attestations
app.get('/api/history', (_req, res) => {
  const pollarRecords = pollarRegistry.getAllRecords();
  const history = pollarRecords.map(r => ({
    id: r.proofHash,
    timestamp: r.firstVerifiedAtIso,
    rail: 'POLLAR_STELLAR',
    sender: r.sender,
    receiver: r.receiver,
    amountFormatted: `₦${Number(r.amount).toLocaleString()} (${r.payoutAmount} USDC)`,
    amount: r.amount,
    currency: r.currency,
    memoHash: r.proofHash,
    stellarTxHash: r.stellarTxHash,
    stellarLedgerSeq: r.stellarLedgerSeq,
    merchantPollarWallet: r.merchantPollarWallet,
    payoutAsset: r.payoutAsset,
    payoutAmount: r.payoutAmount,
    gaslessSponsored: r.gaslessSponsored,
    claimCount: r.claimCount,
    isReplay: r.isReplay,
    status: r.claimCount > 1 ? 'DUPLICATE' : 'VERIFIED',
    badgeTitle: r.claimCount > 1 ? `DUPLICATE (CLAIM #${r.claimCount})` : 'VERIFIED AUTHENTIC',
    stellarMemoText: r.stellarMemoText,
    explorerUrl: r.explorerUrl
  }));

  res.json({ success: true, history });
});

// Demo Presets
app.get('/api/presets', (_req, res) => {
  res.json({ success: true, presets: MOCK_DEMO_PRESETS });
});

// CBN Bank Directory
app.get('/api/cbn/banks', (_req, res) => {
  res.json({ success: true, banks: getAllCbnBanks() });
});

// Pollar Stellar Escrow Records
app.get('/api/pollar/escrows', (_req, res) => {
  res.json({ success: true, records: pollarRegistry.getAllRecords() });
});

// Legacy Zcash Memos Endpoint
app.get('/api/zcash/memos', (_req, res) => {
  res.json({ success: true, records: zcashMemoRegistry.getAllRecords() });
});

app.listen(PORT, () => {
  console.log(`
===========================================================
  ⚡ DualVerifier Pollar Gasless & NIBSS Engine Active
  📍 Port: http://localhost:${PORT}
  🏦 Rail 1: Local Bank (NIBSS + Pollar Gasless Escrow): POST /api/verify/local
  ⚡ Rail 2: Pollar Stellar Explorer (0 XLM Gas):        POST /api/verify/pollar
  📝 Presets: GET /api/presets
===========================================================
  `);
});
