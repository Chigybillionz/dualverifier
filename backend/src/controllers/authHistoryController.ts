import { Request, Response } from 'express';
import { authHistoryDatabase } from '../services/authHistoryDatabase.js';
import { pollarRegistry } from '../services/pollarRegistry.js';

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

  /**
   * DELETE /api/authentication-history/record/:id
   * Deletes a verification record and resets the replay lock so the user can redo verification.
   * STRICT IDOR DEFENSE: Strictly validates that the requester owns this record.
   */
  async deleteRecord(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const recordId = String(req.params.id || '').trim();
      if (!recordId) {
        res.status(400).json({ success: false, error: 'Record ID is required' });
        return;
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const deleteResult = authHistoryDatabase.deleteUserRecord(
        recordId,
        req.user.userId,
        req.user.role,
        clientIp
      );

      if (!deleteResult.success) {
        const statusCode = deleteResult.error?.includes('Access denied') ? 403 : 404;
        res.status(statusCode).json({
          success: false,
          error: deleteResult.error || 'Failed to delete record'
        });
        return;
      }

      const rec = deleteResult.deletedRecord!;

      // Automatically reset replay anchor in Pollar registry so the receipt can be re-verified
      if (rec.transactionReference) {
        pollarRegistry.resetReceiptAnchor(rec.transactionReference);
      }
      if (rec.verificationResult?.proofHash) {
        pollarRegistry.resetReceiptAnchor(rec.verificationResult.proofHash);
      }
      if (rec.verificationResult?.stellarTxHash) {
        pollarRegistry.resetReceiptAnchor(rec.verificationResult.stellarTxHash);
      }

      res.status(200).json({
        success: true,
        message: 'Verification record deleted and replay lock reset successfully. You can now redo verification.',
        deletedId: recordId,
        transactionReference: rec.transactionReference
      });
    } catch (err: any) {
      console.error('[AuthHistoryController] deleteRecord error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to delete record' });
    }
  }

  /**
   * DELETE /api/authentication-history/me
   * Clears ALL authentication history records owned by the logged-in user and resets all associated replay locks.
   */
  async clearMyHistory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const result = authHistoryDatabase.clearUserHistory(req.user.userId);

      // Reset replay anchors for all deleted user receipts
      for (const rec of result.deletedRecords) {
        if (rec.transactionReference) {
          pollarRegistry.resetReceiptAnchor(rec.transactionReference);
        }
        if (rec.verificationResult?.proofHash) {
          pollarRegistry.resetReceiptAnchor(rec.verificationResult.proofHash);
        }
        if (rec.verificationResult?.stellarTxHash) {
          pollarRegistry.resetReceiptAnchor(rec.verificationResult.stellarTxHash);
        }
      }

      res.status(200).json({
        success: true,
        message: `Successfully cleared ${result.clearedCount} verification records and reset replay locks.`,
        clearedCount: result.clearedCount
      });
    } catch (err: any) {
      console.error('[AuthHistoryController] clearMyHistory error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to clear history' });
    }
  }

  /**
   * POST /api/verify/reset-receipt
   * Reset receipt replay lock so users can re-verify transactions cleanly.
   */
  async resetReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, reference, proofHash } = req.body || {};
      const target = (sessionId || reference || proofHash || '').trim();
      if (!target) {
        res.status(400).json({
          success: false,
          error: 'A target sessionId, transaction reference, or proofHash is required'
        });
        return;
      }

      const resetResult = pollarRegistry.resetReceiptAnchor(target);
      res.status(200).json({
        success: true,
        message: 'Receipt replay anchor reset successfully. You can now redo verification.',
        target,
        clearedCount: resetResult.clearedCount
      });
    } catch (err: any) {
      console.error('[AuthHistoryController] resetReceipt error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export const authHistoryController = new AuthHistoryController();
