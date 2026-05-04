const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Project = require('../models/Project');
const NodeCache = require('node-cache');

const router = express.Router();
const dashboardCache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // Cache dashboard data for 10 minutes

router.get('/dashboard-data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cacheKey = `dashboard_${userId}`;
    
    // Check Cache
    const cachedData = dashboardCache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const projects = await Project.find({ student: userId }).sort({ submittedAt: -1 });
    
    const dashboardStats = {
      total: projects.length,
      approved: projects.filter(p => p.status === 'Approved').length,
      pending: projects.filter(p => p.status === 'Pending').length,
      avgRating: projects.length 
        ? (projects.reduce((sum, p) => sum + (p.analysis?.rating || 0), 0) / projects.length).toFixed(1)
        : '0.0',
      projects: projects // Including the latest projects for lazy loading timeline
    };
    
    dashboardCache.set(cacheKey, dashboardStats);
    res.json(dashboardStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/collaboration-metrics', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user.userId });
    
    let totalContributors = 0;
    let totalCommits = 0;
    const allContributors = new Set();
    
    projects.forEach(p => {
      const contribs = p.analysis?.contributors || [];
      totalContributors += contribs.length;
      totalCommits += (p.analysis?.commits || 0);
      contribs.forEach(c => allContributors.add(c));
    });

    res.json({
      totalRepos: projects.length,
      totalContributors,
      totalCommits,
      uniqueContributors: allContributors.size,
      teamCollaborationScale: allContributors.size > 10 ? 'High' : (allContributors.size > 3 ? 'Medium' : 'Low'),
      globalSyncTime: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching metrics' });
  }
});

module.exports = router;
