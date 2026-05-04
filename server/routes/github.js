const express = require('express');
const { analyzeRepo } = require('../controllers/analysisController');
const { authMiddleware } = require('../middleware/auth');

const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // 1 hour cache

const router = express.Router();

// Analyze GitHub repository
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { repoUrl } = req.body;
    
    if (!repoUrl) {
      return res.status(400).json({ message: 'Repository URL is required' });
    }

    const cachedAnalysis = myCache.get(repoUrl);
    if (cachedAnalysis) {
      return res.json(cachedAnalysis);
    }

    const analysis = await analyzeRepo(repoUrl);
    myCache.set(repoUrl, analysis);
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
