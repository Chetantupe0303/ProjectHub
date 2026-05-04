const express = require('express');
const Project = require('../models/Project');
const { analyzeRepo } = require('../controllers/analysisController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

const normalizeGitHubUrl = (value = '') => {
  const trimmedValue = value.trim();
  const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/\s]+?)(?:\.git|\/)?$/i;
  const match = trimmedValue.match(githubUrlPattern);

  if (!match) {
    return null;
  }

  const [, owner, repo] = match;
  return `https://github.com/${owner}/${repo}`;
};

// Get all projects (admin/headadmin)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, search, sortBy, sortOrder } = req.query;
    let query = {};
    
    // Headadmin sees all projects, admin sees only assigned
    if (req.user.role !== 'headadmin') {
      query.facultyRecipients = req.user.userId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { repoUrl: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    if (sortBy === 'rating') {
      sortOptions['analysis.rating'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rollNo') {
      sortOptions['student.rollNo'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'studentName') {
      sortOptions['student.name'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy) {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.submittedAt = -1;
    }
    
    const projects = await Project.find(query)
      .populate('student', 'rollNo name email')
      .populate('facultyRecipients', 'name email')
      .populate('reviewedBy', 'name')
      .sort(sortOptions);
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's projects
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user.userId })
      .populate('facultyRecipients', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit new project
router.post('/', authMiddleware, async (req, res) => {
  try {
    const normalizedRepoUrl = normalizeGitHubUrl(req.body.repoUrl);
    const title = req.body.title?.trim();
    const description = req.body.description?.trim();
    const facultyRecipients = Array.isArray(req.body.facultyRecipients)
      ? req.body.facultyRecipients.map((facultyId) => String(facultyId).trim()).filter(Boolean)
      : [];

    if (!title || !description || !facultyRecipients.length || !normalizedRepoUrl) {
      return res.status(400).json({ message: 'Title, description, faculty selection, and a valid GitHub repository URL are required' });
    }

    if (!normalizedRepoUrl) {
      return res.status(400).json({ message: 'Invalid GitHub repository URL' });
    }
    
    // Check if student already submitted this repo
    const existingProject = await Project.findOne({ 
      student: req.user.userId, 
      repoUrl: normalizedRepoUrl
    });
    
    if (existingProject) {
      return res.status(400).json({ 
        message: 'You have already submitted a project for this repository' 
      });
    }
    
    // Analyze repository
    const analysis = await analyzeRepo(normalizedRepoUrl);
    
    // Create project
    const project = new Project({
      student: req.user.userId,
      title,
      description,
      facultyRecipients,
      repoUrl: normalizedRepoUrl,
      analysis
    });
    
    await project.save();

    const savedProject = await Project.findById(project._id)
      .populate('facultyRecipients', 'name email')
      .populate('student', 'rollNo name email');
    
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update project status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, adminFeedback } = req.body;

    const validStatuses = ['Pending', 'Reviewed', 'Approved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.status = status;
    project.reviewedAt = new Date();
    project.reviewedBy = req.user.userId;

    if (typeof adminFeedback === 'string') {
      project.analysis.feedback = adminFeedback.trim() || project.analysis.feedback;
    }

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('student', 'rollNo name email')
      .populate('reviewedBy', 'name');
    
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('student', 'rollNo name email')
      .populate('reviewedBy', 'name');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Check if user is admin or the project owner
    if (req.user.role !== 'admin' && project.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
