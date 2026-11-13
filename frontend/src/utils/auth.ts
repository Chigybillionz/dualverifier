import { ref, computed } from 'vue';
import { apiUrl } from './api';

export interface UserProfile {
  id: string;
  did: string;
  role: 'user' | 'developer' | 'admin';
  displayName: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  token: string;
  userId: string;
  did: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  lastActiveAt: string;
}

export interface AuthenticationHistoryRecord {
  id: string;
  userId: string;
  did: string;
  sessionId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  authenticationMethod: string;
  verificationStatus: 'SUCCESS' | 'FAILED' | 'TAMPERED' | 'DUPLICATE' | 'REVOKED';
  ipAddress: string;
  userAgent: string;
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
  isDeveloperLog: boolean;
  createdAt: string;
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
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  lastUsedAt: string;
  verificationCount: number;
  ipAddress: string;
}

// Global Auth State
export const authToken = ref<string | null>(localStorage.getItem('dv_auth_token'));
export const currentUser = ref<UserProfile | null>(null);
export const currentSession = ref<UserSession | null>(null);
export const isAuthLoading = ref(false);

export const isAuthenticated = computed(() => !!authToken.value && !!currentUser.value);
export const isDeveloper = computed(() => currentUser.value?.role === 'developer');
export const isAdmin = computed(() => currentUser.value?.role === 'admin');

/**
 * Detect Client Device Information
 */
export function detectDeviceInfo(): {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
} {
  let storedDeviceId = localStorage.getItem('dv_device_id');
  if (!storedDeviceId) {
    storedDeviceId = `dev_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
    localStorage.setItem('dv_device_id', storedDeviceId);
  }

  const ua = navigator.userAgent;
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  let deviceName = 'Desktop Workstation';

  if (/iPad|Tablet/i.test(ua)) {
    deviceType = 'tablet';
    deviceName = 'Tablet (iPad/Android)';
  } else if (/iPhone/i.test(ua)) {
    deviceType = 'mobile';
    deviceName = 'Apple iPhone (Mobile Safari)';
  } else if (/Android/i.test(ua) && /Mobile/i.test(ua)) {
    deviceType = 'mobile';
    deviceName = 'Android Phone (Chrome)';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'Apple MacBook Pro (macOS)';
  } else if (/Windows/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'Windows PC (Chrome/Edge)';
  } else if (/Linux/i.test(ua)) {
    deviceType = 'desktop';
    deviceName = 'Linux Station';
  }

  return {
    deviceId: storedDeviceId,
    deviceName,
    deviceType
  };
}

/**
 * Pre-defined test accounts for 1-click test scenarios
 */
export const PRESET_ACCOUNTS = [
  {
    label: 'User A (Alice - Mobile Phone)',
    did: 'did:key:z6MkuAlicePhoneMobile77192849102',
    role: 'user',
    displayName: 'Alice Okonkwo (Phone)',
    device: 'iPhone 15 Pro',
    deviceType: 'mobile' as const,
    authMethod: 'DID_KEY_PASSKEY'
  },
  {
    label: 'User B (Bob - Laptop Workstation)',
    did: 'did:key:z6MkuBobLaptopWorkstation6619284',
    role: 'user',
    displayName: 'Bob Adebayo (Laptop)',
    device: 'MacBook Pro M3',
    deviceType: 'desktop' as const,
    authMethod: 'DID_POLLAR_WEB3'
  },
  {
    label: 'Developer Account (Internal Diagnostics)',
    did: 'did:key:z6MkuDevInternalDiag88204194829',
    role: 'developer',
    displayName: 'Lead Engineer (Dev Diagnostics)',
    device: 'DevStation Linux Terminal',
    deviceType: 'desktop' as const,
    authMethod: 'DEVELOPER_DIAGNOSTIC'
  }
];

/**
 * Log in with a Decentralized Identifier (DID)
 */
export async function loginWithDid(params: {
  did: string;
  authenticationMethod?: string;
  deviceName?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  role?: 'user' | 'developer' | 'admin';
  displayName?: string;
}): Promise<boolean> {
  isAuthLoading.value = true;
  try {
    const clientDevice = detectDeviceInfo();

    const res = await fetch(apiUrl('/api/auth/did-login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        did: params.did,
        authenticationMethod: params.authenticationMethod || 'DID_KEY_PASSKEY',
        deviceId: clientDevice.deviceId,
        deviceName: params.deviceName || clientDevice.deviceName,
        deviceType: params.deviceType || clientDevice.deviceType,
        role: params.role,
        displayName: params.displayName
      })
    });

    const data = await res.json();
    if (data.success && data.token) {
      authToken.value = data.token;
      currentUser.value = data.user;
      currentSession.value = data.session;
      localStorage.setItem('dv_auth_token', data.token);
      return true;
    } else {
      console.error('DID login failed:', data.error);
      return false;
    }
  } catch (err) {
    console.error('DID login connection error:', err);
    return false;
  } finally {
    isAuthLoading.value = false;
  }
}

/**
 * Log out and clear current user session
 */
export async function logout(): Promise<void> {
  if (authToken.value) {
    try {
      await fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: getAuthHeaders()
      });
    } catch (e) {
      // Ignore network errors on logout
    }
  }
  authToken.value = null;
  currentUser.value = null;
  currentSession.value = null;
  localStorage.removeItem('dv_auth_token');
}

/**
 * Fetch current authenticated user profile
 */
export async function fetchCurrentUser(): Promise<boolean> {
  if (!authToken.value) return false;

  try {
    const res = await fetch(apiUrl('/api/auth/me'), {
      headers: getAuthHeaders()
    });

    if (res.status === 401) {
      await logout();
      return false;
    }

    const data = await res.json();
    if (data.success && data.user) {
      currentUser.value = data.user;
      currentSession.value = data.currentSession;
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Initialize Authentication on App Mount
 */
export async function initAuth(): Promise<void> {
  const existingToken = localStorage.getItem('dv_auth_token');
  if (existingToken) {
    authToken.value = existingToken;
    const ok = await fetchCurrentUser();
    if (ok) return;
  }

  // Auto-authenticate as default user Alice (or device-appropriate) if clean install
  await loginWithDid({
    did: PRESET_ACCOUNTS[0].did,
    displayName: PRESET_ACCOUNTS[0].displayName,
    role: 'user',
    authenticationMethod: PRESET_ACCOUNTS[0].authMethod
  });
}

/**
 * Get Request Authorization Headers
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (authToken.value) {
    headers['Authorization'] = `Bearer ${authToken.value}`;
  }
  return headers;
}

