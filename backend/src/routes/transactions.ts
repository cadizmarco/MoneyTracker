import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { transactionCreateSchema, transactionUpdateSchema } from '../validation/transaction';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController';
import { transactionsLimiter } from '../middleware/rateLimiter';

const router = express.Router();

router.get('/', protect, transactionsLimiter, getTransactions);
router.post('/', protect, transactionsLimiter, validateBody(transactionCreateSchema), createTransaction);
router.put('/:id', protect, transactionsLimiter, validateBody(transactionUpdateSchema), updateTransaction);
router.delete('/:id', protect, transactionsLimiter, deleteTransaction);

export default router;