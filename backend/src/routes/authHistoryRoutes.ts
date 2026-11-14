import { Router } from 'express';
import { authHistoryController } from '../controllers/authHistoryController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { pollarRegistry } from '../services/pollarRegistry.js';

const router = Router();

// 1. DID Authentication Endpoints
router.post('/auth/did-login', (req, res) => {
  authHistoryController.didLogin(req, res);
});

router.post('/auth/logout', (req, res) => {
  authHistoryController.logout(req, res);
});

router.get('/auth/me', requireAuth, (req, res) => {
  authHistoryController.getMe(req, res);
});

// 2. User-Specific Authentication History (Strict server-side authorization)
router.get('/authentication-history/me', requireAuth, (req, res) => {
  authHistoryController.getMyHistory(req, res);
});

router.get('/authentication-history/me/stats', requireAuth, (req, res) => {
  authHistoryController.getMyStats(req, res);
});

router.get('/authentication-history/record/:id', requireAuth, (req, res) => {
  authHistoryController.getRecordById(req, res);
});

router.delete('/authentication-history/record/:id', requireAuth, (req, res) => {
  authHistoryController.deleteRecord(req, res);
});

router.delete('/authentication-history/me', requireAuth, (req, res) => {
  authHistoryController.clearMyHistory(req, res);
});

// 3. Developer & Diagnostic Segregation (Elevated roles only)
router.get('/authentication-history/developer-logs', requireAuth, requireRole('developer', 'admin'), (req, res) => {
  authHistoryController.getDeveloperLogs(req, res);
});

// 4. Receipt Replay Reset (Allows users to re-verify transactions)
router.post('/verify/reset-receipt', (req, res) => {
  authHistoryController.resetReceipt(req, res);
});

router.post('/pollar/reset/:identifier', (req, res) => {
  const result = pollarRegistry.resetReceiptAnchor(req.params.identifier);
  res.status(200).json({ success: true, clearedCount: result.clearedCount });
});

export default router;

