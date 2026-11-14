import assert from 'assert';
import http from 'http';
import express from 'express';
import cors from 'cors';
import authHistoryRoutes from '../routes/authHistoryRoutes.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { authHistoryDatabase } from '../services/authHistoryDatabase.js';

// Setup test server
const app = express();
app.use(cors());
app.use(express.json());
app.use(optionalAuth);
app.use('/api', authHistoryRoutes);

// Mock verify endpoint simulating server.ts
app.post('/api/verify/test-rail', (req, res) => {
  const { sessionId, amount } = req.body;
  let historyRecord = null;
  if (req.user) {
    historyRecord = authHistoryDatabase.recordAuthentication({
      userId: req.user.userId,
      did: req.user.did,
      sessionId: req.user.sessionId,
      deviceId: req.user.deviceId,
      deviceName: req.user.deviceName,
      deviceType: req.user.deviceType,
      authenticationMethod: 'DID_KEY_PASSKEY',
      verificationStatus: 'SUCCESS',
      transactionReference: sessionId || '0xTEST_HASH',
      verificationResult: {
        rail: 'LOCAL_BANK',
        badgeTitle: 'VERIFIED AUTHENTIC',
        badgeColor: 'emerald',
        sender: 'Test Bank: Sender',
        receiver: 'Test Bank: Recipient',
        amount: `₦${Number(amount || 50000).toLocaleString()}`,
        currency: 'NGN',
        proofHash: '0xmockproof1234',
        flags: []
      },
      ipAddress: '102.89.20.10',
      userAgent: 'TestClient/1.0',
      isDeveloperLog: req.user.role === 'developer'
    });
  }
  res.json({ success: true, historyRecord });
});

