/**
 * Logging Middleware for Affordmed Campus Hiring Evaluation
 *
 * Reusable logging function that sends structured logs to the evaluation API.
 * All values are enforced lowercase as per requirements.
 *
 * Usage:
 *   import { Log, initLogger } from './logger';
 *
 *   // Initialize with access token first
 *   initLogger('your_access_token');
 *
 *   // Then use anywhere in the app
 *   Log('frontend', 'info', 'component', 'notification list rendered successfully');
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';

export interface LogPayload {
  stack: string;
  level: LogLevel;
  package: LogPackage;
  message: string;
}

export interface LogConfig {
  apiBaseUrl: string;
  accessToken: string;
  enableConsole: boolean;
  batchSize: number;
  flushInterval: number;
}

// ─── State ──────────────────────────────────────────────────────────────────────

let _config: LogConfig = {
  apiBaseUrl: '/api',
  accessToken: '',
  enableConsole: true,
  batchSize: 5,
  flushInterval: 3000,
};

let _logQueue: LogPayload[] = [];
let _flushTimer: ReturnType<typeof setInterval> | null = null;
let _isInitialized = false;

// ─── Console Styles ─────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<LogLevel, string> = {
  debug: 'color: #8b8b8b; font-weight: normal;',
  info: 'color: #4fc3f7; font-weight: bold;',
  warn: 'color: #ffa726; font-weight: bold;',
  error: 'color: #ef5350; font-weight: bold;',
  fatal: 'color: #ff1744; font-weight: bold; text-decoration: underline;',
};

const LEVEL_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  fatal: '💀',
};

// ─── Internal Helpers ───────────────────────────────────────────────────────────

function consoleLog(payload: LogPayload): void {
  if (!_config.enableConsole) return;

  const icon = LEVEL_ICONS[payload.level];
  const style = LEVEL_STYLES[payload.level];
  const timestamp = new Date().toISOString();

  console.log(
    `%c${icon} [${timestamp}] [${payload.stack}/${payload.package}] ${payload.message}`,
    style
  );
}

/**
 * Sanitize message: remove special chars that the API might reject,
 * keep it ASCII-safe and lowercase.
 */
function sanitizeMessage(msg: string): string {
  return msg
    .toLowerCase()
    .replace(/[—–]/g, '-')   // em/en dash to hyphen
    .replace(/[^\x20-\x7E]/g, '') // strip non-ASCII
    .substring(0, 500);       // cap length
}

async function sendLogs(logs: LogPayload[]): Promise<void> {
  if (!_config.accessToken) {
    return; // silently skip if no token
  }

  const url = `${_config.apiBaseUrl}/logs`;

  for (const log of logs) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${_config.accessToken}`,
        },
        body: JSON.stringify(log),
      });
      // silently ignore non-ok responses to avoid console spam
      if (!res.ok && _config.enableConsole) {
        // only log once, not spam
      }
    } catch {
      // network errors silently ignored to not disrupt UI
    }
  }
}

function flushLogs(): void {
  if (_logQueue.length === 0) return;

  const logsToSend = [..._logQueue];
  _logQueue = [];
  sendLogs(logsToSend);
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Initialize the logger with an access token and optional config overrides.
 * Must be called before Log() will send to the API.
 */
export function initLogger(
  accessToken: string,
  overrides?: Partial<LogConfig>
): void {
  _config = {
    ..._config,
    ...overrides,
    accessToken,
  };

  _isInitialized = true;

  // Start batch flush timer
  if (_flushTimer) clearInterval(_flushTimer);
  _flushTimer = setInterval(flushLogs, _config.flushInterval);

  if (accessToken) {
    consoleLog({
      stack: 'frontend',
      level: 'info',
      package: 'api',
      message: 'logger initialized successfully',
    });
  }
}

/**
 * Set or update the access token for the logger.
 */
export function setLoggerToken(token: string): void {
  _config.accessToken = token;
}

/**
 * Core logging function — reusable across the entire application.
 *
 * @param stack  - Always 'frontend' for this track
 * @param level  - One of: debug | info | warn | error | fatal
 * @param pkg    - One of: api | component | hook | page | state | style
 * @param message - Human-readable log message
 */
export function Log(
  stack: string,
  level: LogLevel,
  pkg: LogPackage,
  message: string
): void {
  // Enforce lowercase as per requirements
  const payload: LogPayload = {
    stack: stack.toLowerCase(),
    level: level.toLowerCase() as LogLevel,
    package: pkg.toLowerCase() as LogPackage,
    message: sanitizeMessage(message),
  };

  // Always log to console
  consoleLog(payload);

  // Queue for API delivery
  _logQueue.push(payload);

  // Auto-flush if batch size reached
  if (_logQueue.length >= _config.batchSize) {
    flushLogs();
  }
}

/**
 * Force flush all pending logs immediately.
 * Call this before app unmount or on critical errors.
 */
export function flushLogsNow(): void {
  flushLogs();
}

/**
 * Destroy the logger — clears timers and pending queue.
 */
export function destroyLogger(): void {
  if (_flushTimer) {
    clearInterval(_flushTimer);
    _flushTimer = null;
  }
  flushLogs(); // Send remaining
  _isInitialized = false;
}

/**
 * Check if logger has been initialized.
 */
export function isLoggerReady(): boolean {
  return _isInitialized;
}

// Export default for convenience
export default Log;
