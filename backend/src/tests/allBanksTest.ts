import { verifyAndAnchorLocalBankReceipt } from '../services/nibssVerifier.js';

async function testAllBanksSuite() {
  console.log('============================================================');
  console.log('🧪 COMPREHENSIVE MULTI-BANK VERIFICATION SUITE');
  console.log('============================================================');

  const banks = [
    { name: 'Guaranty Trust Bank (GTBank)', id: '000013261114120000100004998231', amount: 50000 },
    { name: 'Access Bank PLC', id: '000014261114120000100004998232', amount: 35000 },
    { name: 'Zenith Bank PLC', id: '000015261114120000100004998233', amount: 120000 },
    { name: 'First Bank of Nigeria', id: '000011261114120000100004998234', amount: 75000 },
    { name: 'United Bank for Africa (UBA)', id: '000016261114120000100004998235', amount: 20000 },
    { name: 'Wema Bank / ALAT', id: '000017261114120000100004998236', amount: 15000 },
    { name: 'Moniepoint Microfinance Bank', id: '090405261114120000100004998237', amount: 9000 },
    { name: 'Kuda Microfinance Bank', id: '090267261114120000100004998238', amount: 4500 },
    { name: 'PalmPay Limited', id: '100033261114120000100004998239', amount: 18000 },
    { name: 'OPay Digital Services', id: '261114120000277826159899', amount: 8000 },
    { name: 'Stanbic IBTC Bank', id: '000023261114120000100004998240', amount: 250000 },
    { name: 'Fidelity Bank PLC', id: '000010261114120000100004998241', amount: 62000 },
    { name: 'First City Monument Bank (FCMB)', id: '000003261114120000100004998242', amount: 44000 }
  ];

  let passed = 0;
  for (const b of banks) {
    const res = await verifyAndAnchorLocalBankReceipt({
      sessionId: b.id,
      senderBank: b.name,
      receiverBank: 'OPay Digital Services',
      amount: b.amount,
      currency: 'NGN'
    });

    const isOk = res.status === 'VERIFIED' && res.pollarAnchor.escrowStatus === 'ESCROW_RELEASED';
    if (isOk) {
      passed++;
      console.log(`  ✓ [${b.name}] => ${res.status} | Escrow: ${res.pollarAnchor.escrowStatus} | Rail: ${res.routingPipeline.sender.institution}`);
    } else {
      console.error(`  ✗ [${b.name}] FAILED: Status=${res.status}, Badge=${res.badgeTitle}`);
    }
  }

  console.log('============================================================');
  console.log(`🎉 Result: ${passed}/${banks.length} Nigerian Banks and FinTechs Verified Successfully!`);
  console.log('============================================================');

  if (passed !== banks.length) {
    throw new Error(`Suite failure: only ${passed}/${banks.length} banks passed.`);
  }
}

testAllBanksSuite().catch(err => {
  console.error(err);
  process.exit(1);
});
