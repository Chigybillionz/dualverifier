export type UserRole = 'user' | 'developer' | 'admin';

export type VerificationStatus = 'SUCCESS' | 'FAILED' | 'TAMPERED' | 'DUPLICATE' | 'REVOKED';

export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'unknown';

export interface User {
  id: string; // usr_xxx
  did: string; // e.g. did:key:z6Mku... or did:pkh:stellar:...
  role: UserRole;
  displayName: string;
  createdAt: string;
}

export interface Session {
  id: string; // ses_xxx
  token: string; // secure bearer token
  userId: string;
  did: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  ipAddress: string; // contextual metadata
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
}

export interface VerificationResultSummary {
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
}

export interface AuthenticationHistoryRecord {
  id: string; // auth_rec_xxx
  userId: string; // Primary ownership key
  did: string; // DID identifier
  sessionId: string; // Active verification session ID
  deviceId: string; // Device ID (e.g. dev_iphone_...)
  deviceName: string; // e.g. iPhone 15 Pro, MacBook Pro
  deviceType: DeviceType;
  authenticationMethod: string; // DID_KEY_PASSKEY | DID_POLLAR_WEB3 | DID_WALLET_SIGNATURE | DEVELOPER_DIAGNOSTIC
  verificationStatus: VerificationStatus;
  ipAddress: string; // Privacy-preserving IP metadata
  userAgent: string;
  transactionReference: string; // NIBSS Session ID or Stellar TxID or proofHash
  verificationResult: VerificationResultSummary;
  isDeveloperLog: boolean; // Diagnostic flag
  createdAt: string; // ISO 8601
}

export interface UserStats {
  totalVerifications: number;
  successfulVerifications: number;
  failedVerifications: number;
  duplicateVerifications: number;
  recentActivityCount: number;
  distinctDevicesCount: number;
  totalTransactionValueFormatted: string;
}

export interface UserDevice {
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  lastUsedAt: string;
  verificationCount: number;
  ipAddress: string;
}

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  action: string;
  targetUserId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

