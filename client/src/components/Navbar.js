import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import { AccountCircle, Dashboard, School, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ minHeight: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {isAdmin ? (
            <AdminPanelSettings sx={{ mr: 1.5, color: 'text.primary' }} />
          ) : (
            <School sx={{ mr: 1.5, color: 'text.primary' }} />
          )}
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Student Project Manager
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {isAdmin ? 'Admin workspace' : 'Student workspace'}
            </Typography>
          </Box>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={isAdmin ? 'Admin' : 'Student'}
              size="small"
              sx={{
                fontWeight: 600,
                bgcolor: 'primary.main',
                color: '#fff',
              }}
            />
            <Button 
              color="inherit" 
              onClick={navigateToDashboard} 
              startIcon={<Dashboard />}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {}
              }}
            >
              Dashboard
            </Button>
            
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{ color: 'text.primary' }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  border: '1px solid',
                  borderColor: 'divider',
                }
              }}
            >
              <MenuItem onClick={handleClose}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.name} ({user.rollNo})
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Role: {user.role}
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
