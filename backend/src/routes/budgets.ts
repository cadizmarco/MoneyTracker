import express from 'express';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { budgetCreateSchema, budgetUpdateSchema } from '../validation/budget';
import { getBudgets, getBudget, createBudget, updateBudget, deleteBudget, updateBudgetSpent } from '../controllers/budgetController';

const router = express.Router();

router.get('/', protect, getBudgets);
router.get('/:id', protect, getBudget);
router.post('/', protect, validateBody(budgetCreateSchema), createBudget);
router.put('/:id', protect, validateBody(budgetUpdateSchema), updateBudget);
router.delete('/:id', protect, deleteBudget);
router.put('/:id/spent', protect, updateBudgetSpent);

export default router;