/**
 * Theme system with multiple color presets.
 * Supports: Dark, Light, Ocean, Sunset, Forest
 */

import { createTheme, alpha, type Theme } from '@mui/material/styles';

export type ThemeMode = 'dark' | 'light' | 'ocean' | 'sunset' | 'forest';

export interface ThemePreset {
  label: string;
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  bgDefault: string;
  bgPaper: string;
  textPrimary: string;
  textSecondary: string;
  swatch: string; // preview color for the picker
}

export const THEME_PRESETS: Record<ThemeMode, ThemePreset> = {
  dark: {
    label: 'Dark',
    mode: 'dark',
    primary: '#6C63FF',
    secondary: '#00D9A6',
    bgDefault: '#0A0E1A',
    bgPaper: '#111827',
    textPrimary: '#E8EAED',
    textSecondary: '#9AA0A6',
    swatch: '#0A0E1A',
  },
  light: {
    label: 'Light',
    mode: 'light',
    primary: '#5B52E0',
    secondary: '#00B88D',
    bgDefault: '#F5F7FA',
    bgPaper: '#FFFFFF',
    textPrimary: '#1A1A2E',
    textSecondary: '#64748B',
    swatch: '#F5F7FA',
  },
  ocean: {
    label: 'Ocean',
    mode: 'dark',
    primary: '#00BCD4',
    secondary: '#FF6F61',
    bgDefault: '#0D1B2A',
    bgPaper: '#1B2838',
    textPrimary: '#E0F7FA',
    textSecondary: '#80CBC4',
    swatch: '#0D1B2A',
  },
  sunset: {
    label: 'Sunset',
    mode: 'dark',
    primary: '#FF6B6B',
    secondary: '#FFC947',
    bgDefault: '#1A0A1E',
    bgPaper: '#2D1536',
    textPrimary: '#FFF0E6',
    textSecondary: '#C9A0DC',
    swatch: '#1A0A1E',
  },
  forest: {
    label: 'Forest',
    mode: 'dark',
    primary: '#4CAF50',
    secondary: '#81C784',
    bgDefault: '#0B1A0B',
    bgPaper: '#142814',
    textPrimary: '#E8F5E9',
    textSecondary: '#A5D6A7',
    swatch: '#0B1A0B',
  },
};

const sharedTypography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  h1: { fontWeight: 800, letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, letterSpacing: '-0.01em' },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  subtitle1: { fontWeight: 500 },
  body1: { lineHeight: 1.7 },
  body2: { lineHeight: 1.6 },
  button: { textTransform: 'none' as const, fontWeight: 600 },
};

export function buildTheme(preset: ThemePreset): Theme {
  const p = preset;
  return createTheme({
    palette: {
      mode: p.mode,
      primary: { main: p.primary },
      secondary: { main: p.secondary },
      error: { main: '#FF5A7E' },
      warning: { main: '#FFB547' },
      info: { main: '#4FC3F7' },
      success: { main: '#66BB6A' },
      background: { default: p.bgDefault, paper: p.bgPaper },
      text: { primary: p.textPrimary, secondary: p.textSecondary },
      divider: alpha(p.mode === 'dark' ? '#ffffff' : '#000000', 0.08),
    },
    typography: sharedTypography,
    shape: { borderRadius: 12 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(p.primary, 0.3)} transparent`,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(p.primary, 0.3),
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(p.primary, 0.5),
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: `0 4px 20px ${alpha(p.primary, 0.3)}`,
            },
          },
          contained: {
            boxShadow: `0 2px 12px ${alpha(p.primary, 0.25)}`,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            background: alpha(p.bgPaper, 0.7),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(p.mode === 'dark' ? '#ffffff' : '#000000', 0.06)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              border: `1px solid ${alpha(p.primary, 0.2)}`,
              boxShadow: `0 8px 32px ${alpha(p.primary, 0.1)}`,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, fontSize: '0.75rem', borderRadius: 8 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px !important',
            textTransform: 'none',
            fontWeight: 600,
            '&.Mui-selected': {
              background: alpha(p.primary, 0.2),
              borderColor: `${p.primary} !important`,
              color: p.primary,
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(p.primary, 0.5),
            },
          },
        },
      },
    },
  });
}

// Default export for backward compat
const defaultTheme = buildTheme(THEME_PRESETS.dark);
export default defaultTheme;
