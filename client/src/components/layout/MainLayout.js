import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggleButton } from '../ui/ThemeToggleButton';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const workspaceTitle = (() => {
    if (location.pathname === '/faculty') return 'Faculty Workspace';
    if (location.pathname === '/admin-panel' || location.pathname === '/headadmin-panel' || user?.role === 'headadmin') {
      return 'Admin Workspace';
    }
    return 'Student Workspace';
  })();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ gap: 2, position: 'relative', minHeight: 72 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleSidebarToggle}
            edge="start"
            sx={{
              color: 'text.primary',
              '&:hover': {},
            }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {workspaceTitle}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <ThemeToggleButton />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 2, sm: 3, md: 4 },
            py: 3,
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
