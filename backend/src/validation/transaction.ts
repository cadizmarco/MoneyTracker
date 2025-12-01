import Joi from 'joi';

export const transactionCreateSchema = Joi.object({
  accountId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense', 'transfer').required(),
  category: Joi.string().max(50).required(),
  description: Joi.string().max(500).allow('', null),
  date: Joi.date().optional(),
  tags: Joi.array().items(Joi.string().max(30)).optional(),
  transferToAccountId: Joi.string().when('type', {
    is: 'transfer',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export const transactionUpdateSchema = Joi.object({
  amount: Joi.number().positive(),
  type: Joi.string().valid('income', 'expense', 'transfer'),
  category: Joi.string().max(50),
  description: Joi.string().max(500).allow('', null),
  date: Joi.date(),
  tags: Joi.array().items(Joi.string().max(30)),
  transferToAccountId: Joi.string(),
});