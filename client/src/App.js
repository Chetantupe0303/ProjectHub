import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import { createAppTheme } from './theme/theme';

function AppContent() {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = createAppTheme(isAdmin ? 'admin' : 'student', isDarkMode ? 'dark' : 'light');

  if (loading) {
    return (
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                border: '4px solid',
                borderTopColor: theme.palette.primary.main,
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: theme.palette.primary.main,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}
            />
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
              Loading...
            </Typography>
          </Box>
        </Box>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </MuiThemeProvider>
    );
  }

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <AuthPage audience="student" initialTab={0} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <AuthPage audience="student" initialTab={1} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/admin/login" 
          element={!isAuthenticated ? <AuthPage audience="admin" initialTab={0} /> : <Navigate to="/faculty" />} 
        />
        <Route 
          path="/admin/signup" 
          element={!isAuthenticated ? <AuthPage audience="admin" initialTab={1} /> : <Navigate to="/faculty" />} 
        />
        <Route 
          path="/headadmin/login" 
          element={!isAuthenticated ? <AuthPage audience="headadmin" initialTab={0} /> : <Navigate to="/headadmin-panel" />} 
        />
        <Route 
          path="/headadmin/signup" 
          element={!isAuthenticated ? <AuthPage audience="headadmin" initialTab={1} /> : <Navigate to="/headadmin-panel" />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                {isAdmin ? <AdminDashboard adminMode={false} /> : <StudentDashboard />}
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/faculty" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard adminMode={false} />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin-panel" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard adminMode={true} />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/headadmin-panel" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboard adminMode={true} />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" />} 
        />
      </Routes>
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ReactLenis root>
        <AppContent />
      </ReactLenis>
    </ThemeProvider>
  );
}

export default App;
