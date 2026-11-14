import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  Session,
  AuthenticationHistoryRecord,
  VerificationStatus,
  UserStats,
  UserDevice,
  AuditLogEntry,
  DeviceType
} from '../models/authHistory.js';

const DB_FILE_PATH = path.resolve(process.cwd(), 'data/auth_history_db.json');

export class AuthHistoryDatabase {
  private users: Map<string, User> = new Map();
  private usersByDid: Map<string, User> = new Map();
  private sessions: Map<string, Session> = new Map();
  private records: Map<string, AuthenticationHistoryRecord> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  // Database Index structures for sub-millisecond lookups
  private indexUserRecords: Map<string, string[]> = new Map(); // userId -> recordId[]
  private indexSessionRecords: Map<string, string[]> = new Map(); // sessionId -> recordId[]
  private indexDeviceRecords: Map<string, string[]> = new Map(); // deviceId -> recordId[]

  constructor() {
    this.ensureDataDirectory();
    this.loadDatabase();
    if (this.users.size === 0) {
      this.seedDefaultUsers();
    }
  }

  private ensureDataDirectory(): void {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadDatabase(): void {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.users)) {
          for (const u of data.users) {
            this.users.set(u.id, u);
            this.usersByDid.set(u.did.toLowerCase(), u);
          }
        }

        if (Array.isArray(data.sessions)) {
          for (const s of data.sessions) {
            this.sessions.set(s.token, s);
          }
        }

        if (Array.isArray(data.records)) {
          for (const r of data.records) {
            this.records.set(r.id, r);
            this.addIndexes(r);
          }
        }

