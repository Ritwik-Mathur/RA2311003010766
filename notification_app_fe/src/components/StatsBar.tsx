import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import {
  Notifications as AllIcon,
  MarkEmailUnread as UnreadIcon,
  MarkEmailRead as ReadIcon,
  Star as PriorityIcon,
} from '@mui/icons-material';

interface StatsBarProps {
  total: number;
  unread: number;
  priority: number;
}

interface StatCardProps {
  icon: React.ReactElement;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 120,
      p: 2,
      borderRadius: 3,
      background: (t) => alpha(t.palette.background.paper, 0.5),
      backdropFilter: 'blur(20px)',
      border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      transition: 'all 0.3s',
      '&:hover': {
        borderColor: alpha(color, 0.4),
        boxShadow: `0 4px 20px ${alpha(color, 0.1)}`,
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '9px',
        background: alpha(color, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {React.cloneElement(icon, { sx: { color, fontSize: 18 } })}
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, fontSize: '1.1rem' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

const StatsBar: React.FC<StatsBarProps> = ({ total, unread, priority }) => (
  <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
    <StatCard icon={<AllIcon />} label="Total" value={total} color="#6C63FF" />
    <StatCard icon={<UnreadIcon />} label="Unread" value={unread} color="#FF5A7E" />
    <StatCard icon={<ReadIcon />} label="Read" value={total - unread} color="#66BB6A" />
    <StatCard icon={<PriorityIcon />} label="Priority" value={priority} color="#FFB547" />
  </Box>
);

export default StatsBar;
