import { Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';
import Joi from 'joi';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, message: 'Validation error', details: error.details });
      return;
    }
    req.body = value;
    next();
    return;
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      res.status(400).json({ success: false, message: 'Validation error', details: error.details });
      return;
    }
    req.query = value as ParsedQs;
    next();
    return;
  };
};