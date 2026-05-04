import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Avatar,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  School,
  Assignment,
  Settings,
  ExitToApp,
  MenuOpen,
  GitHub,
  TrendingUp,
  AdminPanelSettings,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navigationItems = {
  admin: [
    { text: 'Faculty Dashboard', icon: <Dashboard />, path: '/faculty' },
  ],
  student: [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'My Projects', icon: <Assignment />, path: '/projects' },
    { text: 'Submit', icon: <GitHub />, path: '/submit' },
    { text: 'Analytics', icon: <TrendingUp />, path: '/analytics' },
  ],
};

const drawerWidth = 280;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();
  
  const items = isAdmin ? navigationItems.admin : navigationItems.student;

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '3px',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isAdmin ? (
                <AdminPanelSettings sx={{ color: '#fff', fontSize: 20 }} />
              ) : (
                <School sx={{ color: '#fff', fontSize: 20 }} />
              )}
            </Box>
            <Box>
              <Typography
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '1rem',
                  lineHeight: 1.2,
                }}
              >
                Project Hub
              </Typography>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                Management System
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {},
            }}
          >
            <MenuOpen />
          </IconButton>
        </Box>
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: 'primary.main',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                display: 'block',
              }}
            >
              {user?.rollNo} · {user?.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: 2 }}>
          {items.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: '3px',
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(30, 64, 175, 0.08)',
                    borderLeft: '3px solid',
                    borderLeftColor: 'primary.main',
                    '&:hover': {},
                  },
                  '&:hover': {},
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      fontSize: '0.875rem',
                      color: location.pathname === item.path ? 'text.primary' : 'text.secondary',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        {isAdmin && (
          <List sx={{ px: 0 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation('/admin-panel')}
                sx={{
                  borderRadius: '3px',
                  py: 1.5,
                  px: 2,
                  '&:hover': {},
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Panel"
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        )}
        <List sx={{ px: 0 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/settings')}
              sx={{
                borderRadius: '3px',
                py: 1.5,
                px: 2,
                '&:hover': {},
              }}
            >
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Settings"
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
          
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: '3px',
                py: 1.5,
                px: 2,
                '&:hover': {},
              }}
            >
              <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: 'error.main',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
