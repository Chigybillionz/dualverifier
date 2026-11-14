import { verifyAndAnchorLocalBankReceipt } from '../services/nibssVerifier.js';

async function runComprehensiveTest() {
  console.log('============================================================');
  console.log('🧪 REAL VS FAKE RECEIPT VERIFICATION BENCHMARK');
  console.log('============================================================');

  const realRef = '261114083015498826159844';

  // 1. First presentation of a legitimate real receipt
  console.log('\n▶ [TEST 1] First Submission of Real Legitimate Receipt:');
  const res1 = await verifyAndAnchorLocalBankReceipt({
    sessionId: realRef,
    senderBank: 'OPay Digital Services',
    senderName: 'Chigozie Jehoshaphat Okorie',
    receiverBank: 'Access Bank PLC',
    receiverName: 'Adebayo Adeleke',
    amount: 15000,
    currency: 'NGN'
  });
  console.log('  Status:', res1.status, '| Badge:', res1.badgeTitle, '| Escrow:', res1.pollarAnchor.escrowStatus);
  if (res1.status !== 'VERIFIED' || res1.pollarAnchor.escrowStatus !== 'ESCROW_RELEASED') {
    throw new Error('Test 1 failed: Real receipt was not verified authentic!');
  }
  console.log('  ✓ Verified Authentic & Escrow Released');

  // 2. Second presentation of the exact same receipt (Replay Attack)
  console.log('\n▶ [TEST 2] Replay Fraud Detection (Double-Spending Same Receipt):');
  const res2 = await verifyAndAnchorLocalBankReceipt({
    sessionId: realRef,
    senderBank: 'OPay Digital Services',
    senderName: 'Chigozie Jehoshaphat Okorie',
    receiverBank: 'Access Bank PLC',
    receiverName: 'Adebayo Adeleke',
    amount: 15000,
    currency: 'NGN'
  });
  console.log('  Status:', res2.status, '| Badge:', res2.badgeTitle, '| Claims:', res2.pollarAnchor.claimCount);
  if (res2.status !== 'DUPLICATE') {
    throw new Error('Test 2 failed: Duplicate replay was not caught!');
  }
  console.log('  ✓ Replay Trap triggered! Double-spending blocked by on-chain registry');

  // 3. Forged Fake Canva Receipt (Mismatched Bank Code + Synthetic Repetition)
  console.log('\n▶ [TEST 3] Fake-Alert Generator / Canva Spoof Detection:');
  const res3 = await verifyAndAnchorLocalBankReceipt({
    sessionId: '000014240101000000111111111111',
    senderBank: 'Guaranty Trust Bank (GTBank)',
    senderName: 'Adeola Bakare (Spoofed)',
    receiverBank: 'OPay Digital Services',
    receiverName: 'Emmanuel Chukwuma (Merchant)',
    amount: 85000,
    currency: 'NGN',
    flaggedSoftware: 'CANVA'
  });
  console.log('  Status:', res3.status, '| Badge:', res3.badgeTitle);
  if (res3.status !== 'TAMPERED') {
    throw new Error('Test 3 failed: Fake receipt was not flagged as tampered!');
  }
  console.log('  ✓ Fake Canva Alert correctly flagged as TAMPERED');

  console.log('\n============================================================');
  console.log('🎉 ALL BENCHMARKS PASSED: Real receipts VERIFY, fake receipts are FLAGGED, and replays are BLOCKED!');
  console.log('============================================================');
}

runComprehensiveTest();
