import { auth } from '../firebase';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Retrieves the current Firebase user's ID token.
 * Uses Firebase Auth client SDK's getIdToken(forceRefresh), which automatically
 * checks for expiration and refreshes the token against Firebase Auth servers.
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError('Authentication required. Please sign in with Google to continue.', 401, 'NOT_SIGNED_IN');
  }
  return await user.getIdToken(forceRefresh);
}

/**
 * Authenticated HTTP request wrapper.
 * Attaches 'Authorization: Bearer <Firebase ID token>'.
 * If the server responds with 401 (e.g. TOKEN_EXPIRED), it forces a token refresh and retries the request once.
 */
export async function authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token: string;
  try {
    token = await getFirebaseIdToken(false);
  } catch (err: any) {
    throw err instanceof ApiError ? err : new ApiError(err.message || 'Authentication failed', 401);
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If token expired or rejected with 401, force-refresh token and retry once
  if (response.status === 401) {
    try {
      token = await getFirebaseIdToken(true);
      headers.set('Authorization', `Bearer ${token}`);
      response = await fetch(endpoint, {
        ...options,
        headers,
      });
    } catch {
      // Return initial response if token refresh failed
      return response;
    }
  }

  return response;
}
