import express from 'express';
import { protect } from '../middleware/auth';
import { updateProfile, changePassword, deleteAccount } from '../controllers/userController';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.delete('/', protect, deleteAccount);

export default router;