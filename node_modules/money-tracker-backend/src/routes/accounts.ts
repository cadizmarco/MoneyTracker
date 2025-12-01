import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { accountCreateSchema, accountUpdateSchema } from '../validation/account';
import { getAccounts, getAccount, createAccount, updateAccount, deleteAccount } from '../controllers/accountController';
import { accountsLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/', protect, accountsLimiter, getAccounts);
router.get('/:id', protect, accountsLimiter, getAccount);
router.post('/', protect, accountsLimiter, validateBody(accountCreateSchema), createAccount);
router.put('/:id', protect, accountsLimiter, validateBody(accountUpdateSchema), updateAccount);
router.delete('/:id', protect, accountsLimiter, deleteAccount);

export default router;