/**
 * Notification Algorithm — Stage 1
 *
 * Implements logic to fetch and return TOP N latest notifications
 * sorted by timestamp, with an efficient min-heap approach for
 * maintaining top N when new notifications arrive.
 *
 * PSEUDOCODE:
 * ─────────────────────────────────────────────────────────────────
 * 1. FETCH notifications from API (dynamic, no DB storage)
 * 2. PARSE each notification — normalize type & timestamp
 * 3. SORT notifications by timestamp DESCENDING (newest first)
 * 4. SLICE the top N notifications (default N = 10)
 * 5. RETURN the sorted top N list
 *
 * For efficient top-N maintenance with streaming data:
 * - Use a MIN-HEAP of size N
 * - For each new notification:
 *   a) If heap size < N → insert directly
 *   b) If new timestamp > heap.min → remove min, insert new
 *   c) Otherwise → discard (it's not in top N)
 * - Time complexity: O(M log N) where M = total notifications
 * ─────────────────────────────────────────────────────────────────
 */

import { Log } from '@logger';
import type { Notification, RawNotification } from '../types';

// ─── Utility: Parse timestamp to epoch ──────────────────────────────────────

function parseTimestamp(ts: string): number {
  const parsed = new Date(ts).getTime();
  if (isNaN(parsed)) {
    Log('frontend', 'warn', 'api', `invalid timestamp encountered: ${ts}`);
    return 0;
  }
  return parsed;
}

// ─── Utility: Normalize a raw notification ──────────────────────────────────

let _idCounter = 0;

function normalizeNotification(raw: RawNotification): Notification {
  return {
    id: (raw.id || raw.ID || `notif-${++_idCounter}-${Date.now()}`) as string,
    message: (raw.message || raw.Message || 'No message') as string,
    type: ((raw.type || raw.Type || 'event') as string).toLowerCase(),
    timestamp: (raw.timestamp || raw.Timestamp || new Date().toISOString()) as string,
    isRead: false,
  };
}

// ─── Core: Sort notifications by timestamp DESC ─────────────────────────────

export function sortNotificationsByTimestamp(
  notifications: Notification[]
): Notification[] {
  Log(
    'frontend',
    'debug',
    'api',
    `sorting ${notifications.length} notifications by timestamp descending`
  );

  const sorted = [...notifications].sort((a, b) => {
    const timeA = parseTimestamp(a.timestamp);
    const timeB = parseTimestamp(b.timestamp);
    return timeB - timeA; // DESC — newest first
  });

  Log('frontend', 'info', 'api', 'notifications sorted successfully');
  return sorted;
}

// ─── Core: Get Top N Notifications ──────────────────────────────────────────

export function getTopNNotifications(
  notifications: Notification[],
  n: number = 10
): Notification[] {
  Log(
    'frontend',
    'info',
    'api',
    `extracting top ${n} notifications from ${notifications.length} total`
  );

  const sorted = sortNotificationsByTimestamp(notifications);
  const topN = sorted.slice(0, n);

  Log(
    'frontend',
    'info',
    'api',
    `returned ${topN.length} top notifications`
  );

  return topN;
}

// ─── Core: Parse raw notifications ──────────────────────────────────────────

export function parseNotifications(
  rawData: RawNotification[]
): Notification[] {
  Log(
    'frontend',
    'info',
    'api',
    `parsing ${rawData.length} raw notifications`
  );

  const parsed = rawData.map(normalizeNotification);

  Log(
    'frontend',
    'info',
    'api',
    `parsed ${parsed.length} notifications successfully`
  );

  return parsed;
}

// ─── Advanced: Min-Heap for efficient Top N maintenance ─────────────────────

/**
 * MinHeap implementation for maintaining top N notifications efficiently.
 *
 * When new notifications stream in, we don't re-sort the entire array.
 * Instead:
 * - Maintain a min-heap of size N (keyed by timestamp)
 * - New notification: compare with heap root (minimum timestamp)
 *   - If newer → replace root and heapify down
 *   - If older → skip (not in top N)
 * - Result: O(M log N) instead of O(M log M) for each update
 */
export class MinHeapTopN {
  private heap: Notification[] = [];
  private maxSize: number;

  constructor(n: number = 10) {
    this.maxSize = n;
    Log(
      'frontend',
      'info',
      'api',
      `min-heap initialized with capacity ${n}`
    );
  }

  private getTimestamp(notif: Notification): number {
    return parseTimestamp(notif.timestamp);
  }

  private parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private left(i: number): number {
    return 2 * i + 1;
  }

  private right(i: number): number {
    return 2 * i + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private heapifyUp(i: number): void {
    while (
      i > 0 &&
      this.getTimestamp(this.heap[i]) <
        this.getTimestamp(this.heap[this.parent(i)])
    ) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  private heapifyDown(i: number): void {
    let smallest = i;
    const l = this.left(i);
    const r = this.right(i);

    if (
      l < this.heap.length &&
      this.getTimestamp(this.heap[l]) <
        this.getTimestamp(this.heap[smallest])
    ) {
      smallest = l;
    }

    if (
      r < this.heap.length &&
      this.getTimestamp(this.heap[r]) <
        this.getTimestamp(this.heap[smallest])
    ) {
      smallest = r;
    }

    if (smallest !== i) {
      this.swap(i, smallest);
      this.heapifyDown(smallest);
    }
  }

  /**
   * Insert a notification into the heap.
   * Maintains only top N newest.
   */
  insert(notification: Notification): void {
    if (this.heap.length < this.maxSize) {
      this.heap.push(notification);
      this.heapifyUp(this.heap.length - 1);
    } else if (
      this.getTimestamp(notification) > this.getTimestamp(this.heap[0])
    ) {
      // New notification is newer than the oldest in top N — replace
      this.heap[0] = notification;
      this.heapifyDown(0);
    }
    // Otherwise: notification is older than everything in top N — skip
  }

  /**
   * Insert multiple notifications.
   */
  insertBatch(notifications: Notification[]): void {
    Log(
      'frontend',
      'info',
      'api',
      `inserting batch of ${notifications.length} into min-heap`
    );
    for (const n of notifications) {
      this.insert(n);
    }
  }

  /**
   * Get the top N notifications sorted by timestamp DESC.
   */
  getTopN(): Notification[] {
    return [...this.heap].sort(
      (a, b) => this.getTimestamp(b) - this.getTimestamp(a)
    );
  }

  get size(): number {
    return this.heap.length;
  }
}

// ─── Pipeline: Complete notification processing ─────────────────────────────

export function processNotifications(
  rawData: RawNotification[],
  topN: number = 10
): {
  all: Notification[];
  priority: Notification[];
} {
  Log('frontend', 'info', 'api', 'starting notification processing pipeline');

  // Step 1: Parse
  const parsed = parseNotifications(rawData);

  // Step 2: Sort all by timestamp
  const all = sortNotificationsByTimestamp(parsed);

  // Step 3: Extract top N using min-heap for efficiency demo
  const heap = new MinHeapTopN(topN);
  heap.insertBatch(parsed);
  const priority = heap.getTopN();

  Log(
    'frontend',
    'info',
    'api',
    `pipeline complete: ${all.length} total, ${priority.length} priority`
  );

  return { all, priority };
}
