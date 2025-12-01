import Joi from 'joi';

export const budgetCreateSchema = Joi.object({
  name: Joi.string().max(100).default(Joi.ref('category')),
  category: Joi.string().max(50).required(),
  amount: Joi.number().min(0).required(),
  spent: Joi.number().min(0).default(0),
  period: Joi.string().valid('monthly', 'weekly', 'yearly', 'custom').required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  isActive: Joi.boolean().default(true),
});

export const budgetUpdateSchema = Joi.object({
  name: Joi.string().max(100),
  category: Joi.string().max(50),
  amount: Joi.number().min(0),
  spent: Joi.number().min(0),
  period: Joi.string().valid('monthly', 'weekly', 'yearly', 'custom'),
  startDate: Joi.date(),
  endDate: Joi.date(),
  isActive: Joi.boolean(),
});