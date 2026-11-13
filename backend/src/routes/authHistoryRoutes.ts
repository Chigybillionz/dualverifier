import { Router } from 'express';
import { authHistoryController } from '../controllers/authHistoryController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

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

// 3. Developer & Diagnostic Segregation (Elevated roles only)
router.get('/authentication-history/developer-logs', requireAuth, requireRole('developer', 'admin'), (req, res) => {
  authHistoryController.getDeveloperLogs(req, res);
});

export default router;

