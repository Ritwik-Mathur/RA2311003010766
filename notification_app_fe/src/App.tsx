import React, { useEffect, useState, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { Log, initLogger } from '@logger';
import { buildTheme, THEME_PRESETS, type ThemeMode } from './theme';
import NotificationPage from './pages/NotificationPage';
import { useAuth } from './hooks/useAuth';

const AppContent: React.FC<{ themeMode: ThemeMode; onThemeChange: (m: ThemeMode) => void }> = ({
  themeMode,
  onThemeChange,
}) => {
  const { autoAuth } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Log('frontend', 'info', 'page', 'app initialized');
    initLogger('');

    const init = async () => {
      await autoAuth();
      setReady(true);
    };
    init();
  }, []);

  if (!ready) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={48} sx={{ color: THEME_PRESETS[themeMode].primary }} />
        <Typography variant="body2" color="text.secondary">
          Authenticating...
        </Typography>
      </Box>
    );
  }

  return <NotificationPage currentTheme={themeMode} onThemeChange={onThemeChange} />;
};

const App: React.FC = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = sessionStorage.getItem('notifyhub-theme');
    return (saved as ThemeMode) || 'dark';
  });

  const theme = useMemo(() => buildTheme(THEME_PRESETS[themeMode]), [themeMode]);

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    sessionStorage.setItem('notifyhub-theme', mode);
    Log('frontend', 'info', 'state', `theme switched to ${mode}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent themeMode={themeMode} onThemeChange={handleThemeChange} />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
