/**
 * Notification Algorithm — Stage 1
 *
 * Implements logic to fetch and return TOP N priority notifications
 * sorted by type priority (placement > result > event), with
 * timestamp as a tiebreaker, using an efficient min-heap approach.
 *
 * PRIORITY ORDER:
 *   placement (3) > result (2) > event (1)
 *
 * PSEUDOCODE:
 * ─────────────────────────────────────────────────────────────────
 * 1. FETCH notifications from API (dynamic, no DB storage)
 * 2. PARSE each notification — normalize type & timestamp
 * 3. SORT notifications by timestamp DESCENDING (newest first)
 * 4. For PRIORITY view, rank by type weight then recency
 * 5. Use a MIN-HEAP of size N for efficient top-N extraction
 *   a) If heap size < N → insert directly
 *   b) If new score > heap.min → remove min, insert new
 *   c) Otherwise → discard (it's not in top N)
 * - Time complexity: O(M log N) where M = total notifications
 * ─────────────────────────────────────────────────────────────────
 */

import { Log } from '@logger';
import type { Notification, RawNotification } from '../types';

// ─── Priority weights: placement > result > event ───────────────────────────

const TYPE_PRIORITY: Record<string, number> = {
  placement: 3,
  result: 2,
  event: 1,
};

/**
 * Compute a combined priority score.
 * Type weight is the primary factor (multiplied by a large constant)
 * so that ALL placements rank above ALL results, etc.
 * Timestamp is the tiebreaker within the same type.
 */
function getPriorityScore(notif: Notification): number {
  const typeWeight = TYPE_PRIORITY[notif.type.toLowerCase()] || 0;
  const recency = parseTimestamp(notif.timestamp);
  // typeWeight * 1e15 ensures type always dominates over timestamp
  return typeWeight * 1e15 + recency;
}

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

// ─── Core: Get Top N Notifications by priority ─────────────────────────────

export function getTopNNotifications(
  notifications: Notification[],
  n: number = 10
): Notification[] {
  Log(
    'frontend',
    'info',
    'api',
    `extracting top ${n} priority notifications (placement>result>event)`
  );

  // Sort by type priority DESC, then timestamp DESC as tiebreaker
  const sorted = [...notifications].sort((a, b) => {
    const scoreA = getPriorityScore(a);
    const scoreB = getPriorityScore(b);
    return scoreB - scoreA;
  });
  const topN = sorted.slice(0, n);

  Log(
    'frontend',
    'info',
    'api',
    `returned ${topN.length} priority notifications`
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
 * Priority order: placement > result > event (with timestamp tiebreaker)
 *
 * When new notifications stream in, we don't re-sort the entire array.
 * Instead:
 * - Maintain a min-heap of size N (keyed by priority score)
 * - New notification: compare with heap root (minimum score)
 *   - If higher priority → replace root and heapify down
 *   - If lower → skip (not in top N)
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
      `min-heap initialized with capacity ${n} (placement>result>event)`
    );
  }

  private getScore(notif: Notification): number {
    return getPriorityScore(notif);
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
      this.getScore(this.heap[i]) <
        this.getScore(this.heap[this.parent(i)])
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
      this.getScore(this.heap[l]) <
        this.getScore(this.heap[smallest])
    ) {
      smallest = l;
    }

    if (
      r < this.heap.length &&
      this.getScore(this.heap[r]) <
        this.getScore(this.heap[smallest])
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
      this.getScore(notification) > this.getScore(this.heap[0])
    ) {
      // New notification has higher priority than lowest in heap - replace
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
      (a, b) => this.getScore(b) - this.getScore(a)
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
