import assert from 'assert';
import { authHistoryDatabase } from '../services/authHistoryDatabase.js';

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 RUNNING DID VERIFICATION HISTORY SECURITY TEST SUITE');
  console.log('============================================================\n');

  // Reset to clean test state
  authHistoryDatabase.resetForTesting();

  // -------------------------------------------------------------
  // TEST 1: Developer Account Isolation
  // -------------------------------------------------------------
  console.log('▶ [TEST 1] Developer Account Login & History Isolation');
  const devAuth = authHistoryDatabase.authenticateDid({
    did: 'did:key:z6MkuDevEngineer998877665544',
    authenticationMethod: 'DEVELOPER_DIAGNOSTIC',
    deviceId: 'dev_workstation_linux_01',
    deviceName: 'Developer Workstation',
    deviceType: 'desktop',
    role: 'developer',
    displayName: 'Core Dev'
  });

  assert.strictEqual(devAuth.user.role, 'developer', 'User should have developer role');

  // Developer performs DID verification
  const devRec = authHistoryDatabase.recordAuthentication({
    userId: devAuth.user.id,
    did: devAuth.user.did,
    sessionId: devAuth.session.id,
    deviceId: devAuth.session.deviceId,
    deviceName: devAuth.session.deviceName,
    deviceType: devAuth.session.deviceType,
    authenticationMethod: 'DEVELOPER_DIAGNOSTIC',
    verificationStatus: 'SUCCESS',
    transactionReference: 'DEV_TEST_TX_REF_001',
    verificationResult: {
      rail: 'LOCAL_BANK',
      badgeTitle: 'VERIFIED AUTHENTIC',
      badgeColor: 'emerald',
      sender: 'Dev Test Bank',
      receiver: 'Dev Recipient',
      amount: '₦10,000.00',
      currency: 'NGN',
      proofHash: '0xdev0001',
      flags: []
    },
    isDeveloperLog: true
  });

  const devHistory = authHistoryDatabase.getUserHistory(devAuth.user.id);
  assert.ok(
    devHistory.records.some(r => r.id === devRec.id),
    'Developer should see their own verification record'
  );
  console.log('  ✓ Developer successfully authenticated and sees own permitted history');

  // -------------------------------------------------------------
  // TEST 2: New User on Another Phone (Developer History Must NOT Appear)
  // -------------------------------------------------------------
  console.log('▶ [TEST 2] New User on Mobile Phone (Developer History Leak Prevention)');
  const mobileUser = authHistoryDatabase.authenticateDid({
    did: 'did:key:z6MkuUserMobilePhone11223344',
    authenticationMethod: 'DID_KEY_PASSKEY',
    deviceId: 'dev_iphone_16_pro_max',
    deviceName: 'iPhone 16 Pro Max',
    deviceType: 'mobile',
    displayName: 'Mobile Shopper'
  });

  assert.strictEqual(mobileUser.user.role, 'user', 'Mobile user should have normal user role');

  const mobileHistory = authHistoryDatabase.getUserHistory(mobileUser.user.id);
  assert.strictEqual(mobileHistory.records.length, 0, 'New user should have 0 records initially');
  assert.ok(
    !mobileHistory.records.some(r => r.id === devRec.id),
    'CRITICAL: Developer verification records MUST NOT appear in new user history!'
  );
  console.log('  ✓ New phone user sees ONLY their empty history; zero developer records leaked');

  // -------------------------------------------------------------
  // TEST 3: Two Independent Users (User A & User B Isolation)
  // -------------------------------------------------------------
  console.log('▶ [TEST 3] Two Independent Users (User A: 3 Verifications, User B: 2 Verifications)');
  const userA = authHistoryDatabase.authenticateDid({
    did: 'did:key:z6MkuUserAlpha11111111',
    authenticationMethod: 'DID_KEY_PASSKEY',
    deviceId: 'dev_phone_userA',
    deviceName: 'Samsung Galaxy S24',
    deviceType: 'mobile',
    displayName: 'User Alpha'
  });

  const userB = authHistoryDatabase.authenticateDid({
    did: 'did:key:z6MkuUserBeta22222222',
    authenticationMethod: 'DID_POLLAR_WEB3',
    deviceId: 'dev_laptop_userB',
    deviceName: 'Dell XPS 15',
    deviceType: 'desktop',
    displayName: 'User Beta'
  });

  // User A performs 3 verifications
  for (let i = 1; i <= 3; i++) {
    authHistoryDatabase.recordAuthentication({
      userId: userA.user.id,
      did: userA.user.did,
      sessionId: userA.session.id,
      deviceId: userA.session.deviceId,
      deviceName: userA.session.deviceName,
      deviceType: userA.session.deviceType,
      authenticationMethod: 'DID_KEY_PASSKEY',
      verificationStatus: 'SUCCESS',
      transactionReference: `USER_A_TX_${i}`,
      verificationResult: {
        rail: 'LOCAL_BANK',
        badgeTitle: 'VERIFIED AUTHENTIC',
        badgeColor: 'emerald',
        sender: 'User A Bank',
        receiver: 'Merchant A',
        amount: `₦${i * 50000}.00`,
        currency: 'NGN',
        proofHash: `0xuserA_${i}`,
        flags: []
      }
    });
  }

  // User B performs 2 verifications
  for (let j = 1; j <= 2; j++) {
    authHistoryDatabase.recordAuthentication({
      userId: userB.user.id,
      did: userB.user.did,
      sessionId: userB.session.id,
      deviceId: userB.session.deviceId,
      deviceName: userB.session.deviceName,
      deviceType: userB.session.deviceType,
      authenticationMethod: 'DID_POLLAR_WEB3',
      verificationStatus: j === 1 ? 'SUCCESS' : 'TAMPERED',
      transactionReference: `USER_B_TX_${j}`,
      verificationResult: {
        rail: 'POLLAR_STELLAR',
        badgeTitle: j === 1 ? 'VERIFIED AUTHENTIC' : 'FORGERY DETECTED',
        badgeColor: j === 1 ? 'emerald' : 'crimson',
        sender: 'User B Wallet',
        receiver: 'Merchant B',
        amount: `${j * 25} USDC`,
        currency: 'USDC',
        proofHash: `0xuserB_${j}`,
        flags: []
      }
    });
  }

  const historyA = authHistoryDatabase.getUserHistory(userA.user.id);
  const historyB = authHistoryDatabase.getUserHistory(userB.user.id);

  assert.strictEqual(historyA.records.length, 3, 'User A must see exactly 3 records');
  assert.strictEqual(historyB.records.length, 2, 'User B must see exactly 2 records');

  // Verify cross-contamination check
  for (const rec of historyA.records) {
    assert.strictEqual(rec.userId, userA.user.id, 'Record in A must strictly belong to user A');
    assert.ok(!rec.transactionReference.includes('USER_B'), 'User A must not see any of User B\'s transactions');
  }

  for (const rec of historyB.records) {
    assert.strictEqual(rec.userId, userB.user.id, 'Record in B must strictly belong to user B');
    assert.ok(!rec.transactionReference.includes('USER_A'), 'User B must not see any of User A\'s transactions');
  }

  console.log('  ✓ User A sees exactly 3 records, User B sees exactly 2 records. Strict isolation confirmed.');

  // -------------------------------------------------------------
  // TEST 4: Same Device, Different Accounts
  // -------------------------------------------------------------
  console.log('▶ [TEST 4] Same Device, Different Accounts (Logout & Session Invalidation)');
  const sharedDeviceId = 'dev_shared_kiosk_terminal_01';

  // Account 1 logs in on shared device
  const session1 = authHistoryDatabase.authenticateDid({
    did: 'did:key:z6MkuKioskUserOne1111111',
    deviceId: sharedDeviceId,
    deviceName: 'Public Kiosk Terminal',
    deviceType: 'desktop'
  });

  authHistoryDatabase.recordAuthentication({
    userId: session1.user.id,
    did: session1.user.did,
    sessionId: session1.session.id,
    deviceId: sharedDeviceId,
    deviceName: 'Public Kiosk Terminal',
    authenticationMethod: 'DID_KEY_PASSKEY',
    verificationStatus: 'SUCCESS',
    transactionReference: 'KIOSK_TX_USER_1',
    verificationResult: {
      rail: 'LOCAL_BANK',
      badgeTitle: 'VERIFIED AUTHENTIC',
      badgeColor: 'emerald',
      sender: 'Kiosk Bank',
      receiver: 'Kiosk Recipient',
      amount: '₦5,000.00',
      currency: 'NGN',
      proofHash: '0xkiosk1',
      flags: []
    }
  });

  // Account 1 logs out
  const loggedOut = authHistoryDatabase.invalidateSession(session1.token);
  assert.strictEqual(loggedOut, true, 'Session 1 must be invalidated upon logout');
  assert.strictEqual(authHistoryDatabase.getSession(session1.token), null, 'Invalidated session must return null');

  // Account 2 logs in on the EXACT SAME device
  const session2 = authHistoryDatabase.authenticateDid({
    did: 'did:key:z6MkuKioskUserTwo2222222',
    deviceId: sharedDeviceId,
    deviceName: 'Public Kiosk Terminal',
    deviceType: 'desktop'
  });

  const historyKioskUser2 = authHistoryDatabase.getUserHistory(session2.user.id);
  assert.strictEqual(historyKioskUser2.records.length, 0, 'User 2 must start with 0 records');
  assert.ok(
    !historyKioskUser2.records.some(r => r.transactionReference === 'KIOSK_TX_USER_1'),
    'CRITICAL: User 2 must NEVER see User 1\'s history even on the identical device and IP!'
  );
  console.log('  ✓ Same physical device used by two accounts: User 2 sees zero traces of User 1.');

  // -------------------------------------------------------------
  // TEST 5: Different Devices, Same Account (Account-Wide History & Device Filter)
  // -------------------------------------------------------------
  console.log('▶ [TEST 5] Different Devices, Same Account (Phone & Laptop Sync + Device Filter)');
  const roamingUserDid = 'did:key:z6MkuRoamingAccountHolder55555';

  // Login from Phone
  const phoneSession = authHistoryDatabase.authenticateDid({
    did: roamingUserDid,
    deviceId: 'dev_roaming_iphone_15',
    deviceName: 'iPhone 15',
    deviceType: 'mobile'
  });

  // Verify on Phone
  authHistoryDatabase.recordAuthentication({
    userId: phoneSession.user.id,
    did: roamingUserDid,
    sessionId: phoneSession.session.id,
    deviceId: phoneSession.session.deviceId,
    deviceName: phoneSession.session.deviceName,
    deviceType: 'mobile',
    authenticationMethod: 'DID_KEY_PASSKEY',
    verificationStatus: 'SUCCESS',
    transactionReference: 'ROAMING_PHONE_TX_01',
    verificationResult: {
      rail: 'LOCAL_BANK',
      badgeTitle: 'VERIFIED AUTHENTIC',
      badgeColor: 'emerald',
      sender: 'Roaming User Phone',
      receiver: 'Coffee Shop',
      amount: '₦3,500.00',
      currency: 'NGN',
      proofHash: '0xphone01',
      flags: []
    }
  });

  // Login from Laptop with SAME DID
  const laptopSession = authHistoryDatabase.authenticateDid({
    did: roamingUserDid,
    deviceId: 'dev_roaming_macbook_pro',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop'
  });

  assert.strictEqual(
    phoneSession.user.id,
    laptopSession.user.id,
    'Both devices must bind to the same unified account ID'
  );

  // Verify on Laptop
  authHistoryDatabase.recordAuthentication({
    userId: laptopSession.user.id,
    did: roamingUserDid,
    sessionId: laptopSession.session.id,
    deviceId: laptopSession.session.deviceId,
    deviceName: laptopSession.session.deviceName,
    deviceType: 'desktop',
    authenticationMethod: 'DID_POLLAR_WEB3',
    verificationStatus: 'SUCCESS',
    transactionReference: 'ROAMING_LAPTOP_TX_02',
    verificationResult: {
      rail: 'POLLAR_STELLAR',
      badgeTitle: 'VERIFIED AUTHENTIC',
      badgeColor: 'emerald',
      sender: 'Roaming User Laptop',
      receiver: 'Hardware Store',
      amount: '50 USDC',
      currency: 'USDC',
      proofHash: '0xlaptop02',
      flags: []
    }
  });

  // Account-wide history query (from either device)
  const fullAccountHistory = authHistoryDatabase.getUserHistory(phoneSession.user.id);
  assert.strictEqual(fullAccountHistory.records.length, 2, 'Account-wide history must include both phone and laptop records');

  // Filter by phone only
  const phoneOnly = authHistoryDatabase.getUserHistory(phoneSession.user.id, { deviceId: 'dev_roaming_iphone_15' });
  assert.strictEqual(phoneOnly.records.length, 1, 'Device filter for phone must return exactly 1 record');
  assert.strictEqual(phoneOnly.records[0].transactionReference, 'ROAMING_PHONE_TX_01');

  // Filter by laptop only
  const laptopOnly = authHistoryDatabase.getUserHistory(phoneSession.user.id, { deviceId: 'dev_roaming_macbook_pro' });
  assert.strictEqual(laptopOnly.records.length, 1, 'Device filter for laptop must return exactly 1 record');
  assert.strictEqual(laptopOnly.records[0].transactionReference, 'ROAMING_LAPTOP_TX_02');

  console.log('  ✓ Unified account history spans multiple devices. Device-specific filtering works seamlessly.');

  // -------------------------------------------------------------
  // TEST 6: Unauthorized API Access & IDOR Defense
  // -------------------------------------------------------------
  console.log('▶ [TEST 6] Unauthorized Cross-User Access & IDOR Defense');
  // Record belonging to User A
  const recordA = historyA.records[0];

  // User B attempts to read User A's record by ID
  const idorAttempt = authHistoryDatabase.getRecordById(
    recordA.id,
    userB.user.id, // User B as requester
    userB.user.role // 'user'
  );

  assert.strictEqual(idorAttempt.authorized, false, 'Backend MUST reject User B accessing User A\'s record');
  assert.strictEqual(idorAttempt.record, null, 'No record data leaked in response');
  assert.ok(idorAttempt.error?.includes('Access denied'), 'Error message states access denied');

  // User A reads their own record
  const legitimateAccess = authHistoryDatabase.getRecordById(
    recordA.id,
    userA.user.id,
    userA.user.role
  );
  assert.strictEqual(legitimateAccess.authorized, true, 'User A should access their own record');
  assert.strictEqual(legitimateAccess.record?.id, recordA.id, 'Record returned matches requested ID');

  console.log('  ✓ IDOR attack blocked! User B received 403 Access Denied when querying User A\'s record ID.');

  // -------------------------------------------------------------
  // TEST 7: Developer Testing Isolation
  // -------------------------------------------------------------
  console.log('▶ [TEST 7] Developer Testing Isolation from Ordinary User Dashboards');
  // Developer records test verification
  const devDiagnosticRecord = authHistoryDatabase.recordAuthentication({
    userId: devAuth.user.id,
    did: devAuth.user.did,
    sessionId: devAuth.session.id,
    deviceId: devAuth.session.deviceId,
    deviceName: 'Developer Debug Test Rig',
    authenticationMethod: 'DEVELOPER_DIAGNOSTIC',
    verificationStatus: 'TAMPERED',
    transactionReference: 'DEV_DIAGNOSTIC_TAMPER_001',
    verificationResult: {
      rail: 'LOCAL_BANK',
      badgeTitle: 'CANVA FAKE ALERT TEST VECTOR',
      badgeColor: 'crimson',
      sender: 'Dev Simulated Sender',
      receiver: 'Dev Target',
      amount: '₦999,999.00',
      currency: 'NGN',
      proofHash: '0xdevdiag999',
      flags: ['FORGERY TEST HARNESS']
    },
    isDeveloperLog: true
  });

  // Query ordinary users (User A, User B, Mobile User)
  const auditAlice = authHistoryDatabase.getUserHistory(userA.user.id);
  const auditBob = authHistoryDatabase.getUserHistory(userB.user.id);
  const auditMobile = authHistoryDatabase.getUserHistory(mobileUser.user.id);

  assert.ok(!auditAlice.records.some(r => r.id === devDiagnosticRecord.id), 'Dev record must not appear in Alice\'s history');
  assert.ok(!auditBob.records.some(r => r.id === devDiagnosticRecord.id), 'Dev record must not appear in Bob\'s history');
  assert.ok(!auditMobile.records.some(r => r.id === devDiagnosticRecord.id), 'Dev record must not appear in Mobile user history');

  // Query Developer Logs (Permitted)
  const devLogs = authHistoryDatabase.getDeveloperDiagnosticLogs(devAuth.user.id, devAuth.user.role);
  assert.ok(devLogs.some(r => r.id === devDiagnosticRecord.id), 'Dev record must be in Developer Diagnostic Logs');

  // Ordinary user attempts to read developer logs -> Expect error
  assert.throws(
    () => {
      authHistoryDatabase.getDeveloperDiagnosticLogs(userA.user.id, userA.user.role);
    },
    /Access denied/,
    'Ordinary user querying developer logs must throw Access Denied'
  );

  console.log('  ✓ Developer test records completely segregated from ordinary user dashboards.');

  console.log('\n============================================================');
  console.log('🎉 ALL 7 SECURITY & PRIVACY VERIFICATION TESTS PASSED!');
  console.log('============================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});

