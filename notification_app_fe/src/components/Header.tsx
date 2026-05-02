/**
 * Header Component
 *
 * App header with custom logo, notification badge, theme switcher,
 * refresh button, and responsive layout.
 */

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Badge,
  IconButton,
  Box,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  NotificationsActive as NotifIcon,
  Refresh as RefreshIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { Log } from '@logger';
import ThemeSwitcher from './ThemeSwitcher';
import type { ThemeMode } from '../theme';

interface HeaderProps {
  unreadCount: number;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  currentTheme: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const Header: React.FC<HeaderProps> = ({
  unreadCount,
  onRefresh,
  onMarkAllRead,
  currentTheme,
  onThemeChange,
}) => {
  const handleRefresh = () => {
    Log('frontend', 'info', 'component', 'refresh button clicked');
    onRefresh();
  };

  const handleMarkAllRead = () => {
    Log('frontend', 'info', 'component', 'mark all as read clicked');
    onMarkAllRead();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: (theme) => alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(20px)',
        borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}`,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
        {/* Logo & Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <Box
            component="img"
            src="/logo.png"
            alt="NotifyHub Logo"
            sx={{
              width: 42,
              height: 42,
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: (t) => `0 4px 15px ${alpha(t.palette.primary.main, 0.3)}`,
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              NotifyHub
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
            >
              Smart Notification Manager
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ThemeSwitcher current={currentTheme} onChange={onThemeChange} />

          <Tooltip title="Mark all as read" arrow>
            <IconButton
              onClick={handleMarkAllRead}
              id="btn-mark-all-read"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'secondary.main',
                  background: (theme) => alpha(theme.palette.secondary.main, 0.1),
                },
              }}
            >
              <DoneAllIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Refresh notifications" arrow>
            <IconButton
              onClick={handleRefresh}
              id="btn-refresh"
              sx={{
                color: 'text.secondary',
                transition: 'all 0.3s',
                '&:hover': {
                  color: 'primary.main',
                  background: (theme) => alpha(theme.palette.primary.main, 0.1),
                  transform: 'rotate(180deg)',
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={`${unreadCount} unread`} arrow>
            <IconButton
              id="btn-notifications-badge"
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="error"
                max={99}
                sx={{
                  '& .MuiBadge-badge': {
                    animation: unreadCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
                  },
                }}
              >
                <NotifIcon />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
