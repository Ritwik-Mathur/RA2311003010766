/**
 * NotificationCard Component
 *
 * Displays a single notification with type badge, timestamp,
 * read/unread indicator, and hover effects.
 */

import React, { useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Event as EventIcon,
  EmojiEvents as ResultIcon,
  Work as PlacementIcon,
  Circle as UnreadDot,
  CheckCircle as ReadIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { Log } from '@logger';
import type { Notification } from '../types';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  index: number;
}

// Type configuration for visual styling
const TYPE_CONFIG: Record<string, {
  icon: React.ReactElement;
  color: string;
  gradient: string;
  label: string;
}> = {
  event: {
    icon: <EventIcon fontSize="small" />,
    color: '#4FC3F7',
    gradient: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
    label: 'Event',
  },
  result: {
    icon: <ResultIcon fontSize="small" />,
    color: '#FFB547',
    gradient: 'linear-gradient(135deg, #FFB547, #FFA726)',
    label: 'Result',
  },
  placement: {
    icon: <PlacementIcon fontSize="small" />,
    color: '#66BB6A',
    gradient: 'linear-gradient(135deg, #66BB6A, #4CAF50)',
    label: 'Placement',
  },
};

const DEFAULT_TYPE_CONFIG = {
  icon: <EventIcon fontSize="small" />,
  color: '#9D97FF',
  gradient: 'linear-gradient(135deg, #9D97FF, #6C63FF)',
  label: 'General',
};

function formatTimestamp(ts: string): string {
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return ts;
  }
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  index,
}) => {
  const typeConfig =
    TYPE_CONFIG[notification.type.toLowerCase()] || DEFAULT_TYPE_CONFIG;
  const isRead = notification.isRead;

  const handleClick = useCallback(() => {
    if (!isRead) {
      Log(
        'frontend',
        'info',
        'component',
        `notification ${notification.id} clicked — marking as read`
      );
      onMarkAsRead(notification.id);
    }
  }, [isRead, notification.id, onMarkAsRead]);

  return (
    <Card
      onClick={handleClick}
      className="notification-enter"
      id={`notification-card-${notification.id}`}
      sx={{
        cursor: isRead ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'visible',
        animationDelay: `${index * 0.05}s`,
        opacity: isRead ? 0.7 : 1,
        borderLeft: `3px solid ${isRead ? 'transparent' : typeConfig.color}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateX(4px)',
          opacity: 1,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Type Icon */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: typeConfig.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 12px ${alpha(typeConfig.color, 0.3)}`,
            }}
          >
            {React.cloneElement(typeConfig.icon, { sx: { color: '#fff' } })}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 0.5,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={typeConfig.label}
                size="small"
                sx={{
                  background: alpha(typeConfig.color, 0.15),
                  color: typeConfig.color,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 22,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.secondary',
                }}
              >
                <TimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {formatTimestamp(notification.timestamp)}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: isRead ? 'text.secondary' : 'text.primary',
                lineHeight: 1.6,
                fontWeight: isRead ? 400 : 500,
                wordBreak: 'break-word',
              }}
            >
              {notification.message}
            </Typography>
          </Box>

          {/* Read/Unread Indicator */}
          <Tooltip title={isRead ? 'Read' : 'Mark as read'} arrow placement="left">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              id={`btn-read-${notification.id}`}
              sx={{
                flexShrink: 0,
                color: isRead ? 'success.main' : 'primary.main',
                opacity: isRead ? 0.5 : 1,
              }}
            >
              {isRead ? <ReadIcon fontSize="small" /> : <UnreadDot sx={{ fontSize: 12 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(NotificationCard);
