/**
 * ThemeSwitcher Component
 *
 * Floating button that opens a popover with theme color presets.
 */

import React, { useState } from 'react';
import {
  IconButton,
  Popover,
  Box,
  Typography,
  Tooltip,
  alpha,
} from '@mui/material';
import { Palette as PaletteIcon, Check as CheckIcon } from '@mui/icons-material';
import { Log } from '@logger';
import { THEME_PRESETS, type ThemeMode } from '../theme';

interface ThemeSwitcherProps {
  current: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ current, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    Log('frontend', 'info', 'component', 'theme switcher opened');
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (mode: ThemeMode) => {
    Log('frontend', 'info', 'component', `theme changed to ${mode}`);
    onChange(mode);
    handleClose();
  };

  const entries = Object.entries(THEME_PRESETS) as [ThemeMode, typeof THEME_PRESETS[ThemeMode]][];

  return (
    <>
      <Tooltip title="Change theme" arrow>
        <IconButton
          onClick={handleOpen}
          id="btn-theme-switcher"
          sx={{
            color: 'text.secondary',
            transition: 'all 0.3s',
            '&:hover': {
              color: 'primary.main',
              background: (t) => alpha(t.palette.primary.main, 0.1),
              transform: 'rotate(30deg)',
            },
          }}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              p: 2,
              borderRadius: 3,
              minWidth: 200,
              background: (t) => alpha(t.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
            },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, px: 0.5 }}>
          Choose Theme
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {entries.map(([key, preset]) => {
            const isActive = key === current;
            return (
              <Box
                key={key}
                onClick={() => handleSelect(key)}
                id={`theme-option-${key}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: isActive
                    ? (t) => `2px solid ${t.palette.primary.main}`
                    : '2px solid transparent',
                  background: isActive
                    ? (t) => alpha(t.palette.primary.main, 0.08)
                    : 'transparent',
                  '&:hover': {
                    background: (t) => alpha(t.palette.primary.main, 0.12),
                  },
                }}
              >
                {/* Color swatch */}
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})`,
                    border: '2px solid',
                    borderColor: (t) => alpha(t.palette.divider, 0.3),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isActive && <CheckIcon sx={{ color: '#fff', fontSize: 16 }} />}
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'primary.main' : 'text.primary',
                  }}
                >
                  {preset.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Popover>
    </>
  );
};

export default ThemeSwitcher;
