import { Request, Response } from 'express';
import { authHistoryDatabase } from '../services/authHistoryDatabase.js';

export class AuthHistoryController {
  /**
   * DID Authentication / Login
   * Authenticates user via DID and establishes device-aware session
   */
  async didLogin(req: Request, res: Response): Promise<void> {
    try {
      const {
        did,
        authenticationMethod = 'DID_KEY_PASSKEY',
        deviceId,
        deviceName,
        deviceType,
        role,
        displayName
      } = req.body;

      if (!did || typeof did !== 'string' || did.trim().length < 5) {
        res.status(400).json({
          success: false,
          error: 'Valid DID identifier is required (e.g. did:key:... or did:pkh:stellar:...)'
        });
        return;
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';

      const authResult = authHistoryDatabase.authenticateDid({
        did,
        authenticationMethod,
        deviceId,
        deviceName,
        deviceType,
        ipAddress: clientIp,
        userAgent,
        role,
        displayName
      });

      res.status(200).json({
        success: true,
        message: 'DID authentication successful',
        token: authResult.token,
        user: authResult.user,
        session: authResult.session
      });
    } catch (err: any) {
      console.error('[AuthHistoryController] Login error:', err);
      res.status(500).json({ success: false, error: err.message || 'DID authentication failed' });
    }
  }

  /**
   * Terminate active session
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
      if (token) {
        authHistoryDatabase.invalidateSession(token);
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get Current Authenticated User Profile & Session
   */
  async getMe(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const user = authHistoryDatabase.getUserById(req.user.userId);
    res.status(200).json({
      success: true,
      user,
      currentSession: req.user
    });
  }

  /**
   * STRICT SERVER-SIDE AUTHORIZATION:
   * GET /api/authentication-history/me
   * Derives user identity EXCLUSIVELY from the verified authentication token.
   * Completely immune to IDOR parameter manipulation.
   */
  async getMyHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      // STRICT VALIDATION: Ignore any userId in query or body. Use verified req.user.userId only.
      const userId = req.user.userId;

      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const deviceId = typeof req.query.deviceId === 'string' ? req.query.deviceId : undefined;
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const historyResult = authHistoryDatabase.getUserHistory(userId, {
        status,
        deviceId,
        search,
        page,
        limit
      });

      const stats = authHistoryDatabase.getUserStats(userId);
      const devices = authHistoryDatabase.getUserDevices(userId);

      res.status(200).json({
        success: true,
        userId,
        did: req.user.did,
        records: historyResult.records,
        pagination: historyResult.pagination,
        stats,
        devices
      });
    } catch (err: any) {
      console.error('[AuthHistoryController] getMyHistory error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to retrieve authentication history' });
    }
  }

  /**
   * GET /api/authentication-history/me/stats
   * Returns Dashboard metric counters
   */
  async getMyStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const stats = authHistoryDatabase.getUserStats(req.user.userId);
      res.status(200).json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/authentication-history/record/:id
   * Single record retrieval with strict ownership verification
   */
  async getRecordById(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const recordId = String(req.params.id || '');
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      const lookup = authHistoryDatabase.getRecordById(
        recordId,
        req.user.userId,
        req.user.role,
        clientIp
      );

      if (!lookup.authorized || !lookup.record) {
        res.status(403).json({
          success: false,
          error: lookup.error || 'Access denied: You do not have permission to view this record.'
        });
        return;
      }

      res.status(200).json({ success: true, record: lookup.record });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * GET /api/authentication-history/developer-logs
   * Segregated diagnostic logs accessible only by developers/admins
   */
  async getDeveloperLogs(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      if (req.user.role !== 'developer' && req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'Access denied: Developer diagnostic logs are strictly separated from user dashboards.'
        });
        return;
      }

      const logs = authHistoryDatabase.getDeveloperDiagnosticLogs(req.user.userId, req.user.role);
      res.status(200).json({ success: true, count: logs.length, logs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const authHistoryController = new AuthHistoryController();
