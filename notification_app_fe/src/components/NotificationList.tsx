/**
 * NotificationList Component
 *
 * Renders a list of notification cards with loading skeletons,
 * empty state, and error handling.
 */

import React from 'react';
import { Box, Typography, Skeleton, Alert, alpha } from '@mui/material';
import { InboxOutlined as EmptyIcon } from '@mui/icons-material';
import { Log } from '@logger';
import NotificationCard from './NotificationCard';
import type { Notification } from '../types';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
}

const LoadingSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Box
        key={i}
        className="notification-skeleton"
        sx={{
          height: 90,
          borderRadius: 3,
          p: 2.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Skeleton
          variant="rounded"
          width={40}
          height={40}
          sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton
            variant="text"
            width="30%"
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="80%"
            sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
          />
        </Box>
      </Box>
    ))}
  </Box>
);

const EmptyState: React.FC = () => {
  Log('frontend', 'info', 'component', 'empty state rendered — no notifications');

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 8,
        px: 3,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '20px',
          background: (t) => alpha(t.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}
      >
        <EmptyIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        No Notifications Found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Try adjusting your filters or check back later for new notifications.
      </Typography>
    </Box>
  );
};

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  onMarkAsRead,
}) => {
  if (loading) {
    Log('frontend', 'debug', 'component', 'rendering loading skeletons');
    return <LoadingSkeleton />;
  }

  if (error) {
    Log('frontend', 'error', 'component', `rendering error state: ${error}`);
    return (
      <Alert
        severity="error"
        variant="outlined"
        sx={{
          borderRadius: 3,
          backdropFilter: 'blur(20px)',
          background: (t) => alpha(t.palette.error.main, 0.05),
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Failed to load notifications
        </Typography>
        <Typography variant="body2">{error}</Typography>
      </Alert>
    );
  }

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  Log(
    'frontend',
    'debug',
    'component',
    `rendering ${notifications.length} notification cards`
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {notifications.map((notif, index) => (
        <NotificationCard
          key={notif.id}
          notification={notif}
          onMarkAsRead={onMarkAsRead}
          index={index}
        />
      ))}
    </Box>
  );
};

export default NotificationList;
