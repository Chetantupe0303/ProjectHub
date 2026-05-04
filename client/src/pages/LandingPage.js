import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, useTheme, alpha } from '@mui/material';
import { School, AdminPanelSettings, ArrowForward, GitHub, TrendingUp, Assignment, AutoGraph } from '@mui/icons-material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ThemeToggleButton } from '../components/ui/ThemeToggleButton';
import { colorPalette, typography, borderRadius } from '../theme/designSystem';

const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const SectionLabel = ({ children }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
      <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)' }} />
      <Typography sx={{ fontFamily: typography.fontFamily.display, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: colorPalette.primary.DEFAULT, whiteSpace: 'nowrap' }}>
        {children}
      </Typography>
      <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)' }} />
    </Box>
  );
};

const PrimaryButton = ({ children, variant = 'primary', ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isPrimary = variant === 'primary';

  return (
    <Button
      {...props}
      sx={{
        minHeight: 56,
        py: 1.75,
        px: 3.75,
        fontSize: '1rem',
        fontWeight: 600,
        borderRadius: 2,
        letterSpacing: '0.01em',
        textTransform: 'none',
        transition: 'transform 300ms ease, background-color 300ms ease, border-color 300ms ease',
        ...(isPrimary
          ? {
            backgroundColor: colorPalette.primary.DEFAULT,
            color: '#FFFFFF',
            '&:hover': { backgroundColor: colorPalette.primary.dark, transform: 'translateY(-2px)' },
          }
          : {
            backgroundColor: 'transparent',
            color: isDark ? '#FFFFFF' : colorPalette.text.primary,
            border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(22,32,51,0.12)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(22,32,51,0.03)',
              transform: 'translateY(-2px)',
            },
          }),
        ...props.sx,
      }}
    >
      {children}
    </Button>
  );
};

const TiltCard = ({ children }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
        height: '100%',
        perspective: 1000
      }}
    >
      <div style={{ transform: "translateZ(30px)", height: '100%' }}>
        {children}
      </div>
    </motion.div>
  );
};

const MouseSpotlight = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX - 250);
      cursorY.set(e.clientY - 250);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0,
        x: cursorXSpring,
        y: cursorYSpring,
        mixBlendMode: 'screen',
      }}
    />
  );
};

const FeatureCard = ({ icon, title, description, delay }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} style={{ height: '100%' }}>
      <TiltCard>
        <Box
          sx={{
            p: 4,
            height: '100%',
            borderRadius: '24px',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'default',
          '&:hover': {
            transform: 'translateY(-10px)',
            bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,1)',
            borderColor: colorPalette.primary.DEFAULT,
            boxShadow: `0 20px 40px -10px ${alpha(colorPalette.primary.DEFAULT, 0.2)}`,
            '& .icon-box': {
              transform: 'scale(1.1) rotate(5deg)',
              bgcolor: colorPalette.primary.DEFAULT,
              color: '#fff'
            }
          }
        }}
      >
        <Box className="icon-box" sx={{ width: 48, height: 48, borderRadius: '14px', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(colorPalette.primary.DEFAULT, 0.1), color: colorPalette.primary.DEFAULT, transition: 'all 0.3s ease' }}>
          {icon}
        </Box>
        <Typography sx={{ fontFamily: typography.fontFamily.display, fontWeight: 800, fontSize: '1.2rem', color: isDark ? '#FFFFFF' : '#000', mb: 1.5, letterSpacing: '-0.2px' }}>
          {title}
        </Typography>
        <Typography sx={{ color: isDark ? colorPalette.dark.textMuted : '#4b5563', lineHeight: 1.7, fontSize: '0.95rem', fontWeight: 500 }}>
          {description}
          </Typography>
        </Box>
      </TiltCard>
    </motion.div>
  );
};