        if (Array.isArray(data.auditLogs)) {
          this.auditLogs = data.auditLogs;
        }
      }
    } catch (err) {
      console.warn('[AuthHistoryDatabase] Error loading database file, initializing clean state:', err);
    }
  }

  private saveDatabase(): void {
    try {
      this.ensureDataDirectory();
      const payload = {
        users: Array.from(this.users.values()),
        sessions: Array.from(this.sessions.values()),
        records: Array.from(this.records.values()),
        auditLogs: this.auditLogs
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[AuthHistoryDatabase] Failed to persist database:', err);
    }
  }

  private addIndexes(record: AuthenticationHistoryRecord): void {
    // 1. Index on userId (sorted newest first)
    const userRecs = this.indexUserRecords.get(record.userId) || [];
    if (!userRecs.includes(record.id)) {
      userRecs.unshift(record.id);
      this.indexUserRecords.set(record.userId, userRecs);
    }

    // 2. Index on sessionId
    const sessionRecs = this.indexSessionRecords.get(record.sessionId) || [];
    if (!sessionRecs.includes(record.id)) {
      sessionRecs.unshift(record.id);
      this.indexSessionRecords.set(record.sessionId, sessionRecs);
    }

    // 3. Index on deviceId
    const deviceRecs = this.indexDeviceRecords.get(record.deviceId) || [];
    if (!deviceRecs.includes(record.id)) {
      deviceRecs.unshift(record.id);
      this.indexDeviceRecords.set(record.deviceId, deviceRecs);
    }
  }

  /**
   * Mask IP address to preserve user privacy (e.g. 192.168.1.100 -> 192.168.1.xxx)
   */
  public maskIpAddress(ip?: string): string {
    if (!ip || ip === '::1' || ip === '127.0.0.1') return '127.0.0.*** (Localhost)';
    const clean = ip.replace(/^::ffff:/, '');
    const parts = clean.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    // IPv6
    const v6parts = clean.split(':');
    if (v6parts.length > 2) {
      return `${v6parts[0]}:${v6parts[1]}:****:****`;
    }
    return 'Masked IP';
  }

  /**
   * Seed standard user profiles (Developer, User A, User B, Admin)
   */
  private seedDefaultUsers(): void {
    const devUser: User = {
      id: 'usr_dev_01',
      did: 'did:key:z6MkuDevInternalDiag88204194829',
      role: 'developer',
      displayName: 'Lead Engineer (Dev Diagnostics)',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    };
    this.users.set(devUser.id, devUser);
    this.usersByDid.set(devUser.did.toLowerCase(), devUser);

    const userAlice: User = {
      id: 'usr_user_alice',
      did: 'did:key:z6MkuAlicePhoneMobile77192849102',
      role: 'user',
      displayName: 'Alice Okonkwo (Mobile Verifier)',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
    };
    this.users.set(userAlice.id, userAlice);
    this.usersByDid.set(userAlice.did.toLowerCase(), userAlice);

    const userBob: User = {
      id: 'usr_user_bob',
      did: 'did:key:z6MkuBobLaptopWorkstation6619284',
      role: 'user',
      displayName: 'Bob Adebayo (Desktop Merchant)',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    };
    this.users.set(userBob.id, userBob);
    this.usersByDid.set(userBob.did.toLowerCase(), userBob);

    const adminUser: User = {
      id: 'usr_admin_01',
      did: 'did:key:z6MkuAdminSecurityOfficer9102948',
      role: 'admin',
      displayName: 'Security Auditor (Admin)',
      createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
    };
    this.users.set(adminUser.id, adminUser);
    this.usersByDid.set(adminUser.did.toLowerCase(), adminUser);

    // Seed realistic private sample history for Alice (on iPhone)
    const aliceRec1: AuthenticationHistoryRecord = {
      id: 'auth_rec_alice_001',
      userId: userAlice.id,
      did: userAlice.did,
      sessionId: 'ses_alice_iphone_01',
      deviceId: 'dev_iphone_15_pro_alice',
      deviceName: 'iPhone 15 Pro',
      deviceType: 'mobile',
      authenticationMethod: 'DID_KEY_PASSKEY',
      verificationStatus: 'SUCCESS',
      ipAddress: '102.89.34.xxx',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X)',
      transactionReference: '000013260315143022100004998231',
      verificationResult: {
        rail: 'LOCAL_BANK',
        badgeTitle: 'VERIFIED AUTHENTIC',
        badgeColor: 'emerald',
        sender: 'Guaranty Trust Bank:Chibuike Okonkwo',
        receiver: 'OPay:Lekki Gadget Depot Ltd',
        amount: '₦150,000.00',
        currency: 'NGN',
        proofHash: '0x4f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a',
        flags: []
      },
      isDeveloperLog: false,
      createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
    };
    this.records.set(aliceRec1.id, aliceRec1);
    this.addIndexes(aliceRec1);

    // Seed realistic private sample history for Bob (on MacBook)
    const bobRec1: AuthenticationHistoryRecord = {
      id: 'auth_rec_bob_001',
      userId: userBob.id,
      did: userBob.did,
      sessionId: 'ses_bob_macbook_01',
      deviceId: 'dev_macbook_pro_bob',
      deviceName: 'MacBook Pro M3',
      deviceType: 'desktop',
      authenticationMethod: 'DID_POLLAR_WEB3',
      verificationStatus: 'SUCCESS',
      ipAddress: '105.112.45.xxx',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      transactionReference: 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
      verificationResult: {
        rail: 'POLLAR_STELLAR',
        badgeTitle: 'VERIFIED AUTHENTIC',
        badgeColor: 'emerald',
        sender: 'GDPOLLAR...COMMERCE3LAGOS01',
        receiver: 'Lekki Gadget Depot Ltd',
        amount: '98.68 USDC (₦150,000)',
        currency: 'USDC',
        proofHash: '0xa8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
        stellarTxHash: 'a8f5b3c2d1e09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e',
        flags: []
      },
      isDeveloperLog: false,
      createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
    };
    this.records.set(bobRec1.id, bobRec1);
    this.addIndexes(bobRec1);

    // Seed developer test record (strictly flagged as developer diagnostic)
    const devRec1: AuthenticationHistoryRecord = {
      id: 'auth_rec_dev_diag_001',
      userId: devUser.id,
      did: devUser.did,
      sessionId: 'ses_dev_terminal_01',
      deviceId: 'dev_devstation_linux',
      deviceName: 'DevStation Linux Terminal',
      deviceType: 'desktop',
      authenticationMethod: 'DEVELOPER_DIAGNOSTIC',
      verificationStatus: 'TAMPERED',
      ipAddress: '127.0.0.*** (Localhost)',
      userAgent: 'DualVerifier-Test-Harness/3.0',
      transactionReference: '000014240101000000111111111111',
      verificationResult: {
        rail: 'LOCAL_BANK',
        badgeTitle: 'FORGED / TAMPERED RECEIPT DETECTED',
        badgeColor: 'crimson',
        sender: 'Guaranty Trust Bank:Adeola Bakare (Spoofed)',
        receiver: 'OPay:Emmanuel Chukwuma',
        amount: '₦85,000.00',
        currency: 'NGN',
        proofHash: '0x9999999999999999999999999999999999999999999999999999999999999999',
        flags: ['CANVA / FAKE ALERT APK GENERATOR DETECTED', 'Simulated forensic tamper score: 24/100']
      },
      isDeveloperLog: true,
      createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
    };
    this.records.set(devRec1.id, devRec1);
    this.addIndexes(devRec1);

    this.saveDatabase();
  }

  /**
   * Authenticate or register a DID, establishing a device-aware session
   */
  public authenticateDid(params: {
    did: string;
    authenticationMethod?: string;
    deviceId?: string;
    deviceName?: string;
    deviceType?: DeviceType;
    ipAddress?: string;
    userAgent?: string;
    role?: 'user' | 'developer' | 'admin';
    displayName?: string;
  }): { user: User; session: Session; token: string } {
    const cleanDid = params.did.trim();
    const lookupKey = cleanDid.toLowerCase();

    let user = this.usersByDid.get(lookupKey);

    if (!user) {
      // Auto-provision user account bound to this decentralized identifier
      const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
      let role: 'user' | 'developer' | 'admin' = params.role || 'user';
      if (cleanDid.toLowerCase().includes('dev')) {
        role = 'developer';
      } else if (cleanDid.toLowerCase().includes('admin')) {
        role = 'admin';
      }

      user = {
        id: userId,
        did: cleanDid,
        role,
        displayName: params.displayName || (role === 'developer' ? 'Developer' : `User (${cleanDid.slice(0, 12)}...)`),
        createdAt: new Date().toISOString()
      };
      this.users.set(user.id, user);
      this.usersByDid.set(lookupKey, user);
    }

    // Generate secure session token and device context
    const token = `dvs_${crypto.randomBytes(32).toString('hex')}`;
    const sessionId = `ses_${crypto.randomBytes(8).toString('hex')}`;
    const deviceId = params.deviceId || `dev_${crypto.randomBytes(6).toString('hex')}`;
    const deviceName = params.deviceName || 'Web Device';
    const deviceType = params.deviceType || 'unknown';
    const maskedIp = this.maskIpAddress(params.ipAddress);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 3600000); // 30 days session

    const session: Session = {
      id: sessionId,
      token,
      userId: user.id,
      did: user.did,
      deviceId,
      deviceName,
      deviceType,
      ipAddress: maskedIp,
      userAgent: params.userAgent || 'Unknown Agent',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActiveAt: now.toISOString()
    };

    this.sessions.set(token, session);
    this.saveDatabase();

    return { user, session, token };
  }

  /**
   * Look up an active session by token
   */
  public getSession(token?: string): Session | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    // Check expiration
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.sessions.delete(token);
      this.saveDatabase();
      return null;
    }

    session.lastActiveAt = new Date().toISOString();
    return session;
  }

  /**
   * Invalidate session (logout)
   */
  public invalidateSession(token: string): boolean {
    const deleted = this.sessions.delete(token);
    if (deleted) this.saveDatabase();
    return deleted;
  }

  /**
   * Look up user by ID
   */
  public getUserById(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * Look up user by DID
   */
  public getUserByDid(did: string): User | null {
    return this.usersByDid.get(did.trim().toLowerCase()) || null;
  }

  /**
   * Record an authentication & verification event directly into the user's private history.
   * STRICT GUARANTEE: The record is keyed by the authenticated userId.
   */
  public recordAuthentication(params: {
    userId: string;
    did: string;
    sessionId: string;
    deviceId: string;
    deviceName?: string;
    deviceType?: DeviceType;
    authenticationMethod: string;
    verificationStatus: VerificationStatus;
    transactionReference: string;
    verificationResult: {
      rail: 'LOCAL_BANK' | 'POLLAR_STELLAR' | 'ONCHAIN';
      badgeTitle: string;
      badgeColor: 'blue' | 'amber' | 'crimson' | 'emerald';
      sender: string;
      receiver: string;
      amount: string;
      currency: string;
      proofHash: string;
      stellarTxHash?: string;
      memoText?: string;
      flags: string[];
    };
    ipAddress?: string;
    userAgent?: string;
    isDeveloperLog?: boolean;
  }): AuthenticationHistoryRecord {
    const user = this.users.get(params.userId);
    if (!user) {
      throw new Error(`Cannot record authentication history: User ID ${params.userId} not found.`);
    }

    const id = `auth_rec_${crypto.randomBytes(8).toString('hex')}`;
    const maskedIp = this.maskIpAddress(params.ipAddress);
    const isDev = params.isDeveloperLog !== undefined ? params.isDeveloperLog : user.role === 'developer';

    const record: AuthenticationHistoryRecord = {
      id,
      userId: user.id,
      did: params.did || user.did,
      sessionId: params.sessionId,
      deviceId: params.deviceId,
      deviceName: params.deviceName || 'Client Device',
      deviceType: params.deviceType || 'unknown',
      authenticationMethod: params.authenticationMethod,
      verificationStatus: params.verificationStatus,
      ipAddress: maskedIp,
      userAgent: params.userAgent || 'DualVerifier Web Client',
      transactionReference: params.transactionReference,
      verificationResult: params.verificationResult,
      isDeveloperLog: isDev,
      createdAt: new Date().toISOString()
    };

    this.records.set(id, record);
    this.addIndexes(record);
    this.saveDatabase();

    return record;
  }

  /**
   * Retrieve isolated, user-specific authentication history.
   * STRICT ACCESS CONTROL: Only returns records owned by `userId`.
   */
  public getUserHistory(
    userId: string,
    options: {
      status?: string;
      deviceId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {}
  ): {
    records: AuthenticationHistoryRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } {
    const recordIds = this.indexUserRecords.get(userId) || [];
    let userRecords: AuthenticationHistoryRecord[] = [];

    const user = this.users.get(userId);
    const isUserDev = user?.role === 'developer';

    for (const rid of recordIds) {
      const rec = this.records.get(rid);
      if (!rec) continue;

      // Double-check ownership at runtime
      if (rec.userId !== userId) continue;

      // Normal users should never see developer diagnostic logs
      if (!isUserDev && rec.isDeveloperLog) continue;

      userRecords.push(rec);
    }

    // Apply Filters
    if (options.status && options.status !== 'ALL') {
      userRecords = userRecords.filter(r => r.verificationStatus === options.status);
    }

    if (options.deviceId && options.deviceId !== 'ALL') {
      userRecords = userRecords.filter(r => r.deviceId === options.deviceId);
    }

    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      userRecords = userRecords.filter(r =>
        r.transactionReference.toLowerCase().includes(q) ||
        r.verificationResult.sender.toLowerCase().includes(q) ||
        r.verificationResult.receiver.toLowerCase().includes(q) ||
        r.verificationResult.proofHash.toLowerCase().includes(q) ||
        r.did.toLowerCase().includes(q) ||
        r.deviceName.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    userRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = userRecords.length;
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedRecords = userRecords.slice(offset, offset + limit);

    return {
      records: paginatedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Calculate User Dashboard Stats (The 5 Core Sections)
   */
  public getUserStats(userId: string): UserStats {
    const recordIds = this.indexUserRecords.get(userId) || [];
    let totalVerifications = 0;
    let successfulVerifications = 0;
    let failedVerifications = 0;
    let duplicateVerifications = 0;
    let recentActivityCount = 0;
    const devicesSet = new Set<string>();

    const sevenDaysAgo = Date.now() - 7 * 86400000;
    let totalNgnValue = 0;

    for (const rid of recordIds) {
      const rec = this.records.get(rid);
      if (!rec || rec.userId !== userId) continue;

      totalVerifications += 1;
      devicesSet.add(rec.deviceId);

      if (rec.verificationStatus === 'SUCCESS') {
        successfulVerifications += 1;
      } else if (rec.verificationStatus === 'FAILED' || rec.verificationStatus === 'TAMPERED') {
        failedVerifications += 1;
      } else if (rec.verificationStatus === 'DUPLICATE') {
        duplicateVerifications += 1;
      }

      if (new Date(rec.createdAt).getTime() >= sevenDaysAgo) {
        recentActivityCount += 1;
      }

      // Parse amount if available
      const amtStr = (rec.verificationResult.amount || '').replace(/[^0-9.]/g, '');
      const amtNum = parseFloat(amtStr);
      if (!isNaN(amtNum) && amtNum > 0) {
        totalNgnValue += amtNum;
      }
    }

    return {
      totalVerifications,
      successfulVerifications,
      failedVerifications,
      duplicateVerifications,
      recentActivityCount,
      distinctDevicesCount: devicesSet.size,
      totalTransactionValueFormatted: `₦${totalNgnValue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
    };
  }

  /**
   * Get distinct devices used by this user for the device-aware filter
   */
  public getUserDevices(userId: string): UserDevice[] {
    const recordIds = this.indexUserRecords.get(userId) || [];
    const deviceMap = new Map<string, UserDevice>();

    for (const rid of recordIds) {
      const rec = this.records.get(rid);
      if (!rec || rec.userId !== userId) continue;

      const existing = deviceMap.get(rec.deviceId);
      if (!existing) {
        deviceMap.set(rec.deviceId, {
          deviceId: rec.deviceId,
          deviceName: rec.deviceName,
          deviceType: rec.deviceType,
          lastUsedAt: rec.createdAt,
          verificationCount: 1,
          ipAddress: rec.ipAddress
        });
      } else {
        existing.verificationCount += 1;
        if (new Date(rec.createdAt).getTime() > new Date(existing.lastUsedAt).getTime()) {
          existing.lastUsedAt = rec.createdAt;
          existing.ipAddress = rec.ipAddress;
        }
      }
    }

    return Array.from(deviceMap.values()).sort(
      (a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
    );
  }

  /**
   * IDOR-safe single record retrieval:
   * Rejects if `record.userId !== requesterUserId` (unless admin, which is audited).
   */
  public getRecordById(
    recordId: string,
    requesterUserId: string,
    requesterRole: string,
    clientIp?: string
  ): { authorized: boolean; record: AuthenticationHistoryRecord | null; error?: string } {
    const record = this.records.get(recordId);
    if (!record) {
      return { authorized: false, record: null, error: 'Record not found' };
    }

    // Direct User Ownership Check
    if (record.userId === requesterUserId) {
      return { authorized: true, record };
    }

    // Administrative access check with compulsory audit logging
    if (requesterRole === 'admin') {
      const auditEntry: AuditLogEntry = {
        id: `audit_${crypto.randomBytes(8).toString('hex')}`,
        adminUserId: requesterUserId,
        action: 'READ_USER_AUTHENTICATION_RECORD',
        targetUserId: record.userId,
        details: `Admin accessed record ${recordId} belonging to user ${record.userId}`,
        ipAddress: this.maskIpAddress(clientIp),
        timestamp: new Date().toISOString()
      };
      this.auditLogs.unshift(auditEntry);
      this.saveDatabase();

      return { authorized: true, record };
    }

    // Unauthorized access blocked!
    return {
      authorized: false,
      record: null,
      error: 'Access denied: You do not have permission to view another user\'s private authentication history.'
    };
  }

  /**
   * Internal Developer Diagnostic Logs (Strictly segregated from user accounts)
   */
  public getDeveloperDiagnosticLogs(requesterUserId: string, requesterRole: string): AuthenticationHistoryRecord[] {
    if (requesterRole !== 'developer' && requesterRole !== 'admin') {
      throw new Error('Access denied: Developer diagnostic logs require elevated developer privileges.');
    }

    const devRecords: AuthenticationHistoryRecord[] = [];
    for (const rec of this.records.values()) {
      if (rec.isDeveloperLog || rec.userId === requesterUserId) {
        devRecords.push(rec);
      }
    }

    return devRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Delete a single user authentication history record.
   * STRICT IDOR PROTECTION: Users can ONLY delete records they own.
   * Admin can delete with mandatory audit logging.
   */
  public deleteUserRecord(
    recordId: string,
    requesterUserId: string,
    requesterRole?: string,
    clientIp?: string
  ): { success: boolean; error?: string; deletedRecord?: AuthenticationHistoryRecord } {
    const record = this.records.get(recordId);
    if (!record) {
      return { success: false, error: 'Record not found' };
    }

    // Direct Ownership Check
    const isOwner = record.userId === requesterUserId;
    const isAdmin = requesterRole === 'admin';

    if (!isOwner && !isAdmin) {
      return {
        success: false,
        error: 'Access denied: You do not have permission to delete another user\'s private authentication record.'
      };
    }

    // If admin is deleting on behalf of user, record audit entry
    if (isAdmin && !isOwner) {
      const auditEntry: AuditLogEntry = {
        id: `audit_${crypto.randomBytes(8).toString('hex')}`,
        adminUserId: requesterUserId,
        action: 'DELETE_USER_AUTHENTICATION_RECORD',
        targetUserId: record.userId,
        details: `Admin deleted record ${recordId} belonging to user ${record.userId}`,
        ipAddress: this.maskIpAddress(clientIp),
        timestamp: new Date().toISOString()
      };
      this.auditLogs.unshift(auditEntry);
    }

    // Delete from records map
    this.records.delete(recordId);

    // Clean up index: User
    const userRecs = this.indexUserRecords.get(record.userId);
    if (userRecs) {
      this.indexUserRecords.set(record.userId, userRecs.filter(id => id !== recordId));
    }

    // Clean up index: Session
    const sessionRecs = this.indexSessionRecords.get(record.sessionId);
    if (sessionRecs) {
      this.indexSessionRecords.set(record.sessionId, sessionRecs.filter(id => id !== recordId));
    }

    // Clean up index: Device
    const deviceRecs = this.indexDeviceRecords.get(record.deviceId);
    if (deviceRecs) {
      this.indexDeviceRecords.set(record.deviceId, deviceRecs.filter(id => id !== recordId));
    }

    this.saveDatabase();
    return { success: true, deletedRecord: record };
  }

  /**
   * Clear all authentication history records belonging to a specific user.
   * STRICT GUARANTEE: Operates solely on records owned by requesterUserId.
   */
  public clearUserHistory(userId: string): {
    success: boolean;
    clearedCount: number;
    deletedRecords: AuthenticationHistoryRecord[];
  } {
    const recordIds = [...(this.indexUserRecords.get(userId) || [])];
    const deletedRecords: AuthenticationHistoryRecord[] = [];

    for (const rid of recordIds) {
      const rec = this.records.get(rid);
      if (rec && rec.userId === userId) {
        deletedRecords.push(rec);
        this.records.delete(rid);

        // Clean up Session index
        const sessionRecs = this.indexSessionRecords.get(rec.sessionId);
        if (sessionRecs) {
          this.indexSessionRecords.set(rec.sessionId, sessionRecs.filter(id => id !== rid));
        }

        // Clean up Device index
        const deviceRecs = this.indexDeviceRecords.get(rec.deviceId);
        if (deviceRecs) {
          this.indexDeviceRecords.set(rec.deviceId, deviceRecs.filter(id => id !== rid));
        }
      }
    }

    // Reset user's index array
    this.indexUserRecords.set(userId, []);
    this.saveDatabase();

    return {
      success: true,
      clearedCount: deletedRecords.length,
      deletedRecords
    };
  }

  /**
   * Clear or reset for testing
   */
  public resetForTesting(): void {
    this.records.clear();
    this.sessions.clear();
    this.users.clear();
    this.usersByDid.clear();
    this.indexUserRecords.clear();
    this.indexSessionRecords.clear();
    this.indexDeviceRecords.clear();
    this.auditLogs = [];
    this.seedDefaultUsers();
  }
}

export const authHistoryDatabase = new AuthHistoryDatabase();