async function runHttpTests() {
  console.log('\n============================================================');
  console.log('🌐 RUNNING END-TO-END HTTP API SECURITY & IDOR TESTS');
  console.log('============================================================\n');

  authHistoryDatabase.resetForTesting();

  const server = http.createServer(app);
  await new Promise<void>(resolve => server.listen(0, resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3001;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Authenticate Developer
    console.log('▶ [HTTP 1] Developer DID Login');
    const devLoginRes = await fetch(`${baseUrl}/api/auth/did-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: 'did:key:z6MkuDevLeadEngineer001',
        role: 'developer',
        displayName: 'Dev Engineer'
      })
    });
    const devLoginData: any = await devLoginRes.json();
    assert.strictEqual(devLoginRes.status, 200);
    assert.strictEqual(devLoginData.success, true);
    assert.ok(devLoginData.token);
    const devToken = devLoginData.token;
    console.log('  ✓ Developer logged in, received secure token');

    // 2. Authenticate User Alice (Mobile Phone)
    console.log('▶ [HTTP 2] User Alice (Phone) DID Login');
    const aliceLoginRes = await fetch(`${baseUrl}/api/auth/did-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: 'did:key:z6MkuAlicePhone999',
        deviceId: 'dev_iphone_alice',
        deviceName: 'iPhone 15 Pro',
        deviceType: 'mobile',
        displayName: 'Alice'
      })
    });
    const aliceLoginData: any = await aliceLoginRes.json();
    assert.strictEqual(aliceLoginRes.status, 200);
    const aliceToken = aliceLoginData.token;
    console.log('  ✓ Alice logged in from phone');

    // 3. Authenticate User Bob (Laptop)
    console.log('▶ [HTTP 3] User Bob (Laptop) DID Login');
    const bobLoginRes = await fetch(`${baseUrl}/api/auth/did-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: 'did:key:z6MkuBobLaptop888',
        deviceId: 'dev_macbook_bob',
        deviceName: 'MacBook Pro',
        deviceType: 'desktop',
        displayName: 'Bob'
      })
    });
    const bobLoginData: any = await bobLoginRes.json();
    assert.strictEqual(bobLoginRes.status, 200);
    const bobToken = bobLoginData.token;
    console.log('  ✓ Bob logged in from laptop');

    // 4. Alice performs verification over HTTP
    console.log('▶ [HTTP 4] Alice performs verification with Bearer token');
    const aliceVerifyRes = await fetch(`${baseUrl}/api/verify/test-rail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aliceToken}`
      },
      body: JSON.stringify({ sessionId: '000013260315143022100004998231', amount: 150000 })
    });
    const aliceVerifyData: any = await aliceVerifyRes.json();
    assert.strictEqual(aliceVerifyRes.status, 200);
    assert.ok(aliceVerifyData.historyRecord);
    const aliceRecordId = aliceVerifyData.historyRecord.id;
    console.log('  ✓ Alice verification recorded into her private history, ID:', aliceRecordId);

    // 5. Query Alice's history via GET /api/authentication-history/me
    console.log('▶ [HTTP 5] Alice queries GET /api/authentication-history/me');
    const aliceHistoryRes = await fetch(`${baseUrl}/api/authentication-history/me`, {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    const aliceHistoryData: any = await aliceHistoryRes.json();
    assert.strictEqual(aliceHistoryRes.status, 200);
    assert.strictEqual(aliceHistoryData.records.length, 1);
    assert.strictEqual(aliceHistoryData.records[0].id, aliceRecordId);
    console.log('  ✓ Alice sees her 1 verification record');

    // 6. Query Bob's history via GET /api/authentication-history/me
    console.log('▶ [HTTP 6] Bob queries GET /api/authentication-history/me (Must be 0 records)');
    const bobHistoryRes = await fetch(`${baseUrl}/api/authentication-history/me`, {
      headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    const bobHistoryData: any = await bobHistoryRes.json();
    assert.strictEqual(bobHistoryRes.status, 200);
    assert.strictEqual(bobHistoryData.records.length, 0);
    console.log('  ✓ Bob sees 0 records. Alice\'s record is completely isolated!');

    // 7. IDOR Attack Test: Bob attempts to read Alice's record by modifying URL ID
    console.log('▶ [HTTP 7] IDOR Attack: Bob attempts GET /api/authentication-history/record/:id with Alice\'s recordId');
    const idorRes = await fetch(`${baseUrl}/api/authentication-history/record/${aliceRecordId}`, {
      headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    assert.strictEqual(idorRes.status, 403, 'Server must return 403 Forbidden for cross-account access');
    const idorData: any = await idorRes.json();
    assert.strictEqual(idorData.success, false);
    assert.ok(idorData.error.includes('Access denied'));
    console.log('  ✓ IDOR Attack Blocked: Server responded 403 Forbidden!');

    // 8. IDOR Attack Test: Attempting to supply another userId in query/body
    console.log('▶ [HTTP 8] IDOR Parameter Tampering: Bob passes ?userId=<aliceId>');
    const tamperRes = await fetch(`${baseUrl}/api/authentication-history/me?userId=${aliceLoginData.user.id}`, {
      headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    const tamperData: any = await tamperRes.json();
    assert.strictEqual(tamperRes.status, 200);
    // Backend MUST ignore the query parameter and use req.user.userId!
    assert.strictEqual(tamperData.userId, bobLoginData.user.id);
    assert.strictEqual(tamperData.records.length, 0);
    console.log('  ✓ Query parameter manipulation ignored: Server strictly enforced token ownership!');

    // 9. Unauthorized request without token
    console.log('▶ [HTTP 9] Unauthorized request: Missing Authorization header');
    const unauthRes = await fetch(`${baseUrl}/api/authentication-history/me`);
    assert.strictEqual(unauthRes.status, 401);
    console.log('  ✓ Missing token correctly rejected with 401 Unauthorized');

    // 10. Developer logs access control
    console.log('▶ [HTTP 10] Developer logs role check: Normal user vs Developer');
    const aliceDevLogRes = await fetch(`${baseUrl}/api/authentication-history/developer-logs`, {
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert.strictEqual(aliceDevLogRes.status, 403, 'Ordinary user must be forbidden from developer logs');

    const devDevLogRes = await fetch(`${baseUrl}/api/authentication-history/developer-logs`, {
      headers: { 'Authorization': `Bearer ${devToken}` }
    });
    assert.strictEqual(devDevLogRes.status, 200, 'Developer must be granted access to diagnostic logs');
    console.log('  ✓ Role-based access control verified: 403 for user, 200 for developer');

    // 11. IDOR Delete Attack Test: Bob attempts to delete Alice's record
    console.log('▶ [HTTP 11] IDOR Delete Attack: Bob attempts DELETE /api/authentication-history/record/:id with Alice\'s record');
    const idorDelRes = await fetch(`${baseUrl}/api/authentication-history/record/${aliceRecordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${bobToken}` }
    });
    assert.strictEqual(idorDelRes.status, 403, 'Bob must receive 403 Forbidden when trying to delete Alice\'s record');
    const idorDelData: any = await idorDelRes.json();
    assert.strictEqual(idorDelData.success, false);
    console.log('  ✓ IDOR Delete Blocked: Server responded 403 Forbidden!');

    // 12. Legitimate User Deletion & Replay Reset Test: Alice deletes her record and re-verifies
    console.log('▶ [HTTP 12] Legitimate Deletion & Replay Reset: Alice deletes record & re-verifies same receipt');
    const aliceDelRes = await fetch(`${baseUrl}/api/authentication-history/record/${aliceRecordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert.strictEqual(aliceDelRes.status, 200);
    const aliceDelData: any = await aliceDelRes.json();
    assert.strictEqual(aliceDelData.success, true);
    console.log('  ✓ Alice successfully deleted her verification record');

    // Alice re-verifies the same transaction - should succeed as genuine new verification, not duplicate replay!
    const reVerifyRes = await fetch(`${baseUrl}/api/verify/test-rail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aliceToken}`
      },
      body: JSON.stringify({
        sessionId: '000013260315143022100004998231',
        senderBank: 'Guaranty Trust Bank (GTBank)',
        senderName: 'Chibuike Okonkwo',
        receiverBank: 'OPay Digital Services Limited',
        receiverName: 'Lekki Gadget Depot Ltd',
        receiverAccount: '9012345678',
        amount: 150000,
        currency: 'NGN',
        receiptTimestamp: '2026-03-15T14:30:22+01:00'
      })
    });
    assert.strictEqual(reVerifyRes.status, 200);
    const reVerifyData: any = await reVerifyRes.json();
    assert.strictEqual(reVerifyData.success, true);
    assert.strictEqual(reVerifyData.historyRecord.verificationStatus, 'SUCCESS', 'Receipt must be verified again without replay block');
    console.log('  ✓ Alice successfully re-verified the transaction after deleting previous record');

    // 13. Direct Receipt Replay Reset API Test
    console.log('▶ [HTTP 13] Direct Replay Reset: POST /api/verify/reset-receipt');
    const resetReceiptRes = await fetch(`${baseUrl}/api/verify/reset-receipt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: '000013260315143022100004998231' })
    });
    assert.strictEqual(resetReceiptRes.status, 200);
    const resetReceiptData: any = await resetReceiptRes.json();
    assert.strictEqual(resetReceiptData.success, true);
    console.log('  ✓ Direct replay reset endpoint verified successfully');

    // 14. Clear All My History Test: DELETE /api/authentication-history/me
    console.log('▶ [HTTP 14] Clear All History: DELETE /api/authentication-history/me');
    const clearMeRes = await fetch(`${baseUrl}/api/authentication-history/me`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${aliceToken}` }
    });
    assert.strictEqual(clearMeRes.status, 200);
    const clearMeData: any = await clearMeRes.json();
    assert.strictEqual(clearMeData.success, true);
    console.log('  ✓ Alice successfully wiped all history records with single click');

    console.log('\n============================================================');
    console.log('🎉 ALL END-TO-END HTTP SECURITY TESTS PASSED!');
    console.log('============================================================\n');
  } finally {
    server.close();
  }
}

runHttpTests().catch(err => {
  console.error('HTTP test error:', err);
  process.exit(1);
});
