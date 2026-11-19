import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getOrCreateUser } from '../db/users.ts';
import { hasAnyRole, hasPermission } from '../db/rbac.ts';
import type { AppPermission, AppRole, AuthContext } from '../db/rbac.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  authContext?: AuthContext;
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    req.authContext = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || 'user@wardly.eg',
      decodedToken.name || null
    );
  } catch {
    // Ignore invalid optional token for public endpoints
  }
  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    req.authContext = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || 'user@wardly.eg',
      decodedToken.name || null
    );
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireRole = (...allowed: AppRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.authContext || !hasAnyRole(req.authContext, allowed)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient role privileges' });
    }
    next();
  };
};

export const requirePermission = (permission: AppPermission) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.authContext || !hasPermission(req.authContext, permission)) {
      return res.status(403).json({ error: `Forbidden: Missing permission ${permission}` });
    }
    next();
  };
};
