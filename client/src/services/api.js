import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  getFaculties: () => api.get('/auth/faculties'),
  getStudents: () => api.get('/auth/students'),
  getAllUsers: () => api.get('/auth/all-users'),
  deleteFaculty: (facultyId, replacementFacultyId = '') => api.delete(`/auth/faculties/${facultyId}`, {
    data: { replacementFacultyId },
  }),
};

export const projectAPI = {
  getMyProjects: () => api.get('/projects/my'),
  getAllProjects: (params) => api.get('/projects', { params }),
  submitProject: (projectData) => api.post('/projects', projectData),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProjectStatus: (id, status, feedback) => 
    api.patch(`/projects/${id}/status`, { status, adminFeedback: feedback }),
  deleteProject: (id) => api.delete(`/projects/${id}`),
};

export const githubAPI = {
  analyzeRepo: (repoUrl) => api.post('/github/analyze', { repoUrl }),
};

export const dashboardAPI = {
  getDashboardData: () => api.get('/dashboard/dashboard-data'),
  getCollaborationMetrics: () => api.get('/dashboard/collaboration-metrics'),
};

export default api;
