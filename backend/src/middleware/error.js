import { ApiError } from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Not Found - ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }
  res.status(status).json({ success: false, message });
}
