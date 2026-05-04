import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Stack,
  Alert,
  Tooltip,
  Link,
  Avatar,
  alpha,
  useTheme,
  Paper,
  Badge,
  Drawer,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import { EditorialCard } from '../components/ui/EditorialCard';
import { DataGrid } from '@mui/x-data-grid';
import {
  Delete,
  Launch,
  ContentCopy,
  PendingActions,
  TaskAlt,
  Insights,
  Group,
  FilterList,
  Search,
  Refresh,
  Close,
  CheckCircle,
  Cancel,
  Sort
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = ({ adminMode = false }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [students, setStudents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [facultyReplacementById, setFacultyReplacementById] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProject, setSelectedProject] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [facultyDrawerOpen, setFacultyDrawerOpen] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const { user } = useAuth();

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardSurface = theme.palette.background.paper;
  const sectionSurface = isDark ? alpha(theme.palette.background.paper, 0.82) : theme.palette.background.paper;
  const mutedSurface = isDark ? alpha(theme.palette.common.white, 0.04) : theme.palette.grey[50];
  const strongBorder = isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.grey[200];
  const softShadow = isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.04)';

  const sectionReveal = { duration: 0.7, ease: [0.4, 0, 0.2, 1] };

  useEffect(() => {
    fetchProjects();
    if (adminMode) {
      fetchFaculties();
      fetchStudents();
    }
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, statusFilter, searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAllProjects({ sortBy, sortOrder });
      setProjects(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch projects' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      setFacultiesLoading(true);
      const response = await authAPI.getFaculties();
      setFaculties(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch faculty accounts' });
    } finally {
      setFacultiesLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setUsersLoading(true);
      const response = await authAPI.getAllUsers();
      setAllUsers(response.data);
      setStudents(response.data.filter(u => u.role === 'student'));
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch user accounts' });
    } finally {
      setUsersLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = projects;
    if (statusFilter) {
      filtered = filtered.filter(project => project.status === statusFilter);
    }
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.student?.rollNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredProjects(filtered);
  };

  const handleStatusUpdate = async (projectId, newStatus) => {
    try {
      await projectAPI.updateProjectStatus(projectId, newStatus, adminFeedback);
      fetchProjects();

      // Update local state smoothly if drawer is open
      if (selectedProject && selectedProject._id === projectId) {
        setSelectedProject({
          ...selectedProject,
          status: newStatus,
          analysis: { ...selectedProject.analysis, feedback: adminFeedback }
        });
      }

      setAdminFeedback('');
      setMessage({ type: 'success', text: `Project status updated to ${newStatus}` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not update project status' });
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action is permanent.')) {
      try {
        await projectAPI.deleteProject(projectId);
        fetchProjects();
        if (selectedProject && selectedProject._id === projectId) setDrawerOpen(false);
        setMessage({ type: 'success', text: 'Project deleted successfully' });
      } catch (error) {
        setMessage({ type: 'error', text: 'Could not delete project' });
      }
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    const replacementFacultyId = facultyReplacementById[facultyId] || '';

    if (!facultyId) {
      setMessage({ type: 'error', text: 'Invalid faculty ID' });
      return;
    }

    try {
      await authAPI.deleteFaculty(facultyId, replacementFacultyId);
      setMessage({
        type: 'success',
        text: replacementFacultyId
          ? 'Faculty account deleted and projects transferred'
          : 'Faculty account deleted successfully'
      });
      setFacultyReplacementById((current) => {
        const next = { ...current };
        delete next[facultyId];
        return next;
      });
      fetchFaculties();
      fetchStudents();
    } catch (error) {
      console.error('Delete faculty error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Could not delete faculty account'
      });
    }
  };

  const facultyProjectCount = (facultyId) => projects.filter((project) =>
    project.facultyRecipients?.some((recipient) => (recipient?._id || recipient?.id || recipient) === facultyId)
  ).length;

  const handleCopyRepoLink = async (repoUrl) => {
    try {
      await navigator.clipboard.writeText(repoUrl);
      setMessage({ type: 'success', text: 'Repository link copied' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Could not copy repository link' });
    }
  };

  const openProjectDetails = (project) => {
    setSelectedProject(project);
    setAdminFeedback(project.analysis?.feedback || '');
    setDrawerOpen(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Reviewed': 'info',
      'Approved': 'success',
      'Rejected': 'error'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      field: 'title',
      headerName: 'PROJECT TITLE',
      flex: 1.5,
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, fontSize: '0.95rem' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'studentName',
      headerName: 'STUDENT',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row?.student?.name || '',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
          {params.value || 'Unknown'}
        </Typography>
      )
    },
    {
      field: 'studentRollNo',
      headerName: 'ROLL NO',
      width: 130,
      valueGetter: (params) => params.row?.student?.rollNo || '',
    },
    {
      field: 'repoUrl',
      headerName: 'REPOSITORY',
      flex: 1.5,
      minWidth: 250,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            underline="hover"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          >
            {params.value}
          </Link>
          <Tooltip title="Copy repository link">
            <IconButton size="small" sx={{ color: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) } }} onClick={(e) => { e.stopPropagation(); handleCopyRepoLink(params.value); }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    },
    {
      field: 'rating',
      headerName: 'AI RATING',
      width: 130,
      valueGetter: (params) => params.row?.analysis?.rating ?? 0,
      renderCell: (params) => {
        const rating = params.value ?? 0;
        const color = rating > 7 ? theme.palette.success.main : rating > 5 ? theme.palette.warning.main : theme.palette.error.main;
        return (
          <Box sx={{ width: '100%', pr: 2 }}>
            <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 0.5 }}>
              {rating}/10
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 6,
                backgroundColor: theme.palette.grey[200],
                borderRadius: 3,
                overflow: 'hidden'
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rating * 10}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  backgroundColor: color,
                  borderRadius: 3,
                }}
              />
            </Box>
          </Box>
        );
      }
    },
    {
      field: 'status',
      headerName: 'STATUS',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getStatusColor(params.value)}
          size="small"
          sx={{ fontWeight: 700, px: 1 }}
        />
      )
    },
    {
      field: 'actions',
      headerName: 'ACTIONS',
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="contained"
            onClick={(e) => { e.stopPropagation(); openProjectDetails(params.row); }}
            sx={{
              borderRadius: '20px',
              px: 3,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.75rem',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.35)',
              border: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.23)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Review
          </Button>
          <Tooltip title="Delete project">
            <IconButton
              size="small"
              sx={{
                color: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
              }}
              onClick={(e) => { e.stopPropagation(); handleDelete(params.row._id); }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.status === 'Pending').length,
    approved: projects.filter(p => p.status === 'Approved').length,
    avgRating: projects.length > 0
      ? (projects.reduce((sum, p) => sum + (p.analysis?.rating || 0), 0) / projects.length).toFixed(1)
      : 0
  };

  const statCards = [
    {
      label: 'TOTAL PROJECTS',
      value: stats.total,
      icon: <Insights />,
      color: theme.palette.primary.main,
    },
    {
      label: 'PENDING REVIEW',
      value: stats.pending,
      icon: <PendingActions />,
      color: theme.palette.warning.main,
    },
    {
      label: 'APPROVED',
      value: stats.approved,
      icon: <TaskAlt />,
      color: theme.palette.success.main,
    },

    ...(adminMode ? [
      {
        label: 'TOTAL STUDENTS',
        value: students.length,
        icon: <Group />,
        color: theme.palette.primary.main,
      },

    ] : [])
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 4, md: 5 } }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={sectionReveal}
      >
        <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Box sx={{ width: 8, height: 32, bgcolor: theme.palette.primary.main, borderRadius: 1 }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: theme.palette.text.primary,
                  letterSpacing: '-0.5px'
                }}
              >
                Project Command Center
              </Typography>
            </Stack>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: '1.1rem',
                maxWidth: '600px',
                ml: 3.5,
                fontWeight: 500
              }}
            >
              Monitor submissions, analyze code quality, and command your workspace with absolute clarity.
            </Typography>
          </Box>
          {adminMode && (
            <Button
              variant="contained"
              onClick={() => setFacultyDrawerOpen(true)}
              startIcon={<Group />}
              sx={{
                borderRadius: '50px', px: 3, py: 1.5, fontWeight: 800, textTransform: 'none', fontSize: '0.95rem',
                background: isDark ? alpha('#fff', 0.1) : '#09090b', color: '#fff',
                '&:hover': { background: isDark ? alpha('#fff', 0.2) : '#27272a', transform: 'translateY(-2px)' },
                boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease',
                alignSelf: 'center'
              }}
            >
              Total Faculties: {faculties.length}
            </Button>
          )}
        </Box>
      </motion.div>

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              severity={message.type}
              sx={{
                mb: 4,
                borderRadius: 1,
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
              action={
                <IconButton size="small" onClick={() => setMessage({ type: '', text: '' })} sx={{ color: 'inherit' }}>
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              {message.text}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ ...sectionReveal, delay: 0.1 }}
      >
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={card.label}>
              <EditorialCard
                label={card.label}
                headline={card.value}
                description={`Track and manage ${card.label.toLowerCase()} across all faculties.`}
                accent="bar"
                accentColor={card.color}
              />
            </Grid>
          ))}
        </Grid>
      </motion.div>



      {/* Faculty Management Section - Only visible in adminMode */}
      {adminMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ ...sectionReveal, delay: 0.15 }}
        >
          <Card
            sx={{
              mb: 4,
              bgcolor: cardSurface,
              border: `1px solid ${strongBorder}`,
              boxShadow: softShadow,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                    Faculty Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                    Delete a faculty account or transfer its assigned projects to a replacement.
                  </Typography>
                </Box>
                <Badge badgeContent={faculties.length} color="primary">
                  <Chip label="Active faculty" sx={{ fontWeight: 700 }} />
                </Badge>
              </Box>

              {facultiesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : faculties.length ? (
                <Stack spacing={2}>
                  {faculties.map((faculty) => {
                    const assignedCount = facultyProjectCount(faculty.id);
                    const replacementOptions = faculties.filter((option) => option.id !== faculty.id && option.id !== user?.id);

                    return (
                      <Paper key={faculty.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: strongBorder, bgcolor: sectionSurface }}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between">
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                              {faculty.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, wordBreak: 'break-word' }}>
                              {faculty.email}
                            </Typography>
                            <Chip size="small" label={`${assignedCount} assigned project${assignedCount === 1 ? '' : 's'}`} sx={{ mt: 1, fontWeight: 700 }} />
                          </Box>

                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ minWidth: { md: 420 } }}>
                            <FormControl size="small" fullWidth sx={{ minWidth: { sm: 220 } }}>
                              <Select
                                displayEmpty
                                value={facultyReplacementById[faculty.id] || ''}
                                onChange={(event) => {
                                  const value = event.target.value;
                                  setFacultyReplacementById((current) => ({
                                    ...current,
                                    [faculty.id]: value,
                                  }));
                                }}
                              >
                                <MenuItem value="">No replacement</MenuItem>
                                {replacementOptions.map((option) => (
                                  <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <Button
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDeleteFaculty(faculty.id)}
                              sx={{ whiteSpace: 'nowrap', minWidth: 160 }}
                            >
                              Delete faculty
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 1 }}>
                  No faculty accounts are available yet.
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Premium Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ ...sectionReveal, delay: 0.2 }}
      >
        <Card
          sx={{
            mb: 4,
            bgcolor: cardSurface,
            border: `1px solid ${strongBorder}`,
            boxShadow: softShadow,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: theme.palette.text.primary }}>
                Submissions Registry
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge badgeContent={filteredProjects.length} color="primary">
                  <Chip
                    icon={<FilterList />}
                    label="Projects Found"
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      fontWeight: 700,
                      borderColor: strongBorder,
                      bgcolor: mutedSurface,
                      color: theme.palette.text.primary,
                    }}
                  />
                </Badge>
                <IconButton
                  onClick={fetchProjects}
                  sx={{
                    color: theme.palette.text.primary,
                    border: `1px solid ${strongBorder}`,
                    bgcolor: mutedSurface,
                    borderRadius: 1,
                    '&:hover': { bgcolor: mutedSurface }
                  }}
                >
                  <Refresh />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                placeholder="Search by title, description, or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flex: 1, minWidth: 250,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: sectionSurface,
                    borderRadius: 1,
                    fontWeight: 500,
                  }
                }}
                InputProps={{
                  startAdornment: <Search sx={{ color: theme.palette.text.secondary, mr: 1.5 }} />,
                }}
              />

              <FormControl sx={{ minWidth: 200 }}>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  displayEmpty
                  sx={{
                    bgcolor: sectionSurface,
                    borderRadius: 1,
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}
                >
                  <MenuItem value="" sx={{ fontWeight: 600 }}>All Statuses</MenuItem>
                  <MenuItem value="Pending" sx={{ fontWeight: 600 }}>Pending</MenuItem>
                  <MenuItem value="Reviewed" sx={{ fontWeight: 600 }}>Reviewed</MenuItem>
                  <MenuItem value="Approved" sx={{ fontWeight: 600 }}>Approved</MenuItem>
                  <MenuItem value="Rejected" sx={{ fontWeight: 600 }}>Rejected</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    fetchProjects();
                  }}
                  displayEmpty
                  sx={{
                    bgcolor: sectionSurface,
                    borderRadius: 1,
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}
                  startAdornment={<Sort sx={{ mr: 1, color: theme.palette.text.secondary }} />}
                >
                  <MenuItem value="submittedAt" sx={{ fontWeight: 600 }}>Date Submitted</MenuItem>
                  <MenuItem value="rating" sx={{ fontWeight: 600 }}>Rating</MenuItem>
                  <MenuItem value="rollNo" sx={{ fontWeight: 600 }}>Roll Number</MenuItem>
                  <MenuItem value="studentName" sx={{ fontWeight: 600 }}>Student Name</MenuItem>
                  <MenuItem value="title" sx={{ fontWeight: 600 }}>Project Title</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                    fetchProjects();
                  }}
                  displayEmpty
                  sx={{
                    bgcolor: sectionSurface,
                    borderRadius: 1,
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}
                >
                  <MenuItem value="desc" sx={{ fontWeight: 600 }}>↓ Desc</MenuItem>
                  <MenuItem value="asc" sx={{ fontWeight: 600 }}>↑ Asc</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Premium Data Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...sectionReveal, delay: 0.3 }}
      >
        <Card
          sx={{
            bgcolor: cardSurface,
            border: `1px solid ${strongBorder}`,
            boxShadow: softShadow,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredProjects}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row._id}
              onRowClick={(params) => openProjectDetails(params.row)}
              sx={{
                border: 'none',
                bgcolor: cardSurface,
                color: theme.palette.text.primary,
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: mutedSurface,
                  borderBottom: `2px solid ${strongBorder}`,
                  color: theme.palette.text.primary,
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                },
                '& .MuiDataGrid-row': {
                  borderBottom: `1px solid ${strongBorder}`,
                  cursor: 'pointer',
                  transition: 'transform 300ms ease, background-color 300ms ease',
                  '&:hover': { transform: 'translateY(-2px)' }
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: 'none',
                  outline: 'none !important',
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: `1px solid ${strongBorder}`,
                  bgcolor: mutedSurface,
                },
                '& .MuiDataGrid-columnHeaderTitle, & .MuiDataGrid-cell, & .MuiTablePagination-root, & .MuiSelect-icon, & .MuiDataGrid-sortIcon, & .MuiDataGrid-menuIconButton': {
                  color: theme.palette.text.primary,
                }
              }}
            />
          </Box>
        </Card>
      </motion.div>

      {/* Sliding Details Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450, md: 550 },
            bgcolor: cardSurface,
            borderLeft: `1px solid ${strongBorder}`,
            boxShadow: isDark ? '-10px 0 40px rgba(0,0,0,0.4)' : '-10px 0 40px rgba(0,0,0,0.1)',
            p: 0
          }
        }}
      >
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              {/* Drawer Header */}
              <Box sx={{ p: 4, bgcolor: mutedSurface, borderBottom: `1px solid ${strongBorder}`, position: 'relative' }}>
                <IconButton
                  onClick={() => setDrawerOpen(false)}
                  sx={{ position: 'absolute', top: 24, right: 24, color: theme.palette.text.secondary, bgcolor: alpha(theme.palette.grey[100], 0.8), '&:hover': { bgcolor: theme.palette.grey[200] } }}
                >
                  <Close fontSize="small" />
                </IconButton>

                <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                  <Chip
                    label={selectedProject.status}
                    color={getStatusColor(selectedProject.status)}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: '0.65rem', height: 24, borderRadius: 1.5, letterSpacing: '0.5px' }}
                  />
                  {selectedProject.analysis?.contributors?.length > 1 && (
                    <Chip
                      icon={<Group sx={{ fontSize: '14px !important' }} />}
                      label="Group Project"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 800, fontSize: '0.65rem', height: 24, borderRadius: 1.5 }}
                    />
                  )}
                </Stack>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    mb: 1,
                    fontSize: '2rem',
                    letterSpacing: '-0.5px',
                    background: isDark ? `linear-gradient(90deg, #FFFFFF, ${theme.palette.primary.light})` : `linear-gradient(90deg, #000000, ${theme.palette.primary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}
                >
                  {selectedProject.title}
                </Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500, lineHeight: 1.6, maxWidth: '95%' }}>
                  {selectedProject.description}
                </Typography>
              </Box>

              {/* Quick Actions Bar */}
              <Box sx={{ p: 2, px: 4, display: 'flex', gap: 2, borderBottom: `1px solid ${strongBorder}`, bgcolor: cardSurface }}>
                <Button
                  fullWidth
                  variant="contained"
                  disableElevation
                  startIcon={<CheckCircle />}
                  onClick={() => handleStatusUpdate(selectedProject._id, 'Approved')}
                  sx={{ flex: 1, borderRadius: 2, borderWidth: 2, fontWeight: 700, transition: 'transform 300ms ease', '&:hover': { borderWidth: 2, transform: 'translateY(-2px)' } }}
                >
                  Approve Project
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Cancel />}
                  onClick={() => handleStatusUpdate(selectedProject._id, 'Rejected')}
                  sx={{ flex: 1, borderRadius: 2, borderWidth: 2, fontWeight: 700, transition: 'transform 300ms ease', '&:hover': { borderWidth: 2, transform: 'translateY(-2px)' } }}
                >
                  Reject
                </Button>
              </Box>

              {/* Drawer Body content */}
              <Box data-lenis-prevent="true" sx={{ p: 4, overflowY: 'auto', flex: 1, bgcolor: cardSurface }}>
                {/* Grid for robust info */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="overline" sx={{ color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: '1px' }}>STUDENT INFO</Typography>
                  <Paper sx={{ p: 3, mt: 1, bgcolor: sectionSurface, borderRadius: 3, border: `1px solid ${strongBorder}`, boxShadow: softShadow }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Name</Typography>
                        <Typography variant="body1" fontWeight={700} color="text.primary">{selectedProject.student?.name || 'Unknown'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Roll No</Typography>
                        <Typography variant="body1" fontWeight={700} color="text.primary">{selectedProject.student?.rollNo || 'N/A'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="overline" sx={{ color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: '1px' }}>AI ANALYSIS</Typography>
                  <Paper sx={{ p: 3, mt: 1, bgcolor: sectionSurface, borderRadius: 3, border: `1px solid ${strongBorder}`, boxShadow: softShadow }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h3" fontWeight={800} color={theme.palette.primary.main}>{selectedProject.analysis?.rating || 0}</Typography>
                      <Typography variant="subtitle1" color="text.secondary" fontWeight={700}>/ 10 Rating</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 600, mb: 1, fontStyle: 'italic' }}>
                      "{selectedProject.analysis?.feedback || 'No automated feedback available.'}"
                    </Typography>
                    <Divider sx={{ my: 1.5, opacity: 0.5 }} />
                    <Typography variant="overline" sx={{ color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: '1px', display: 'block', mb: 1 }}>CONTRIBUTORS</Typography>
                    {selectedProject.analysis?.contributors?.length ? (
                      <TableContainer sx={{ border: `1px solid ${strongBorder}`, borderRadius: 2, overflow: 'hidden' }}>
                        <Table size="small" sx={{ '& .MuiTableCell-root': { borderBottom: `1px solid ${strongBorder}`, py: 1.5 } }}>
                          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary }}>GitHub Username</TableCell>
                              <TableCell sx={{ fontWeight: 800, color: theme.palette.text.primary, textAlign: 'right' }}>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedProject.analysis.contributors.map((contributor, idx) => (
                              <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Avatar sx={{ width: 24, height: 24, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontSize: '0.7rem', fontWeight: 800 }}>
                                      {contributor.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <span>{contributor}</span>
                                  </Stack>
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>
                                  <Chip label="Verified" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontStyle: 'italic' }}>
                        No contributors detected.
                      </Typography>
                    )}
                  </Paper>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="overline" sx={{ color: theme.palette.text.secondary, fontWeight: 800, letterSpacing: '1px' }}>ADMIN FEEDBACK</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Leave feedback for the student..."
                    value={adminFeedback}
                    onChange={(e) => setAdminFeedback(e.target.value)}
                    sx={{
                      mt: 1,
                      '& .MuiOutlinedInput-root': {
                        bgcolor: sectionSurface,
                        borderRadius: 3,
                        fontWeight: 500
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2, borderRadius: 2, py: 1.5, fontWeight: 800, boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } }}
                    onClick={() => handleStatusUpdate(selectedProject._id, selectedProject.status)}
                  >
                    Save Feedback & Update Status
                  </Button>
                </Box>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 900, letterSpacing: '1.5px', mb: 1.5, display: 'block' }}>RESOURCE LINKS</Typography>
                    <Stack direction="row" spacing={2.5}>
                      <Button
                        component="a"
                        href={selectedProject.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        startIcon={<Launch />}
                        sx={{
                          borderRadius: '14px',
                          flex: 1.5,
                          py: 1.5,
                          fontWeight: 800,
                          textTransform: 'none',
                          letterSpacing: '0.5px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                          color: '#fff',
                          boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.25)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Repository
                      </Button>
                      <Tooltip title="Copy Link">
                        <IconButton
                          onClick={() => handleCopyRepoLink(selectedProject.repoUrl)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                            borderRadius: '14px',
                            p: 1.5,
                            color: theme.palette.primary.main,
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>

      {/* Faculty Directory Drawer */}
      <Drawer
        anchor="right"
        open={facultyDrawerOpen}
        onClose={() => setFacultyDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 450, md: 600 },
            bgcolor: cardSurface,
            borderLeft: `1px solid ${strongBorder}`,
            boxShadow: isDark ? '-10px 0 40px rgba(0,0,0,0.4)' : '-10px 0 40px rgba(0,0,0,0.1)',
            p: 0
          }
        }}
      >
        <Box sx={{ p: 4, bgcolor: mutedSurface, borderBottom: `1px solid ${strongBorder}`, position: 'relative' }}>
          <IconButton onClick={() => setFacultyDrawerOpen(false)} sx={{ position: 'absolute', top: 24, right: 24, color: theme.palette.text.secondary, bgcolor: alpha(theme.palette.grey[100], 0.8), '&:hover': { bgcolor: theme.palette.grey[200] } }}>
            <Close fontSize="small" />
          </IconButton>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, fontSize: '2rem', letterSpacing: '-0.5px', color: theme.palette.text.primary }}>
            Faculty Directory
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, fontWeight: 500, lineHeight: 1.6 }}>
            Manage {faculties.length} faculty members and their assigned students.
          </Typography>
        </Box>
        <Box data-lenis-prevent="true" sx={{ p: 4, overflowY: 'auto', flex: 1, bgcolor: cardSurface }}>
          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {faculties.map((faculty) => {
                const facultyProjects = projects.filter(p => p.facultyRecipients?.some(r => (r._id || r.id || r) === faculty.id));
                const assignedStudentIds = facultyProjects.map(p => p.student?._id || p.student?.id || p.student).filter(Boolean);
                const assignedStudents = students.filter(s => assignedStudentIds.includes(s.id || s._id));

                return (
                  <Card key={faculty.id} sx={{ bgcolor: sectionSurface, border: `1px solid ${strongBorder}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, fontWeight: 800, fontSize: '1.2rem' }}>
                          {faculty.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {faculty.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                            {faculty.email}
                          </Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2, borderColor: strongBorder }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                          Assigned Students
                        </Typography>
                        <Chip label={assignedStudents.length} size="small" sx={{ height: 22, fontSize: '0.75rem', fontWeight: 800, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />
                      </Box>
                      <Box data-lenis-prevent="true" sx={{ maxHeight: 240, overflowY: 'auto', pr: 0.5, display: 'flex', flexDirection: 'column', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: strongBorder, borderRadius: '4px' } }}>
                        {assignedStudents.length === 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, opacity: 0.6 }}>
                            <Group sx={{ fontSize: 32, color: theme.palette.text.secondary, mb: 1 }} />
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                              No students assigned
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {assignedStudents.map((student, index) => (
                              <Box key={student.id} sx={{ display: 'flex', alignItems: 'center', py: 1.5, borderBottom: index === assignedStudents.length - 1 ? 'none' : `1px dashed ${strongBorder}` }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, fontSize: '0.75rem', fontWeight: 800, mr: 1.5 }}>
                                  {index + 1}
                                </Avatar>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.text.primary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {student.name}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {student.email}
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', ml: 1 }}>
                                  <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary, mb: 0.25, fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Roll No
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {student.rollNo}
                                  </Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};

export default AdminDashboard;
