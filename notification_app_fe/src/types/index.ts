/**
 * Core type definitions for the Notification App
 */

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
}

export type NotificationType = 'event' | 'result' | 'placement' | string;

export interface NotificationApiResponse {
  notifications: RawNotification[];
}

export interface RawNotification {
  id?: string;
  message: string;
  type: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface FilterState {
  notificationType: string;
  showPriorityOnly: boolean;
}

export interface AuthCredentials {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  mobileNo: string;
  githubUsername: string;
  rollNo: string;
  accessCode: string;
}

export interface RegisterResponse {
  clientID: string;
  clientSecret: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
