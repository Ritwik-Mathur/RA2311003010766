/**
 * Custom Hook: useNotifications
 *
 * Manages notification state including fetching, filtering, pagination,
 * read/unread tracking, and priority selection.
 * Extensively instrumented with logging middleware.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Log } from '@logger';
import { fetchNotifications } from '../utils/api';
import { processNotifications } from '../utils/notificationAlgorithm';
import type { Notification, PaginationState, FilterState } from '../types';

interface UseNotificationsReturn {
  notifications: Notification[];
  displayNotifications: Notification[];
  priorityNotifications: Notification[];
  pagination: PaginationState;
  filters: FilterState;
  loading: boolean;
  error: string | null;
  readIds: Set<string>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setNotificationType: (type: string) => void;
  togglePriority: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refresh: () => void;
  unreadCount: number;
  topN: number;
  setTopN: (n: number) => void;
}

export function useNotifications(defaultTopN: number = 10): UseNotificationsReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [priorityNotifications, setPriorityNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [topN, setTopN] = useState(defaultTopN);
  const hasFetched = useRef(false);

  // Parse query params
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const notificationType = searchParams.get('notification_type') || '';
  const showPriorityOnly = searchParams.get('priority') === 'true';

  const filters: FilterState = {
    notificationType,
    showPriorityOnly,
  };

  // ─── Update query params ──────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams);
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }
      setSearchParams(newParams, { replace: true });
      Log('frontend', 'debug', 'state', `query params updated: ${JSON.stringify(updates)}`);
    },
    [searchParams, setSearchParams]
  );

  const setPage = useCallback(
    (p: number) => {
      Log('frontend', 'info', 'state', `page changed to ${p}`);
      updateParams({ page: p.toString() });
    },
    [updateParams]
  );

  const setLimit = useCallback(
    (l: number) => {
      Log('frontend', 'info', 'state', `limit changed to ${l}`);
      updateParams({ limit: l.toString(), page: '1' });
    },
    [updateParams]
  );

  const setNotificationType = useCallback(
    (type: string) => {
      Log('frontend', 'info', 'state', `filter type changed to: ${type || 'all'}`);
      updateParams({ notification_type: type, page: '1' });
    },
    [updateParams]
  );

  const togglePriority = useCallback(() => {
    const newVal = !showPriorityOnly;
    Log('frontend', 'info', 'state', `priority mode toggled to: ${newVal}`);
    updateParams({ priority: newVal ? 'true' : '', page: '1' });
  }, [showPriorityOnly, updateParams]);

  // ─── Fetch notifications ──────────────────────────────────────────────

  const loadNotifications = useCallback(async () => {
    Log('frontend', 'info', 'hook', 'loading notifications');
    setLoading(true);
    setError(null);

    try {
      const raw = await fetchNotifications();
      const { all, priority } = processNotifications(raw, topN);

      // Preserve read status
      const updatedAll = all.map((n) => ({
        ...n,
        isRead: readIds.has(n.id),
      }));
      const updatedPriority = priority.map((n) => ({
        ...n,
        isRead: readIds.has(n.id),
      }));

      setAllNotifications(updatedAll);
      setPriorityNotifications(updatedPriority);

      Log(
        'frontend',
        'info',
        'hook',
        `loaded ${updatedAll.length} notifications, ${updatedPriority.length} priority`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown error';
      Log('frontend', 'error', 'hook', `failed to load notifications: ${message}`);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [topN, readIds]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      Log('frontend', 'info', 'page', 'notification page mounted — initiating data fetch');
      loadNotifications();
    }
  }, [loadNotifications]);

  // ─── Filtering & Pagination ───────────────────────────────────────────

  const filteredNotifications = useMemo(() => {
    const source = showPriorityOnly ? priorityNotifications : allNotifications;

    let filtered = source;
    if (notificationType) {
      filtered = source.filter(
        (n) => n.type.toLowerCase() === notificationType.toLowerCase()
      );
      Log(
        'frontend',
        'debug',
        'state',
        `filtered by type "${notificationType}": ${filtered.length} results`
      );
    }

    return filtered;
  }, [allNotifications, priorityNotifications, showPriorityOnly, notificationType]);

  const paginatedNotifications = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filteredNotifications.slice(startIndex, endIndex);

    Log(
      'frontend',
      'debug',
      'state',
      `paginated: page ${page}, showing ${paginated.length} of ${filteredNotifications.length}`
    );

    return paginated;
  }, [filteredNotifications, page, limit]);

  const pagination: PaginationState = {
    page,
    limit,
    total: filteredNotifications.length,
  };

  // ─── Read/Unread management ───────────────────────────────────────────

  const markAsRead = useCallback(
    (id: string) => {
      Log('frontend', 'info', 'state', `marking notification ${id} as read`);
      setReadIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setAllNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setPriorityNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    },
    []
  );

  const markAllAsRead = useCallback(() => {
    Log('frontend', 'info', 'state', 'marking all notifications as read');
    const allIds = new Set(allNotifications.map((n) => n.id));
    setReadIds(allIds);
    setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setPriorityNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, [allNotifications]);

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.isRead).length,
    [allNotifications]
  );

  const refresh = useCallback(() => {
    Log('frontend', 'info', 'hook', 'manual refresh triggered');
    hasFetched.current = false;
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications: allNotifications,
    displayNotifications: paginatedNotifications,
    priorityNotifications,
    pagination,
    filters,
    loading,
    error,
    readIds,
    setPage,
    setLimit,
    setNotificationType,
    togglePriority,
    markAsRead,
    markAllAsRead,
    refresh,
    unreadCount,
    topN,
    setTopN,
  };
}
