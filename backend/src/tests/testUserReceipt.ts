import { verifyAndAnchorLocalBankReceipt } from '../services/nibssVerifier.js';

async function testUserPayload() {
  const sessionId = '0336730210003326111206241240';
  const res = await verifyAndAnchorLocalBankReceipt({
    sessionId,
    senderBank: 'OPay Digital Services',
    senderName: 'DAVID OKEIA',
    receiverBank: 'PalmPay Limited',
    receiverName: 'Enjoy Seamless and Unlimited Free Transfers All Banks.',
    amount: 50000,
    currency: 'NGN'
  });

  console.log('STATUS:', res.status);
  console.log('BADGE:', res.badgeTitle);
  console.log('FLAGS:', res.forensics.flags);
}

testUserPayload();

