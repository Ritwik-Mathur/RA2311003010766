/**
 * FilterBar Component
 *
 * Controls for filtering notifications by type, toggling priority view,
 * and adjusting pagination limit. Uses query params via parent hook.
 */

import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Star as StarIcon,
  ViewList as ListIcon,
} from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';
import { Log } from '@logger';

interface FilterBarProps {
  notificationType: string;
  showPriority: boolean;
  limit: number;
  totalCount: number;
  onTypeChange: (type: string) => void;
  onPriorityToggle: () => void;
  onLimitChange: (limit: number) => void;
}

const NOTIFICATION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'event', label: 'Event' },
  { value: 'result', label: 'Result' },
  { value: 'placement', label: 'Placement' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  notificationType,
  showPriority,
  limit,
  totalCount,
  onTypeChange,
  onPriorityToggle,
  onLimitChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    const type = event.target.value;
    Log('frontend', 'info', 'component', `filter type changed: ${type || 'all'}`);
    onTypeChange(type);
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    const newLimit = Number(event.target.value);
    Log('frontend', 'info', 'component', `limit changed to ${newLimit}`);
    onLimitChange(newLimit);
  };

  const handlePriorityToggle = () => {
    Log('frontend', 'info', 'component', `priority toggle clicked: ${!showPriority}`);
    onPriorityToggle();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 2,
        p: { xs: 2, md: 3 },
        background: (t) => alpha(t.palette.background.paper, 0.5),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
      }}
    >
      {/* View Toggle */}
      <ToggleButtonGroup
        value={showPriority ? 'priority' : 'all'}
        exclusive
        onChange={handlePriorityToggle}
        size="small"
        id="toggle-view-mode"
        sx={{
          '& .MuiToggleButton-root': {
            px: 2,
            py: 1,
            gap: 0.5,
          },
        }}
      >
        <ToggleButton value="all" id="btn-view-all">
          <ListIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            All
          </Typography>
        </ToggleButton>
        <ToggleButton value="priority" id="btn-view-priority">
          <StarIcon fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Priority
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Type Filter */}
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="filter-type-label">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FilterIcon fontSize="small" />
            Type
          </Box>
        </InputLabel>
        <Select
          labelId="filter-type-label"
          id="select-notification-type"
          value={notificationType}
          onChange={handleTypeChange}
          label="Filter Type"
        >
          {NOTIFICATION_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value} id={`option-type-${type.value || 'all'}`}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Limit Selector */}
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="limit-label">Per Page</InputLabel>
        <Select
          labelId="limit-label"
          id="select-limit"
          value={limit}
          onChange={handleLimitChange}
          label="Per Page"
        >
          {[5, 10, 20, 50].map((val) => (
            <MenuItem key={val} value={val} id={`option-limit-${val}`}>
              {val}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Count Badge */}
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={`${totalCount} notifications`}
          size="small"
          variant="outlined"
          sx={{
            borderColor: (t) => alpha(t.palette.primary.main, 0.3),
            color: 'text.secondary',
          }}
        />
      </Box>
    </Box>
  );
};

export default FilterBar;
