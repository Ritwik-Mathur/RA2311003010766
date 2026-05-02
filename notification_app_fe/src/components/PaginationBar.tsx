import React from 'react';
import { Box, Pagination, Typography, alpha } from '@mui/material';
import { Log } from '@logger';
import type { PaginationState } from '../types';

interface PaginationBarProps {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ pagination, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const startItem = Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total);
  const endItem = Math.min(pagination.page * pagination.limit, pagination.total);

  const handleChange = (_e: React.ChangeEvent<unknown>, value: number) => {
    Log('frontend', 'info', 'component', `pagination: page ${value}`);
    onPageChange(value);
  };

  if (pagination.total === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        p: { xs: 2, md: 3 },
        background: (t) => alpha(t.palette.background.paper, 0.5),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        Showing {startItem}–{endItem} of {pagination.total}
      </Typography>
      <Pagination
        count={totalPages}
        page={pagination.page}
        onChange={handleChange}
        color="primary"
        shape="rounded"
        showFirstButton
        showLastButton
        id="pagination-controls"
        sx={{
          '& .MuiPaginationItem-root': {
            fontWeight: 600,
            borderRadius: '10px',
            '&.Mui-selected': {
              boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.3)}`,
            },
          },
        }}
      />
    </Box>
  );
};

export default PaginationBar;
