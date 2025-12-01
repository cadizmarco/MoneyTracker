import Joi from 'joi';

export const accountCreateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'cash', 'other').required(),
  balance: Joi.number().min(0).default(0),
  currency: Joi.string().length(3).uppercase().default('USD'),
  description: Joi.string().max(500).allow('', null),
  isActive: Joi.boolean().default(true),
});

export const accountUpdateSchema = Joi.object({
  name: Joi.string().max(100),
  type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'cash', 'other'),
  balance: Joi.number().min(0),
  currency: Joi.string().length(3).uppercase(),
  description: Joi.string().max(500).allow('', null),
  isActive: Joi.boolean(),
});