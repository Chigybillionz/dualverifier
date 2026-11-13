import { Request, Response, NextFunction } from 'express';
import { authHistoryDatabase } from '../services/authHistoryDatabase.js';
import { UserRole, DeviceType } from '../models/authHistory.js';

export interface AuthenticatedUser {
  userId: string;
  did: string;
  sessionId: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  role: UserRole;
  displayName: string;
  ipAddress: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers['x-auth-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  return null;
}

/**
 * Strict Authentication Middleware
 * Derives user identity exclusively from verified server-side session.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid DID session token in Authorization header.'
    });
    return;
  }

  const session = authHistoryDatabase.getSession(token);
  if (!session) {
    res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please re-authenticate your DID.'
    });
    return;
  }

  const user = authHistoryDatabase.getUserById(session.userId);
  if (!user) {
    res.status(401).json({
      success: false,
      error: 'User account associated with this session no longer exists.'
    });
    return;
  }

  req.user = {
    userId: user.id,
    did: session.did,
    sessionId: session.id,
    deviceId: session.deviceId,
    deviceName: session.deviceName,
    deviceType: session.deviceType,
    role: user.role,
    displayName: user.displayName,
    ipAddress: session.ipAddress
  };

  next();
}

/**
 * Optional Authentication Middleware
 * Enriches request with user context if authenticated, but permits unauthenticated guests.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (token) {
    const session = authHistoryDatabase.getSession(token);
    if (session) {
      const user = authHistoryDatabase.getUserById(session.userId);
      if (user) {
        req.user = {
          userId: user.id,
          did: session.did,
          sessionId: session.id,
          deviceId: session.deviceId,
          deviceName: session.deviceName,
          deviceType: session.deviceType,
          role: user.role,
          displayName: user.displayName,
          ipAddress: session.ipAddress
        };
      }
    }
  }

  next();
}

/**
 * Role-Based Access Control Middleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Forbidden: This resource requires one of the following roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}.`
      });
      return;
    }

    next();
  };
}

