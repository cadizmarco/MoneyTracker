import express from 'express';
import { protect } from '../middleware/auth';
import { getSystemStats } from '../controllers/statsController';

const router = express.Router();

router.get('/overview', protect, getSystemStats);

export default router;