const BackgroundAnimation = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Dynamic Orbs */}
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '5%', left: '15%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />
      <motion.div
        animate={{ x: [0, -100, 60, 0], y: [0, 80, -40, 0], scale: [1, 0.8, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', bottom: '10%', right: '10%', width: '35vw', height: '35vw', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)', filter: 'blur(100px)' }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 15, repeat: Infinity }}
        style={{ position: 'absolute', top: '40%', right: '30%', width: '25vw', height: '25vw', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, transparent 70%)', filter: 'blur(70px)' }}
      />

      {/* Modern Grid Trace */}
      <Box sx={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
      }} />
    </Box>
  );
};

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ py: 6, borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', position: 'relative', zIndex: 1, bgcolor: isDark ? 'transparent' : '#f9fafb' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, bgcolor: colorPalette.primary.DEFAULT, borderRadius: '8px' }} />
            <Typography sx={{ color: isDark ? '#fff' : '#111', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Nexus Hub</Typography>
          </Box>
          <Typography sx={{ color: isDark ? colorPalette.dark.textMuted : '#6b7280', fontSize: '0.875rem', fontWeight: 600 }}>Built for students and faculty excellence © 2026</Typography>
        </Box>
      </Container>
    </Box>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: isDark ? '#050505' : '#ffffff', position: 'relative', overflow: 'hidden' }}>
      <MouseSpotlight />
      <BackgroundAnimation />

      <Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 1200 }}>
        <ThemeToggleButton />
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 12, md: 20 }, pb: { xs: 8, md: 15 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 0.8fr' }, gap: { xs: 8, lg: 12 }, alignItems: 'center' }}>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeInUp}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{ px: 2, py: 0.5, bgcolor: alpha(colorPalette.primary.DEFAULT, 0.1), borderRadius: '100px', border: `1px solid ${alpha(colorPalette.primary.DEFAULT, 0.2)}` }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: colorPalette.primary.DEFAULT, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Evolutionary Tracking
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography sx={{ fontFamily: typography.fontFamily.display, fontWeight: 900, fontSize: { xs: '3.5rem', sm: '4.5rem', md: '5.5rem', lg: '6.5rem' }, lineHeight: 0.9, letterSpacing: '-0.05em', color: isDark ? '#FFFFFF' : '#111', mb: 4 }}>
                Streamline Your <br />
                <Box component="span" sx={{ background: `linear-gradient(90deg, ${colorPalette.primary.DEFAULT}, #c026d3)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>Project Approvals</Box>
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Typography sx={{ maxWidth: 640, color: isDark ? colorPalette.dark.textMuted : '#4b5563', lineHeight: 1.6, fontSize: { xs: '1.1rem', md: '1.25rem' }, fontWeight: 500, mb: 6 }}>
                The official next-generation platform for students to navigate coursework and administrators to orchestrate project approvals with AI-driven intelligence.
              </Typography>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <PrimaryButton variant="primary" onClick={() => navigate('/login')} sx={{ borderRadius: '100px', px: 5 }}>
                  Get Started
                </PrimaryButton>
                <PrimaryButton variant="secondary" sx={{ borderRadius: '100px', px: 5 }} onClick={() => {
                  document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
                }}>
                  Explore Features
                </PrimaryButton>
              </Box>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <TiltCard>
              <Box sx={{
                p: { xs: 4, md: 6 },
                borderRadius: '40px',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
              boxShadow: isDark ? '0 32px 64px -16px rgba(0,0,0,0.5)' : '0 32px 64px -16px rgba(0,0,0,0.1)'
            }}>
              <Typography sx={{ fontFamily: typography.fontFamily.display, fontSize: '0.8rem', fontWeight: 900, letterSpacing: '4px', textTransform: 'uppercase', color: isDark ? alpha('#fff', 0.4) : '#6b7280', mb: 4 }}>
                System Access
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {[
                  { label: 'Student Portal', icon: <School />, route: '/login', desc: 'Secure project submission' },
                  { label: 'Faculty Control', icon: <AdminPanelSettings />, route: '/admin/login', desc: 'Advanced review tools' },
                  { label: 'Network Admin', icon: <AdminPanelSettings />, route: '/headadmin/login', desc: 'System-wide governance' }
                ].map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.route)}
                    sx={{
                      justifyContent: 'flex-start',
                      p: 3,
                      borderRadius: '20px',
                      bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f3f4f6',
                      color: isDark ? '#fff' : '#111',
                      border: '1px solid transparent',
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(colorPalette.primary.DEFAULT, 0.1),
                        borderColor: alpha(colorPalette.primary.DEFAULT, 0.3),
                        transform: 'translateX(8px)',
                        '& .btn-icon': { color: colorPalette.primary.DEFAULT, transform: 'scale(1.2)' }
                      }
                    }}
                  >
                    <Box className="btn-icon" sx={{ mr: 2.5, display: 'flex', color: isDark ? alpha('#fff', 0.3) : '#9ca3af', transition: 'all 0.3s' }}>
                      {item.icon}
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '1rem', display: 'block' }}>{item.label}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.6 }}>{item.desc}</Typography>
                    </Box>
                    </Button>
                  ))}
                </Box>
              </Box>
            </TiltCard>
          </motion.div>
        </Box>
      </Container>

      <Box id="features-section" sx={{ py: { xs: 12, md: 20 }, position: 'relative' }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Typography sx={{ fontFamily: typography.fontFamily.display, fontWeight: 900, fontSize: { xs: '2rem', md: '3.5rem' }, textAlign: 'center', mb: 8, color: isDark ? '#fff' : '#111', letterSpacing: '-1px' }}>
              Built for the <Box component="span" sx={{ color: colorPalette.primary.DEFAULT }}>Integrated Developer</Box>
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {[
              { icon: <GitHub />, title: 'Deep Repo Sync', desc: 'Bi-directional repository tracking with real-time sync nodes.' },
              { icon: <TrendingUp />, title: 'Live Pulse', desc: 'Continuous deployment monitoring and project health metrics.' },
              { icon: <Assignment />, title: 'Elite Flow', desc: 'Minimalist submission engine designed for zero-friction throughput.' },
              { icon: <AutoGraph />, title: 'Core Intelligence', desc: 'Advanced algorithm feedback analyzing core contribution layers.' },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} lg={3} key={item.title}>
                <FeatureCard icon={item.icon} title={item.title} description={item.desc} delay={index * 0.1} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage;
