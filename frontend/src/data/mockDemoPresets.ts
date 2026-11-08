export interface DemoPresetItem {
  id: string;
  name: string;
  subtitle: string;
  rail: 'LOCAL_BANK' | 'ZCASH';
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
    name: 'Demo 1: Valid GTBank ₦150k Receipt + Ironwood Memo Seal',
    subtitle: 'NIBSS 000013 | Anchored inside Zcash Ironwood (NU6.3) 512-Byte Memo',
    rail: 'LOCAL_BANK',
    expectedBadge: 'VERIFIED',
    description: 'A genuine ₦150,000 GTBank-to-OPay transfer. Demonstrates 30-digit NIBSS Session ID decoding, timestamp match within 0s, high entropy, and generates a SHA-256 fingerprint anchored inside a Zcash Ironwood (NU6.3) 512-byte Shielded Memo to guarantee privacy-preserving anti-double-spend.',
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
      remarks: 'iPhone 15 Pro Purchase — Ironwood Shielded Anti-Replay Sealed'
    }
  },
  {
    id: 'demo-2-fake-opay-alert',
    name: 'Demo 2: Fake OPay Alert (Session ID Timestamp Mismatch)',
    subtitle: 'Visual timestamp differs by 8,400s + Mismatched Bank Routing Code',
    rail: 'LOCAL_BANK',
    expectedBadge: 'TAMPERED',
    description: 'A spoofed fake-alert receipt generated using an APK tool. The visual receipt banner displays GTBank, but digits 1-6 encode Access Bank (000014), the timestamp claims today while the session ID date is years in the past, and serial ends with 111111111111 repeating dummy digits.',
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
      remarks: 'Fake alert generator export',
      forgeryNotes: [
        'Receipt banner claims GTBank, but NIBSS digits 1-6 mathematically decode to Access Bank (000014)',
        'Visual receipt timestamp differs from cryptographic NIBSS timestamp by >8,400s',
        'Serial digits 19-30 are 111111111111 (Entropy: 0.0 bits - Synthetic repetition signature)',
        'Binary metadata tag: CANVA / FAKE ALERT APK GENERATOR'
      ]
    }
  },
  {
    id: 'demo-3-zcash-shielded-u1',
    name: 'Demo 3: Zcash Shielded u1 Tx + Viewing Key Decryption',
    subtitle: 'ZIP-316 Unified Address + Ironwood/Orchard Pool Note Disclosure',
    rail: 'ZCASH',
    expectedBadge: 'VERIFIED',
    description: 'A confidential Ironwood (NU6.3) / Orchard pool transaction on Zcash. Demonstrates Selective Disclosure: using a Unified Viewing Key (uview1...) to reveal 2.45000000 ZEC ($94.33 USD / ₦146,204 NGN) and decrypt the 512-byte encrypted memo without compromising the user\'s private spending key.',
    payload: {
      txid: '0xf9b8c2d1e0a987654321fedcba0987654321fedcba0987654321fedcba098765',
      unifiedAddress: 'u1z0987654321abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef0123456789',
      viewingKey: 'uview1q8h0e8d7s6a5z4x3c2v1b0n9m8l7k6j5h4g3f2d1s0a9z8y7x6w5v4u3t2r1'
    }
  },
  {
    id: 'demo-4-reused-receipt-replay',
    name: 'Demo 4: Re-Used Receipt Double-Spend Attack Trap',
    subtitle: 'Re-submits Demo 1 receipt to Victoria Island Branch to trigger Amber Interception',
    rail: 'LOCAL_BANK',
    expectedBadge: 'DUPLICATE',
    description: 'Simulates a buyer presenting the genuine Demo 1 receipt a second time to claim merchandise at a different merchant branch. DualVerifier queries the Zcash Shielded Memo Registry, identifies the matching SHA-256 fingerprint, and intercepts the double-spend in real time with an amber alert.',
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

