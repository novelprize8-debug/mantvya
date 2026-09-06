import { Request, Response, NextFunction } from 'express';
import { getAdminAuth } from './firebaseAdmin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Express middleware to authenticate requests using Firebase ID tokens.
 * Extracts the Bearer token from the Authorization header and verifies it via Firebase Admin SDK.
 * Rejects unauthenticated or malformed requests with HTTP 401.
 * Sensitive tokens and reflection content are never emitted to logs.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header with Bearer token.',
      code: 'AUTH_HEADER_MISSING',
    });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Missing Firebase ID token.',
      code: 'TOKEN_MISSING',
    });
  }

  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    if (!decodedToken || !decodedToken.uid) {
      return res.status(401).json({
        error: 'Unauthorized: Unable to verify user identity.',
        code: 'INVALID_TOKEN',
      });
    }

    // Attach verified server-side identity. Never trust any client-supplied userId.
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    return next();
  } catch (err: any) {
    const errorCode = err?.code || 'auth/unknown-error';

    if (errorCode === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Unauthorized: Firebase ID token has expired. Please refresh your session.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (errorCode === 'auth/argument-error' || errorCode === 'auth/invalid-id-token') {
      return res.status(401).json({
        error: 'Unauthorized: Invalid Firebase ID token.',
        code: 'TOKEN_INVALID',
      });
    }

    if (errorCode === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Unauthorized: Token has been revoked. Please sign in again.',
        code: 'TOKEN_REVOKED',
      });
    }

    // Generic error response - do not log raw token or sensitive content
    console.error('Authentication verification failure:', err.message || 'Token verification error');
    return res.status(401).json({
      error: 'Unauthorized: Verification failed.',
      code: 'AUTH_FAILED',
    });
  }
}
