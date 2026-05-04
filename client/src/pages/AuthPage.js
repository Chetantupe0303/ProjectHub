import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Link,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import { AdminPanelSettings, School, ShieldOutlined, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { ThemeToggleButton } from '../components/ui/ThemeToggleButton';
import { colorPalette, typography, borderRadius, transitions } from '../theme/designSystem';

const AuthPage = ({ audience = 'student', initialTab = 0 }) => {
  const theme = useTheme();
  const isAdminPortal = audience === 'admin';
  const isHeadAdmin = audience === 'headadmin';
  const isFacultyOrAdmin = isAdminPortal || isHeadAdmin;
  const postAuthRoute = isHeadAdmin ? '/headadmin-panel' : isAdminPortal ? '/faculty' : '/dashboard';
  const [tab, setTab] = useState(initialTab);
  const [formData, setFormData] = useState({
    rollNo: '',
    password: '',
    name: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';
  const formControlSx = {
    '& .MuiInputBase-root': {
      minHeight: 56,
    },
  };

  const sectionReveal = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = tab === 0
        ? await login(isFacultyOrAdmin ? formData.email : formData.rollNo, formData.password, audience)
        : await register(
            isFacultyOrAdmin
              ? { name: formData.name, email: formData.email, password: formData.password }
              : formData,
            audience
          );

      if (result.success) {
        navigate(postAuthRoute);
      } else {
        setError(result.error);
      }
    } catch (submitError) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        bgcolor: isDark ? colorPalette.dark.background : colorPalette.background.secondary,
        backgroundImage: isDark
          ? `radial-gradient(1200px 560px at 82% -10%, ${alpha(colorPalette.tertiary.DEFAULT, 0.22)} 0%, transparent 58%),
             radial-gradient(1000px 520px at 2% -6%, ${alpha(colorPalette.primary.DEFAULT, 0.18)} 0%, transparent 52%),
             linear-gradient(160deg, ${colorPalette.dark.background} 0%, ${alpha(colorPalette.dark.surface, 0.96)} 100%)`
          : `radial-gradient(1000px 500px at 85% -10%, ${alpha(colorPalette.tertiary.light, 0.18)} 0%, transparent 58%),
             radial-gradient(880px 450px at 0% -8%, ${alpha(colorPalette.primary.light, 0.2)} 0%, transparent 50%)`,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBack />}
          sx={{
            color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
            fontWeight: 600,
            bgcolor: isDark ? alpha(colorPalette.dark.surface, 0.4) : alpha('#FFFFFF', 0.6),
            backdropFilter: 'blur(8px)',
            borderRadius: borderRadius.md,
            px: 2,
            py: 1,
            border: `1px solid ${isDark ? alpha(colorPalette.light.surface, 0.1) : 'rgba(0,0,0,0.05)'}`,
            '&:hover': {
              bgcolor: isDark ? alpha(colorPalette.dark.surface, 0.8) : '#FFFFFF',
              transform: 'translateY(-2px)',
              boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
            },
            transition: transitions.normal,
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <ThemeToggleButton />
      </Box>

      <motion.div variants={sectionReveal} initial="hidden" animate="visible" style={{ width: '100%', maxWidth: 960, zIndex: 1 }}>
      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 960,
          minHeight: { xs: 'auto', md: 620 },
          overflow: 'hidden',
          border: isDark ? `1px solid ${alpha(colorPalette.light.surface, 0.16)}` : '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: borderRadius.xl,
          bgcolor: isDark ? alpha(colorPalette.dark.surface, 0.8) : '#FFFFFF',
          backdropFilter: 'blur(14px)',
          boxShadow: isDark ? '0 26px 56px rgba(6, 10, 16, 0.5)' : '0 18px 40px rgba(16, 24, 40, 0.12)',
          transition: transitions.normal,
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.85fr 1.15fr' }, minHeight: { xs: 'auto', md: 620 } }}>
          {/* Left Side - Dark Panel with Primary Color */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              p: 5,
              color: isDark ? colorPalette.dark.text : colorPalette.text.primary,
              background: isDark
                ? alpha('#16222E', 0.92)
                : `linear-gradient(165deg, ${alpha(colorPalette.primary.light, 0.14)} 0%, ${alpha('#FFFFFF', 0.96)} 62%)`,
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: isDark
                  ? `radial-gradient(520px 280px at 8% 10%, ${alpha(colorPalette.primary.light, 0.22)} 0%, transparent 64%), radial-gradient(420px 240px at 92% 100%, ${alpha(colorPalette.tertiary.light, 0.18)} 0%, transparent 62%)`
                  : `radial-gradient(500px 260px at 10% 12%, ${alpha(colorPalette.primary.DEFAULT, 0.12)} 0%, transparent 66%), radial-gradient(400px 220px at 90% 90%, ${alpha(colorPalette.tertiary.DEFAULT, 0.08)} 0%, transparent 64%)`,
                pointerEvents: 'none',
              },
            }}
          >
            <Box sx={{ maxWidth: 300, position: 'relative', zIndex: 1 }}>
              <Chip
                icon={isFacultyOrAdmin ? <AdminPanelSettings /> : <School />}
                label={isHeadAdmin ? 'Admin Portal' : isAdminPortal ? 'Faculty Portal' : 'Student Portal'}
                sx={{
                  width: 'fit-content',
                  mb: 3,
                  bgcolor: isDark ? alpha('#FFFFFF', 0.92) : alpha(colorPalette.primary.light, 0.3),
                  color: isDark ? colorPalette.tertiary.dark : colorPalette.primary.dark,
                  fontWeight: 600,
                  border: isDark
                    ? `1px solid ${alpha(colorPalette.tertiary.dark, 0.2)}`
                    : `1px solid ${alpha(colorPalette.primary.DEFAULT, 0.28)}`,
                  '& .MuiChip-icon': { color: isDark ? colorPalette.tertiary.dark : colorPalette.primary.dark }
                }}
              />
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.display,
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: '1.75rem',
                  mb: 2,
                  lineHeight: 1.3,
                }}
              >
                {isHeadAdmin ? 'Manage All Faculties' : isAdminPortal ? 'Manage reviews with confidence' : 'Submit and track your project work'}
              </Typography>
              <Typography sx={{ color: isDark ? alpha(colorPalette.dark.text, 0.86) : colorPalette.text.secondary, lineHeight: 1.75, mb: 4, fontSize: '0.95rem' }}>
                {isHeadAdmin
                  ? 'Complete control over faculty accounts, monitor all submissions, and manage access.'
                  : isAdminPortal
                  ? 'Separate faculty access, structured review controls, and a workspace built for approval decisions.'
                  : 'A straightforward student flow for project submission, repository links, and review updates.'}
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Typography variant="body2" sx={{ color: isDark ? alpha(colorPalette.dark.text, 0.8) : colorPalette.text.secondary }}>
                  {isHeadAdmin ? 'View and manage all faculty accounts.' : isAdminPortal ? 'Review repository links, ratings, and feedback from one dashboard.' : 'Store your GitHub repository link and check your project status anytime.'}
                </Typography>
                <Typography variant="body2" sx={{ color: isDark ? alpha(colorPalette.dark.text, 0.8) : colorPalette.text.secondary }}>
                  {isHeadAdmin ? 'Delete faculty accounts and reassign projects.' : isAdminPortal ? 'Move between pending, reviewed, approved, and rejected projects quickly.' : 'Analyze your repository before submitting it to the faculty panel.'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right Side - Form */}
          <CardContent
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              display: 'flex',
              alignItems: 'center',
              bgcolor: isDark ? alpha(colorPalette.dark.surface, 0.72) : '#FFFFFF',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 440, mx: 'auto' }}>
              <Chip
                icon={isFacultyOrAdmin ? <ShieldOutlined /> : <School />}
                label={isHeadAdmin ? 'Super Admin access' : isAdminPortal ? 'Faculty access' : 'Student access'}
                sx={{
                  mb: 2,
                  borderColor: alpha(colorPalette.primary.DEFAULT, 0.64),
                  color: isDark ? colorPalette.primary.light : colorPalette.primary.dark,
                  fontWeight: 500,
                  bgcolor: isDark ? alpha(colorPalette.primary.DEFAULT, 0.1) : alpha(colorPalette.primary.light, 0.14),
                  '& .MuiChip-icon': { color: isDark ? colorPalette.primary.light : colorPalette.primary.dark }
                }}
                variant="outlined"
              />
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.display,
                  fontWeight: typography.fontWeight.semibold,
                  fontSize: '1.75rem',
                  mb: 1,
                  color: isDark ? '#FFFFFF' : colorPalette.text.primary,
                }}
              >
                {isHeadAdmin ? 'Admin account' : isAdminPortal ? 'Faculty account' : 'Welcome'}
              </Typography>
              <Typography sx={{ mb: 3, color: isDark ? colorPalette.dark.textMuted : colorPalette.text.secondary, lineHeight: 1.6 }}>
                {isHeadAdmin
                  ? 'Use your admin email and password to sign in or register.'
                  : isAdminPortal
                  ? 'Use your faculty email and password to sign in or register.'
                  : 'Use your student login or create a new student account.'}
              </Typography>

              <Typography variant="body2" sx={{ mb: 3, color: isDark ? colorPalette.dark.textMuted : colorPalette.text.secondary }}>
                {isHeadAdmin
                  ? 'Need faculty access?'
                  : isAdminPortal
                  ? 'Need the student portal instead?'
                  : 'Need faculty access instead?'}{' '}
                <Link
                  component={RouterLink}
                  to={isHeadAdmin ? '/admin/login' : isAdminPortal ? '/login' : '/admin/login'}
                  underline="hover"
                  sx={{ fontWeight: 600, color: colorPalette.primary.DEFAULT }}
                >
                  {isHeadAdmin
                    ? 'Open faculty login'
                    : isAdminPortal
                    ? 'Open student login'
                    : 'Open faculty login'}
                </Link>
              </Typography>

              <Tabs
                value={tab}
                onChange={(_, value) => {
                  setTab(value);
                  setError('');
                }}
                variant="fullWidth"
                sx={{
                  mb: 3,
                  bgcolor: isDark ? alpha(colorPalette.dark.background, 0.64) : colorPalette.background.tertiary,
                  borderRadius: borderRadius.md,
                  p: 0.5,
                  border: `1px solid ${isDark ? alpha(colorPalette.light.surface, 0.15) : alpha(colorPalette.text.secondary, 0.18)}`,
                  '& .MuiTabs-indicator': { display: 'none' },
                  '& .MuiTab-root': {
                    minHeight: 48,
                    borderRadius: borderRadius.sm,
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: isDark ? alpha(colorPalette.dark.text, 0.72) : colorPalette.text.secondary,
                    transition: 'transform 300ms ease, background-color 300ms ease, color 300ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: isDark ? alpha('#2F7DF6', 0.14) : alpha('#2563EB', 0.08),
                    },
                    '&.Mui-selected': {
                      backgroundColor: isDark ? '#2F7DF6' : '#2563EB',
                      color: '#EAF2FF !important',
                      boxShadow: `0 6px 14px ${alpha('#2563EB', 0.32)}`,
                    }
                  }
                }}
              >
                <Tab label={isFacultyOrAdmin ? (isHeadAdmin ? 'Admin login' : 'Faculty login') : 'Login'} />
                <Tab label={isFacultyOrAdmin ? (isHeadAdmin ? 'Admin signup' : 'Faculty signup') : 'Sign up'} />
              </Tabs>

              {error && (
                <Alert severity="error" sx={{ mb: 3, bgcolor: isDark ? alpha(colorPalette.error, 0.12) : '#FFFFFF', color: colorPalette.error, border: `1px solid ${alpha(colorPalette.error, 0.24)}` }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.25,
                }}
              >
                <TextField
                  fullWidth
                  required
                  label={isFacultyOrAdmin ? 'Email' : 'Roll number'}
                  name={isFacultyOrAdmin ? 'email' : 'rollNo'}
                  type={isFacultyOrAdmin ? 'email' : 'text'}
                  value={isFacultyOrAdmin ? formData.email : formData.rollNo}
                  onChange={handleChange}
                  variant="outlined"
                  sx={formControlSx}
                />
                <TextField
                  fullWidth
                  required
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  sx={formControlSx}
                />

                {tab === 1 && isAdminPortal && (
                  <TextField
                    fullWidth
                    required
                    label="Faculty name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    sx={formControlSx}
                  />
                )}

                {tab === 1 && !isAdminPortal && (
                  <>
                    <TextField
                      fullWidth
                      required
                      label="Full name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      variant="outlined"
                      sx={formControlSx}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      sx={formControlSx}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    width: '100%',
                    minHeight: 56,
                    py: 1.5,
                    backgroundColor: isDark ? '#2F7DF6' : '#2563EB',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderRadius: borderRadius.lg,
                    boxShadow: `0 10px 24px ${alpha('#2563EB', 0.34)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: isDark ? '#256BCE' : '#1D4ED8',
                      boxShadow: `0 14px 28px ${alpha('#2563EB', 0.4)}`,
                    }
                  }}
                >
                  {loading
                    ? 'Please wait...'
                    : tab === 0
                      ? (isHeadAdmin ? 'Login as Admin' : isAdminPortal ? 'Login as faculty' : 'Login')
                      : (isHeadAdmin ? 'Create Admin account' : isAdminPortal ? 'Create faculty account' : 'Create account')}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
      </motion.div>
    </Box>
  );
};

export default AuthPage;
