import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Grid, Card, CardContent, CardActions, Chip, IconButton, Alert,
  CircularProgress, Stack, Divider, Tooltip, useTheme, alpha, LinearProgress,
  Avatar, Container, AvatarGroup
} from '@mui/material';
import { 
  Add, GitHub, Visibility, Launch, ContentCopy, Timeline, Speed, People, 
  AutoAwesome, LightbulbOutlined, Refresh, MoreVert
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { projectAPI, githubAPI, dashboardAPI, authAPI } from '../services/api';
import EmptyState from '../components/ui/EmptyState';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox, FormControlLabel, FormGroup, Paper } from '@mui/material';

// --- WIDGET COMPONENTS ---
const SortableWidget = ({ id, children, className }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className={`relative overflow-hidden group ${className}`}>
      {/* Drag Handle Overlay */}
      <div 
        {...listeners} 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-black/10 p-1 rounded z-20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </div>
      {children}
    </div>
  );
};

const StudentDashboard = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const surface = theme.palette.background.paper;
  const sectionSurface = isDark ? alpha(theme.palette.background.paper, 0.86) : theme.palette.background.paper;
  const mutedSurface = isDark ? alpha(theme.palette.common.white, 0.04) : theme.palette.grey[50];
  const softBorder = isDark ? alpha(theme.palette.common.white, 0.08) : alpha(theme.palette.common.black, 0.08);
  const primaryGradient = `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`;
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [collabMetrics, setCollabMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', repoUrl: '' });
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewAnalysis, setPreviewAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);

  // Layout State
  const [widgetOrder, setWidgetOrder] = useState(['ai-score', 'collab-insights', 'activity-timeline', 'ai-assistant']);

  const sectionReveal = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
    },
  };

  const staggerReveal = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  useEffect(() => {
    fetchDashboardInfo();
    // Real-time polling every 30 seconds
    const interval = setInterval(fetchDashboardInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (submitDialogOpen) {
      fetchFaculties();
    }
  }, [submitDialogOpen]);

  const fetchDashboardInfo = async () => {
    try {
      // Use silent loading for background polls
      if (!dashboardData) setLoading(true);
      const [userRes, dashRes, collabRes, projRes] = await Promise.all([
        authAPI.getCurrentUser(),
        dashboardAPI.getDashboardData(),
        dashboardAPI.getCollaborationMetrics(),
        projectAPI.getMyProjects()
      ]);
      setUser(userRes.data);
      setDashboardData(dashRes.data);
      setCollabMetrics(collabRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      setFacultiesLoading(true);
      const response = await authAPI.getFaculties();
      setFaculties(response.data);
    } catch (fetchError) {
      setError('Failed to load faculty list');
    } finally {
      setFacultiesLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setWidgetOrder((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const analyzeRepository = async () => {
    if (!formData.repoUrl) return setError('Please enter a GitHub URL');
    setAnalyzing(true);
    try {
      const response = await githubAPI.analyzeRepo(formData.repoUrl);
      setPreviewAnalysis(response.data);
      setSuccess('Repository analyzed!');
    } catch (err) {
      setError('Analysis failed. Verify the URL.');
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleFacultySelection = (facultyId) => {
    setSelectedFacultyIds((current) => (
      current.includes(facultyId)
        ? current.filter((id) => id !== facultyId)
        : [...current, facultyId]
    ));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.repoUrl || !selectedFacultyIds.length) return setError('Fill in all fields');
    setSubmitting(true);
    try {
      const response = await projectAPI.submitProject({ ...formData, facultyRecipients: selectedFacultyIds });
      setProjects([response.data, ...projects]);
      setSubmitDialogOpen(false);
      setFormData({ title: '', description: '', repoUrl: '' });
      setSelectedFacultyIds([]);
      setPreviewAnalysis(null);
      fetchDashboardInfo();
      setSuccess('Project live on dashboard!');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const colorPalette = {
    dark: {
      surface: '#111111',
      textMuted: '#a1a1aa'
    }
  };

  // --- NEW UNIQUE WIDGETS ---
  const widgets = {
    'ai-score': (
      <Card sx={{ height: '100%', borderRadius: '32px', background: 'linear-gradient(225deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 60px -12px rgba(30, 27, 75, 0.5)' }}>
        {/* Animated Background Orbs for Premium feel */}
        <motion.div
          animate={{ x: [0, 50, -50, 0], y: [0, -30, 30, 0], scale: [1, 1.2, 0.8, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, background: 'rgba(99, 102, 241, 0.3)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} 
        />
        <motion.div
          animate={{ x: [0, -40, 40, 0], y: [0, 40, -40, 0], scale: [1, 0.9, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ position: 'absolute', bottom: -60, left: -40, width: 220, height: 220, background: 'rgba(168, 85, 247, 0.25)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} 
        />

        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
             <Box>
                <Typography variant="overline" sx={{ letterSpacing: 4, fontWeight: 900, opacity: 0.9, color: '#a5b4fc', textShadow: '0 0 15px rgba(165, 180, 252, 0.4)' }}>AI PERFORMANCE UTILIZATION</Typography>
                <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, type: 'spring' }}>
                  <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '3.5rem', md: '5.5rem' }, letterSpacing: '-4px', lineHeight: 1, color: '#ffffff', filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.3))' }}>
                    {dashboardData?.avgRating || '0.0'}
                  </Typography>
                </motion.div>
             </Box>
             <motion.div whileHover={{ scale: 1.1, rotate: 15 }} animate={{ y: [0, -8, 0] }} transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.12)', width: 64, height: 64, border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                   <AutoAwesome sx={{ fontSize: 36, color: '#fbbf24', filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' }} />
                </Avatar>
             </motion.div>
          </Stack>
          
          <Box sx={{ mt: 'auto', pt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
               <Typography variant="caption" sx={{ fontWeight: 900, color: '#e0e7ff', letterSpacing: 1.5 }}>STATUS: OPTIMAL</Typography>
               <Typography variant="caption" sx={{ fontWeight: 900, color: '#fbbf24', letterSpacing: 1 }}>NEXT TIER: 9.5</Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <LinearProgress 
                variant="determinate" 
                value={(parseFloat(dashboardData?.avgRating || 0) / 10) * 100} 
                sx={{ 
                  height: 14, borderRadius: 7, bgcolor: 'rgba(255,255,255,0.08)', 
                  '& .MuiLinearProgress-bar': { 
                    background: 'linear-gradient(90deg, #818cf8, #ffffff, #818cf8)', 
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear',
                    borderRadius: 7,
                    boxShadow: '0 0 20px rgba(129, 140, 248, 0.6)' 
                  } 
                }} 
              />
              <style>{`
                @keyframes shimmer {
                  0% { background-position: 0% 50%; }
                  100% { background-position: 200% 50%; }
                }
              `}</style>
            </Box>
          </Box>
        </CardContent>
      </Card>
    ),
    'collab-insights': (
      <Card sx={{ height: '100%', borderRadius: '32px', background: isDark ? colorPalette.dark.surface : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
        {/* Radar background effect */}
        <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 140, height: 140, border: '2px solid rgba(79, 70, 229, 0.05)', borderRadius: '50%' }} />
        <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, border: '2px solid rgba(79, 70, 229, 0.03)', borderRadius: '50%' }} />
        
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: '16px' }}>
                <People sx={{ color: theme.palette.primary.main }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.5px', color: isDark ? '#fff' : 'inherit' }}>Nexus Core</Typography>
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
              </motion.div>
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#10b981', letterSpacing: 1 }}>LIVE SYNC</Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box sx={{ p: 2, bgcolor: isDark ? alpha('#ffffff', 0.05) : '#f8fafc', borderRadius: '20px', border: `1px solid ${softBorder}` }}>
               <Typography variant="caption" sx={{ color: isDark ? colorPalette.dark.textMuted : '#64748b', fontWeight: 800, display: 'block', mb: 0.5 }}>CO-AUTHORS</Typography>
               <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#fff' : 'inherit' }}>{collabMetrics?.uniqueContributors || 0}</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: isDark ? alpha('#ffffff', 0.05) : '#f1f5f9', borderRadius: '20px', border: `1px solid ${softBorder}` }}>
               <Typography variant="caption" sx={{ color: isDark ? colorPalette.dark.textMuted : '#64748b', fontWeight: 800, display: 'block', mb: 0.5 }}>TOTAL COMMITS</Typography>
               <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.secondary.main }}>{collabMetrics?.totalCommits || 0}</Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 2, px: 1 }}>
            <Typography variant="caption" sx={{ color: isDark ? alpha('#fff', 0.3) : '#94a3b8', fontWeight: 700 }}>
              Last updated: {collabMetrics?.globalSyncTime ? new Date(collabMetrics.globalSyncTime).toLocaleTimeString() : 'Syncing...'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    ),
    'activity-timeline': (
      <Card sx={{ height: '100%', borderRadius: '32px', background: isDark ? colorPalette.dark.surface : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
        {/* Unique Background GitHub Animation */}
        <motion.div
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 0.95, 1],
            opacity: [0.03, 0.05, 0.03]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: 'absolute', top: '15%', right: '-10%', zIndex: 0, pointerEvents: 'none' }}
        >
          <GitHub sx={{ fontSize: 200, color: isDark ? '#fff' : '#000' }} />
        </motion.div>

        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
           <Typography variant="h6" sx={{ fontWeight: 900, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5, color: isDark ? '#fff' : 'inherit' }}>
             <Timeline sx={{ color: theme.palette.primary.main }} /> Motion Log
           </Typography>
           
           <Stack spacing={2.5}>
              {dashboardData?.projects?.slice(0, 3).map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <Box sx={{ position: 'relative', pl: 3, borderLeft: `2px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}` }}>
                     <motion.div
                       animate={{ 
                         boxShadow: [`0 0 0px ${theme.palette.primary.main}`, `0 0 10px ${theme.palette.primary.main}`, `0 0 0px ${theme.palette.primary.main}`],
                         scale: [1, 1.2, 1]
                       }}
                       transition={{ duration: 2.5, repeat: Infinity }}
                       style={{ position: 'absolute', left: -6, top: 4, width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.palette.primary.main }}
                     />
                     <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.2, color: isDark ? '#fff' : 'inherit', mb: 0.5 }}>{p.title}</Typography>
                     <Stack direction="row" spacing={1} alignItems="center">
                        <GitHub sx={{ fontSize: 12, opacity: 0.5, color: isDark ? '#fff' : '#000' }} />
                        <Typography variant="caption" sx={{ color: isDark ? colorPalette.dark.textMuted : '#64748b', fontWeight: 600 }}>{new Date(p.submittedAt).toLocaleDateString()}</Typography>
                     </Stack>
                  </Box>
                </motion.div>
              ))}
              {(!dashboardData?.projects || dashboardData.projects.length === 0) && (
                <Typography variant="body2" sx={{ color: isDark ? colorPalette.dark.textMuted : '#64748b', fontStyle: 'italic' }}>Waiting for project motion...</Typography>
              )}
           </Stack>
        </CardContent>
      </Card>
    ),
    'ai-assistant': (
      <Card sx={{ height: '100%', borderRadius: '32px', background: isDark ? alpha('#09090b', 0.95) : '#09090b', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, background: 'rgba(79, 70, 229, 0.2)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <CardContent sx={{ p: 4 }}>
           <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
              <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                 <AutoAwesome sx={{ color: '#fbbf24' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 900, color: '#ffffff' }}>Cognitive Feed</Typography>
           </Stack>
           <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.6 }}>
             "Your collaboration hub is expanding. Crossing the 4-contributor mark has triggered a premium rating multiplier. Maintain this momentum to reach the Platinum tier."
           </Typography>
        </CardContent>
      </Card>
    )
  };

  const widgetGridStyles = {
    'ai-score': 'md:col-span-2 md:row-span-2',
    'collab-insights': 'md:col-span-1 md:row-span-1',
    'activity-timeline': 'md:col-span-1 md:row-span-2',
    'ai-assistant': 'md:col-span-2 md:row-span-1',
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: isDark ? '#000' : '#f8fafc' }}>
      <CircularProgress thickness={5} size={60} sx={{ color: theme.palette.primary.main }} />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: isDark ? '#000' : '#f8fafc', p: { xs: 2, sm: 4, md: 8 }, position: 'relative' }}>
      {/* BACKGROUND ORBS */}
      <Box sx={{ position: 'fixed', top: '10%', right: '5%', width: 500, height: 500, background: alpha(theme.palette.primary.main, 0.03), borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: '10%', left: '5%', width: 400, height: 400, background: alpha(theme.palette.secondary.main, 0.03), borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* HEADER */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 8 }}>
          <Box>
            <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 900, letterSpacing: 4, mb: 1, display: 'block' }}>PERSONAL HUB</Typography>
            <Typography variant="h2" sx={{ fontWeight: 900, color: isDark ? '#fff' : '#000000', letterSpacing: '-2px' }}>
               Welcome, {user?.name?.split(' ')[0] || 'Scholar'}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setSubmitDialogOpen(true)}
            sx={{ 
                borderRadius: '50px', px: 4, py: 2, fontWeight: 900, textTransform: 'none', 
                background: isDark ? alpha('#fff', 0.1) : '#09090b', color: '#fff', '&:hover': { background: isDark ? alpha('#fff', 0.2) : '#27272a' },
                boxShadow: '0 20px 30px -10px rgba(0,0,0,0.2)'
            }}
          >
            New Project
          </Button>
        </Box>

        {/* BENTO GRID */}
        <Box sx={{ mb: 10 }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[200px]">
                {widgetOrder.map((id) => (
                  <SortableWidget key={id} id={id} className={widgetGridStyles[id]}>
                    {widgets[id]}
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Box>

        {/* REPOSITORY SECTION */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <Typography variant="h4" sx={{ fontWeight: 900, color: isDark ? '#fff' : '#09090b', letterSpacing: '-1px' }}>Project Treasury</Typography>
           <IconButton sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, color: isDark ? '#fff' : 'inherit' }} onClick={fetchDashboardInfo}>
              <Refresh sx={{ fontSize: 20 }} />
           </IconButton>
        </Box>

        <Grid container spacing={4}>
          {projects.length > 0 ? (
            projects.map((project, idx) => (
              <Grid item xs={12} sm={6} lg={4} key={project._id}>
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card sx={{ 
                      height: '100%', borderRadius: '32px', background: isDark ? colorPalette.dark.surface : '#ffffff', 
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                      overflow: 'hidden', position: 'relative'
                  }}>
                    <Box sx={{ height: 4, width: '100%', background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }} />
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                         <Chip 
                            label={project.status} 
                            sx={{ 
                                bgcolor: project.status === 'Approved' ? '#ecfdf5' : '#fff7ed',
                                color: project.status === 'Approved' ? '#065f46' : '#9a3412',
                                fontWeight: 900, fontSize: '0.6rem', borderRadius: '10px'
                            }} 
                         />
                         <Typography variant="caption" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>{project.analysis?.rating || 0}/10</Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.5px', color: isDark ? '#fff' : 'inherit' }}>{project.title}</Typography>
                      <Typography variant="body2" sx={{ color: isDark ? colorPalette.dark.textMuted : '#000000', fontWeight: 600, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</Typography>
                      
                      {project.analysis?.feedback && (
                        <Box sx={{ mb: 3, p: 1.5, bgcolor: isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.05), borderRadius: '12px', border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AutoAwesome sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: theme.palette.primary.main, fontStyle: 'italic' }}>
                              FEEDBACK: {project.analysis.feedback}
                            </Typography>
                          </Stack>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                         <Box sx={{ p: 1, bgcolor: isDark ? alpha('#fff', 0.05) : '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1, flex: 1, mr: 2 }}>
                            <GitHub sx={{ fontSize: 16, color: isDark ? '#fff' : '#000' }} />
                            <Typography variant="caption" sx={{ color: isDark ? '#fff' : '#000', fontWeight: 800, fontSize: '0.65rem' }}>{project.repoUrl.split('/').pop()}</Typography>
                         </Box>
                         <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem', fontWeight: 800, border: '2px solid #fff' } }}>
                            {project.analysis?.contributors?.map((name, i) => (
                               <Avatar key={i} sx={{ bgcolor: theme.palette.primary.main }}>{name.charAt(0)}</Avatar>
                            ))}
                         </AvatarGroup>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 4, pb: 4, pt: 0 }}>
                      <Button 
                          fullWidth 
                          variant="contained" 
                          onClick={() => window.open(project.repoUrl, '_blank')}
                          sx={{ 
                              borderRadius: '16px', bgcolor: isDark ? alpha('#fff', 0.05) : '#f1f5f9', color: isDark ? '#fff' : '#09090b', 
                              fontWeight: 900, textTransform: 'none', boxShadow: 'none',
                              '&:hover': { bgcolor: isDark ? alpha('#fff', 0.1) : '#e2e8f0', boxShadow: 'none' }
                          }}
                      >
                          Access Repository
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
               <Box sx={{ textAlign: 'center', py: 10, bgcolor: isDark ? colorPalette.dark.surface : '#fff', borderRadius: '32px', border: `2px dashed ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                  <Typography variant="h6" sx={{ color: isDark ? colorPalette.dark.textMuted : '#64748b', fontWeight: 700 }}>No projects launched yet</Typography>
                  <Typography variant="body2" sx={{ color: isDark ? alpha('#fff', 0.2) : '#94a3b8' }}>Initialize your first entry to see AI insights</Typography>
               </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* SUBMIT DIALOG */}
      <Dialog 
          open={submitDialogOpen} 
          onClose={() => setSubmitDialogOpen(false)} 
          maxWidth="sm" fullWidth 
          PaperProps={{ sx: { borderRadius: '32px', p: 2, bgcolor: isDark ? colorPalette.dark.surface : '#fff', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.75rem', letterSpacing: '-1px', color: isDark ? '#ffffff' : '#000000' }}>Initialize Entry</DialogTitle>
        <DialogContent data-lenis-prevent="true">
          <AnimatePresence>
            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Alert severity="error" sx={{ mb: 3, borderRadius: '4px' }}>{error}</Alert></motion.div>}
          </AnimatePresence>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField fullWidth label="Venture Title" name="title" value={formData.title} onChange={handleInputChange} variant="filled" InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: isDark ? alpha('#ffffff', 0.05) : '#f8fafc' } }} />
            <TextField fullWidth label="Executive Summary" name="description" value={formData.description} onChange={handleInputChange} multiline rows={3} variant="filled" InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: isDark ? alpha('#ffffff', 0.05) : '#f8fafc' } }} />
            
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '16px', bgcolor: isDark ? alpha('#ffffff', 0.03) : '#f8fafc', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: isDark ? '#ffffff' : '#000000' }}>
                Select faculty reviewers
              </Typography>
              {facultiesLoading ? (
                <Box sx={{ py: 2, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : faculties.length ? (
                <FormGroup data-lenis-prevent="true" sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
                  {faculties.map((faculty) => (
                    <FormControlLabel
                      key={faculty.id}
                      control={
                        <Checkbox
                          checked={selectedFacultyIds.includes(faculty.id)}
                          onChange={() => toggleFacultySelection(faculty.id)}
                          sx={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'inherit' }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#ffffff' : '#000000' }}>
                          {faculty.name}{faculty.email ? ` (${faculty.email})` : ''}
                        </Typography>
                      }
                    />
                  ))}
                </FormGroup>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No faculty accounts found yet.
                </Typography>
              )}
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="GitHub Source" name="repoUrl" value={formData.repoUrl} onChange={handleInputChange} variant="filled" InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', bgcolor: isDark ? alpha('#ffffff', 0.05) : '#f8fafc' } }} />
              <Button variant="outlined" onClick={analyzeRepository} disabled={analyzing} sx={{ borderRadius: '16px', px: 4, fontWeight: 900, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                {analyzing ? <CircularProgress size={20} /> : 'Sync'}
              </Button>
            </Box>
            {previewAnalysis && (
              <Alert severity="info" sx={{ borderRadius: '20px', border: '1px solid #bfdbfe', bgcolor: '#eff6ff', color: '#1e40af' }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Project Viability: {previewAnalysis.rating}/10</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{previewAnalysis.feedback}</Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 4 }}>
          <Button onClick={() => setSubmitDialogOpen(false)} sx={{ fontWeight: 900, color: isDark ? colorPalette.dark.textMuted : '#64748b' }}>Abort</Button>
          <Button 
            onClick={handleSubmit} disabled={submitting} variant="contained" 
            sx={{ borderRadius: '50px', px: 6, py: 1.5, fontWeight: 900, background: isDark ? alpha('#ffffff', 0.1) : '#09090b', color: '#fff', '&:hover': { background: isDark ? alpha('#ffffff', 0.2) : '#27272a' } }}
          >
            {submitting ? 'Finalizing...' : 'Push to Repository'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentDashboard;
