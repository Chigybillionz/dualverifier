export interface DemoPresetItem {
  id: string;
  name: string;
  subtitle: string;
  rail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ZCASH';
  expectedBadge: 'VERIFIED' | 'TAMPERED' | 'DUPLICATE';
  description: string;
  payload: any;
  receiptVisual?: {
    senderName: string;
    senderBank: string;
    senderBankCode: string;
    receiverName: string;
    receiverBank: string;
    receiverAccount: string;
    amount: number;
    amountFormatted: string;
    currency: string;
    timestamp: string;
    sessionId: string;
    remarks: string;
    forgeryNotes?: string[];
  };
}

export const MOCK_DEMO_PRESETS: DemoPresetItem[] = [
  {
    id: 'demo-1-valid-gtb-150k',
    name: 'Demo 1: Valid GTBank ₦150k Receipt + Pollar Gasless Escrow',
    subtitle: 'NIBSS 000013 | Anchored on Stellar via Pollar SDK ($98.68 USDC Released)',
    rail: 'LOCAL_BANK',
    expectedBadge: 'VERIFIED',
    description: 'A genuine ₦150,000 GTBank-to-OPay transfer. Demonstrates 30-digit NIBSS Session ID decoding, timestamp match within 0s, high entropy, and generates a SHA-256 fingerprint anchored on the Stellar blockchain via Pollar SDK with 100% sponsored gas fees.',
    payload: {
      sessionId: '000013260315143022100004998231',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Chibuike Okonkwo',
      receiverBank: 'OPay Digital Services Limited',
      receiverName: 'Lekki Gadget Depot Ltd',
      receiverAccount: '9012345678',
      amount: 150000,
      currency: 'NGN',
      receiptTimestamp: '2026-03-15T14:30:22+01:00',
      claimantMerchant: 'Lekki Gadget Depot Ltd'
    },
    receiptVisual: {
      senderName: 'Chibuike Okonkwo',
      senderBank: 'Guaranty Trust Bank',
      senderBankCode: '000013',
      receiverName: 'Lekki Gadget Depot Ltd',
      receiverBank: 'OPay Digital Services Limited',
      receiverAccount: '9012345678',
      amount: 150000,
      amountFormatted: '₦150,000.00',
      currency: 'NGN',
      timestamp: '15 Mar 2026, 02:30:22 PM',
      sessionId: '000013260315143022100004998231',
      remarks: 'iPhone 15 Pro Purchase — Pollar Gasless Stellar Escrow Settled'
    }
  },
  {
    id: 'demo-2-fake-opay-alert',
    name: 'Demo 2: Fake OPay Alert (Session ID Timestamp Mismatch)',
    subtitle: 'Visual timestamp differs by 8,400s + Mismatched Bank Routing Code',
    rail: 'LOCAL_BANK',
    expectedBadge: 'TAMPERED',
    description: 'A spoofed fake-alert receipt generated using an APK tool. The visual receipt banner displays GTBank, but digits 1-6 encode Access Bank (000014), the timestamp claims today while the session ID date is years in the past, and serial ends with 111111111111 repeating dummy digits. Pollar escrow locks immediately.',
    payload: {
      sessionId: '000014240101000000111111111111',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Adeola Bakare (Spoofed)',
      receiverBank: 'OPay Digital Services Limited',
      receiverName: 'Emmanuel Chukwuma (Store Owner)',
      receiverAccount: '8034567890',
      amount: 85000,
      currency: 'NGN',
      receiptTimestamp: '2026-11-04T14:30:00+01:00',
      simulatedTamperScore: 24,
      flaggedSoftware: 'CANVA / FAKE ALERT APK GENERATOR'
    },
    receiptVisual: {
      senderName: 'Adeola Bakare',
      senderBank: 'Guaranty Trust Bank (Spoofed Banner)',
      senderBankCode: '000014 (Access Bank Mismatch!)',
      receiverName: 'Emmanuel Chukwuma',
      receiverBank: 'OPay Digital Services',
      receiverAccount: '8034567890',
      amount: 85000,
      amountFormatted: '₦85,000.00',
      currency: 'NGN',
      timestamp: '04 Nov 2026, 02:30:00 PM',
      sessionId: '000014240101000000111111111111',
      remarks: 'Fake alert generator export — Pollar Escrow Locked',
      forgeryNotes: [
        'Receipt banner claims GTBank, but NIBSS digits 1-6 mathematically decode to Access Bank (000014)',
        'Visual receipt timestamp differs from cryptographic NIBSS timestamp by >8,400s',
        'Serial digits 19-30 are 111111111111 (Entropy: 0.0 bits - Synthetic repetition signature)',
        'Binary metadata tag: CANVA / FAKE ALERT APK GENERATOR',
        'Pollar Escrow Action: Payout aborted, merchant wallet protected'
      ]
    }
  },
  {
    id: 'demo-3-pollar-stellar-settlement',
    name: 'Demo 3: Pollar Smart Wallet + Gasless Stellar Escrow',
    subtitle: 'Stellar Testnet Tx + Pollar Paymaster (0 XLM Gas Fees)',
    rail: 'POLLAR_STELLAR',
    expectedBadge: 'VERIFIED',
    description: 'A live on-chain demonstration of Pollar (@pollar/core) on Stellar. Verifies a gasless transaction where the buyer deposited fiat, the proof hash was written to the Stellar transaction memo, and $98.68 USDC was released to the merchant with zero network fee deducted.',
    payload: {
      txid: 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
      walletAddress: 'GDPOLLAR7VERIFIER4STELLAR9COMMERCE3LAGOS01',
      sessionId: '000013260315143022100004998231'
    }
  },
  {
    id: 'demo-4-reused-receipt-replay',
    name: 'Demo 4: Re-Used Receipt Double-Spend Attack Trap',
    subtitle: 'Re-submits Demo 1 receipt to Victoria Island Branch to trigger Amber Interception',
    rail: 'LOCAL_BANK',
    expectedBadge: 'DUPLICATE',
    description: 'Simulates a buyer presenting the genuine Demo 1 receipt a second time to claim merchandise at a different merchant branch. DualVerifier queries the Pollar Stellar Registry, identifies the matching SHA-256 fingerprint, and intercepts the double-spend in real time with an amber alert.',
    payload: {
      sessionId: '000013260315143022100004998231',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Chibuike Okonkwo',
      receiverBank: 'OPay Digital Services Limited',
      receiverName: 'Lekki Gadget Depot Ltd',
      receiverAccount: '9012345678',
      amount: 150000,
      currency: 'NGN',
      receiptTimestamp: '2026-03-15T14:30:22+01:00',
      claimantMerchant: 'Victoria Island Branch (Replay Attempt)'
    }
  }
];
