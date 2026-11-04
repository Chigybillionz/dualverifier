export interface DemoPresetItem {
  id: string;
  name: string;
  subtitle: string;
  rail: 'LOCAL_BANK' | 'ZCASH';
  expectedBadge: 'VERIFIED' | 'TAMPERED' | 'REPLAY';
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
    id: 'preset-valid-gtb-opay',
    name: 'Preset 1: Genuine GTB ➔ OPay + Zcash Shielded Memo Anchor',
    subtitle: 'NIBSS 000013 | Anchored inside Zcash 512-Byte Encrypted Memo',
    rail: 'LOCAL_BANK',
    expectedBadge: 'VERIFIED',
    description: 'A genuine ₦50,000 GTBank-to-OPay transfer. Demonstrates 30-digit NIBSS Session ID decoding, timestamp match within 0s, high entropy, and generates a SHA-256 fingerprint anchored inside a Zcash 512-byte Shielded Memo to guarantee privacy-preserving anti-double-spend.',
    payload: {
      sessionId: '000013250324114215984716382910',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Chibuike Okonkwo',
      receiverBank: 'OPay Digital Services',
      receiverName: 'Amina Musa Provisions',
      receiverAccount: '9012345678',
      amount: 50000,
      currency: 'NGN',
      receiptTimestamp: '2025-03-24T11:42:15+01:00'
    },
    receiptVisual: {
      senderName: 'Chibuike Okonkwo',
      senderBank: 'Guaranty Trust Bank',
      senderBankCode: '000013',
      receiverName: 'Amina Musa Provisions',
      receiverBank: 'OPay Digital Services',
      receiverAccount: '9012345678',
      amount: 50000,
      amountFormatted: '₦50,000.00',
      currency: 'NGN',
      timestamp: '24 Mar 2025, 11:42:15 AM',
      sessionId: '000013250324114215984716382910',
      remarks: 'Shop stock purchase — Zcash Shielded Memo Protected'
    }
  },
  {
    id: 'preset-forged-fake-alert',
    name: 'Preset 2: Forged Fake-Alert Receipt (Canva Spoofed)',
    subtitle: 'Critical CBN Code Mismatch + 111111111111 Dummy Serial',
    rail: 'LOCAL_BANK',
    expectedBadge: 'TAMPERED',
    description: 'A spoofed ₦85,000 fake-alert receipt. Visual banner says GTBank, but digits 1-6 encode Access Bank (000014), serial ends with 111111111111 repeating dummy digits, and metadata tags indicate Canva template editing.',
    payload: {
      sessionId: '000014250518143000111111111111',
      senderBank: 'Guaranty Trust Bank (GTBank)',
      senderName: 'Adeola Bakare (Spoofed)',
      receiverBank: 'OPay Digital Services',
      receiverName: 'Emmanuel Chukwuma (Store Owner)',
      receiverAccount: '8034567890',
      amount: 85000,
      currency: 'NGN',
      receiptTimestamp: '2025-05-18T14:30:00+01:00',
      simulatedTamperScore: 24,
      flaggedSoftware: 'CANVA / APK FAKE RECEIPT BUILDER'
    },
    receiptVisual: {
      senderName: 'Adeola Bakare',
      senderBank: 'Guaranty Trust Bank (Spoofed Logo)',
      senderBankCode: '000014 (Access Bank Mismatch!)',
      receiverName: 'Emmanuel Chukwuma',
      receiverBank: 'OPay Digital Services',
      receiverAccount: '8034567890',
      amount: 85000,
      amountFormatted: '₦85,000.00',
      currency: 'NGN',
      timestamp: '18 May 2025, 02:30:00 PM',
      sessionId: '000014250518143000111111111111',
      remarks: 'Fake alert generator export',
      forgeryNotes: [
        'Receipt banner displays GTBank, but NIBSS digits 1-6 mathematically decode to Access Bank (000014)',
        'Serial digits 19-30 are 111111111111 (Entropy: 0.0 bits - Synthetic repetition signature)',
        'EXIF signature: Canva template layout export'
      ]
    }
  },
  {
    id: 'preset-zcash-shielded-disclosure',
    name: 'Preset 3: Zcash Shielded Orchard Payment (Selective Disclosure)',
    subtitle: 'Unified Address (u1...) + Viewing Key Decrypts 512-Byte Memo',
    rail: 'ZCASH',
    expectedBadge: 'VERIFIED',
    description: 'A confidential Orchard pool transaction on Zcash. Demonstrates Selective Disclosure: using a Unified Viewing Key (uview1...) to reveal 2.45000000 ZEC and decrypt the 512-byte encrypted memo without compromising the user\'s private spending key.',
    payload: {
      txid: '0x8f4d92a10e7b915c43efb82c31e9c20a4b7e8d6f1a3b5c7e9d0f2a4b6c8e0a12',
      unifiedAddress: 'u1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2',
      viewingKey: 'uview1q4k9n7e8y0t2w4x6m8p0r2s4u6v8x0z2a4c6e8g0j2l4n6q8s0u2w4x6z8a0c2e4g6j8l0n2p4r6t8v0x2z4a6c8e0g2'
    }
  }
];
