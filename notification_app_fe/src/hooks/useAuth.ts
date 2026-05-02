/**
 * Custom Hook: useAuth
 *
 * Handles authentication flow — registration and token management.
 * Token is stored in memory, not localStorage.
 */

import { useState, useCallback } from 'react';
import { Log, initLogger } from '@logger';
import {
  registerUser,
  authenticateUser,
  getAccessToken,
  setAccessToken,
} from '../utils/api';
import type { RegisterPayload, AuthCredentials } from '../types';

interface UseAuthReturn {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  register: (payload: RegisterPayload) => Promise<{ clientID: string; clientSecret: string }>;
  authenticate: (credentials: AuthCredentials) => Promise<string>;
  autoAuth: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (payload: RegisterPayload) => {
    Log('frontend', 'info', 'hook', 'starting registration flow');
    setLoading(true);
    setError(null);

    try {
      const result = await registerUser(payload);
      Log('frontend', 'info', 'hook', 'registration complete');
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'registration failed';
      Log('frontend', 'error', 'hook', `registration error: ${message}`);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (credentials: AuthCredentials) => {
    Log('frontend', 'info', 'hook', 'starting authentication flow');
    setLoading(true);
    setError(null);

    try {
      const result = await authenticateUser(credentials);
      initLogger(result.access_token);
      setIsAuthenticated(true);
      Log('frontend', 'info', 'hook', 'authentication complete — app ready');
      return result.access_token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'authentication failed';
      Log('frontend', 'error', 'hook', `auth error: ${message}`);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const autoAuth = useCallback(async () => {
    Log('frontend', 'info', 'hook', 'attempting auto-authentication from env');

    const email = import.meta.env.VITE_USER_EMAIL;
    const name = import.meta.env.VITE_USER_NAME;
    const rollNo = import.meta.env.VITE_ROLL_NO;
    const accessCode = import.meta.env.VITE_ACCESS_CODE;
    const clientID = import.meta.env.VITE_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

    if (!clientID || !clientSecret || clientID === 'your_client_id_here') {
      Log('frontend', 'warn', 'hook', 'env credentials not configured — skipping auto-auth');
      return;
    }

    try {
      await authenticate({
        email,
        name,
        rollNo,
        accessCode,
        clientID,
        clientSecret,
      });
    } catch {
      Log('frontend', 'warn', 'hook', 'auto-auth failed — user will need to authenticate manually');
    }
  }, [authenticate]);

  return {
    isAuthenticated,
    loading,
    error,
    register,
    authenticate,
    autoAuth,
  };
}
