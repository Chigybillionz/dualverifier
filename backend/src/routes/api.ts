import { Router } from 'express';
import multer from 'multer';
import { verifyController } from '../controllers/verifyController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = Router();

// Core verification endpoints
router.post('/verify/local', upload.single('receipt'), (req, res) => {
  verifyController.verifyLocalBank(req, res);
});

router.post('/verify/onchain', (req, res) => {
  verifyController.verifyOnChain(req, res);
});

// Registry & Anti-Replay endpoints
router.post('/registry/anchor', (req, res) => {
  verifyController.anchorProof(req, res);
});

router.get('/registry/status/:proofHash', (req, res) => {
  verifyController.getProofStatus(req, res);
});

router.post('/registry/reset/:proofHash', (req, res) => {
  verifyController.resetProof(req, res);
});

router.get('/registry/records', (req, res) => {
  verifyController.getAllRecords(req, res);
});

// Utility & Meta endpoints
router.get('/cbn/banks', (req, res) => {
  verifyController.getCBNBanks(req, res);
});

router.get('/presets', (req, res) => {
  verifyController.getPresets(req, res);
});

export default router;

