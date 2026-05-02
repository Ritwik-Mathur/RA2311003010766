/**
 * API Utilities
 *
 * Handles registration, authentication, and notification fetching.
 * All API calls are instrumented with the logging middleware.
 */

import axios, { AxiosError } from 'axios';
import { Log } from '@logger';
import type {
  RegisterPayload,
  RegisterResponse,
  AuthCredentials,
  AuthResponse,
  RawNotification,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://20.207.122.201/evaluation-service';

// ─── In-memory token store (NOT localStorage as per requirement) ────────────

let _accessToken: string | null = null;

export function getAccessToken(): string | null {
  return _accessToken;
}

export function setAccessToken(token: string): void {
  _accessToken = token;
  Log('frontend', 'info', 'api', 'access token stored in memory');
}

export function clearAccessToken(): void {
  _accessToken = null;
  Log('frontend', 'info', 'api', 'access token cleared from memory');
}

// ─── Axios instance ─────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    Log(
      'frontend',
      'debug',
      'api',
      `outgoing ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    Log('frontend', 'error', 'api', `request interceptor error: ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    Log(
      'frontend',
      'debug',
      'api',
      `response ${response.status} from ${response.config.url}`
    );
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status || 'unknown';
    const url = error.config?.url || 'unknown';
    Log(
      'frontend',
      'error',
      'api',
      `api error ${status} from ${url}: ${error.message}`
    );
    return Promise.reject(error);
  }
);

// ─── Registration ───────────────────────────────────────────────────────────

/**
 * Register with the evaluation service to obtain clientID and clientSecret.
 */
export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  Log('frontend', 'info', 'api', 'initiating user registration');

  try {
    const response = await apiClient.post<RegisterResponse>(
      '/register',
      payload
    );
    Log(
      'frontend',
      'info',
      'api',
      'registration successful — received client credentials'
    );
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    Log(
      'frontend',
      'error',
      'api',
      `registration failed: ${err.message}`
    );
    throw error;
  }
}

// ─── Authentication ─────────────────────────────────────────────────────────

/**
 * Authenticate to get an access token.
 */
export async function authenticateUser(
  credentials: AuthCredentials
): Promise<AuthResponse> {
  Log('frontend', 'info', 'api', 'initiating authentication');

  try {
    const response = await apiClient.post<AuthResponse>('/auth', credentials);
    const { access_token } = response.data;

    setAccessToken(access_token);
    Log(
      'frontend',
      'info',
      'api',
      'authentication successful — token acquired'
    );

    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    Log(
      'frontend',
      'error',
      'api',
      `authentication failed: ${err.message}`
    );
    throw error;
  }
}

// ─── Notifications ──────────────────────────────────────────────────────────

/**
 * Fetch notifications from the evaluation service.
 * Does NOT store in DB — fetched dynamically each time.
 */
export async function fetchNotifications(): Promise<RawNotification[]> {
  Log('frontend', 'info', 'api', 'fetching notifications from api');

  try {
    const response = await apiClient.get('/notifications');
    const data = response.data;

    // Handle different response shapes
    let notifications: RawNotification[];
    if (Array.isArray(data)) {
      notifications = data;
    } else if (data?.notifications && Array.isArray(data.notifications)) {
      notifications = data.notifications;
    } else if (typeof data === 'object') {
      // Flatten object where keys are types and values are arrays
      notifications = [];
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key])) {
          notifications.push(
            ...data[key].map((n: RawNotification) => ({
              ...n,
              type: n.type || key,
            }))
          );
        }
      }
    } else {
      notifications = [];
    }

    Log(
      'frontend',
      'info',
      'api',
      `fetched ${notifications.length} notifications successfully`
    );

    return notifications;
  } catch (error) {
    const err = error as AxiosError;
    Log(
      'frontend',
      'error',
      'api',
      `failed to fetch notifications: ${err.message}`
    );
    throw error;
  }
}
