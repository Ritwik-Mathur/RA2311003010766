import React, { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { Log } from '@logger';
import { useNotifications } from '../hooks/useNotifications';
import Header from '../components/Header';
import StatsBar from '../components/StatsBar';
import FilterBar from '../components/FilterBar';
import NotificationList from '../components/NotificationList';
import PaginationBar from '../components/PaginationBar';
import type { ThemeMode } from '../theme';

interface NotificationPageProps {
  currentTheme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const NotificationPage: React.FC<NotificationPageProps> = ({ currentTheme, onThemeChange }) => {
  const {
    displayNotifications,
    priorityNotifications,
    notifications,
    pagination,
    filters,
    loading,
    error,
    unreadCount,
    setPage,
    setLimit,
    setNotificationType,
    togglePriority,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications(10);

  useEffect(() => {
    Log('frontend', 'info', 'page', 'notification page loaded');
    return () => {
      Log('frontend', 'info', 'page', 'notification page unmounted');
    };
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        unreadCount={unreadCount}
        onRefresh={refresh}
        onMarkAllRead={markAllAsRead}
        currentTheme={currentTheme}
        onThemeChange={onThemeChange}
      />

      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 }, flex: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <StatsBar
            total={notifications.length}
            unread={unreadCount}
            priority={priorityNotifications.length}
          />

          <FilterBar
            notificationType={filters.notificationType}
            showPriority={filters.showPriorityOnly}
            limit={pagination.limit}
            totalCount={pagination.total}
            onTypeChange={setNotificationType}
            onPriorityToggle={togglePriority}
            onLimitChange={setLimit}
          />

          <NotificationList
            notifications={displayNotifications}
            loading={loading}
            error={error}
            onMarkAsRead={markAsRead}
          />

          <PaginationBar pagination={pagination} onPageChange={setPage} />
        </Box>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          textAlign: 'center',
          py: 3,
          color: 'text.secondary',
          fontSize: '0.75rem',
          borderTop: (t: any) => `1px solid ${t.palette.divider}`,
        }}
      >
        NotifyHub — Campus Hiring Evaluation
      </Box>
    </Box>
  );
};

export default NotificationPage;
