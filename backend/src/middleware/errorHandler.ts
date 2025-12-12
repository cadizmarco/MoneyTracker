import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
}

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error: HttpError = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

export const errorHandler = (err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Server Error';
  res.status(statusCode).json({ success: false, message });
};