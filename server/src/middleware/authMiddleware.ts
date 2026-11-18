import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserProfile } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing or malformed token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const userId = verifyToken(token);
  if (!userId) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication session.' });
    return;
  }

  const user = getUserProfile(userId);
  if (!user) {
    res.status(401).json({ success: false, error: 'User account not found.' });
    return;
  }

  req.userId = userId;
  req.userEmail = user.email;
  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const userId = verifyToken(token);
    if (userId) {
      req.userId = userId;
    }
  }
  next();
}
