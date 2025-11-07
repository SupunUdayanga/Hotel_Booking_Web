import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';

export function auth(required = true) {
  return (req, _res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      if (required) return next(new ApiError(401, 'Authentication required'));
      return next();
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, role: payload.role };
      next();
    } catch (err) {
      next(new ApiError(401, 'Invalid or expired token'));
    }
  };
}

export function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user || req.user.role !== role) return next(new ApiError(403, 'Forbidden'));
    next();
  };
}
