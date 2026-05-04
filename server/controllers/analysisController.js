const axios = require('axios');

const extractOwnerAndRepo = (repoUrl) => {
  const githubUrlPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/\s]+?)(?:\.git|\/)?$/i;
  const match = repoUrl.trim().match(githubUrlPattern);

  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }

  return {
    owner: match[1],
    repo: match[2]
  };
};

const analyzeRepo = async (repoUrl) => {
  try {
    const { owner, repo } = extractOwnerAndRepo(repoUrl);
    const apiBase = 'https://api.github.com';

    // Set up headers with GitHub token if available
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch repository data
    const repoResponse = await axios.get(`${apiBase}/repos/${owner}/${repo}`, { headers });
    const repoData = repoResponse.data;

    // Fetch commits data
    const commitsResponse = await axios.get(`${apiBase}/repos/${owner}/${repo}/commits`, { 
      headers,
      params: { per_page: 100 } // Get up to 100 recent commits
    });
    const commits = commitsResponse.data;

    // Fetch contributors data
    let contributors = [];
    try {
      const contributorsResponse = await axios.get(`${apiBase}/repos/${owner}/${repo}/contributors`, { 
        headers,
        params: { per_page: 10 } // Get top 10 contributors
      });
      contributors = contributorsResponse.data.map(contrib => contrib.login);
    } catch (error) {
      console.warn('Could not fetch contributors:', error.message);
      contributors = [repoData.owner.login];
    }

    // Spam prevention
    if (repoData.size < 10) { // < 10KB typically means empty/trivial
      return {
        commits: commits.length,
        contributors: contributors,
        rating: 1, // Minimum rating for spam
        feedback: 'Repository is flagged as potentially empty or trivial (spam prevention). Please add more substantive content.',
        hasWiki: false,
        hasIssues: false,
        lastCommitDate: commits[0] ? new Date(commits[0].commit.author.date) : null,
        stars: 0,
        forks: 0,
        language: null,
        description: null
      };
    }

    // AI Analysis Logic
    const commitCount = commits.length;
    let base_rating = 5.5; // Baseline reward for valid active projects
    let feedback = [];

    // AI Tool Detection
    const aiKeywords = ['ai', 'gpt', 'openai', 'llm', 'machine learning', 'bot', 'assistant', 'gemini', 'claude', 'copilot', 'deepseek'];
    const searchString = `${repoData.name} ${repoData.description || ''}`.toLowerCase();
    const isAIProject = aiKeywords.some(kw => searchString.includes(kw));

    if (isAIProject) {
      base_rating += 0.8;
      feedback.push('Advanced AI-assisted development recognized');
    }

    // Unique Contributors
    const unique_contributors = new Set(contributors).size;

    // Contribution Boost based on commit count
    const commitBoost = Math.min(2.0, Math.log10(commitCount + 1) * 0.7);

    // Diversity Score (Proxy: presence of multiple external contributors & languages)
    const diversity_score = Math.min(10, unique_contributors * 2 + (repoData.language ? 3 : 0));

    // Avg Feedback Score (Proxy: stars + forks + issues presence)
    const avg_feedback = Math.min(10, repoData.stargazers_count + (repoData.forks_count * 2) + (repoData.has_issues ? 2 : 0) + (repoData.has_wiki ? 2 : 0));

    // Mathematical Collaboration Scoring
    const logContribs = Math.max(0, Math.log10(unique_contributors)); 
    const score_boost = Math.min(3.5, (logContribs * 1.0) + (avg_feedback * 0.4) + (diversity_score * 0.2) + commitBoost);

    let rating = base_rating + score_boost;

    // Check for recent activity and Time-Decay Factor
    const lastCommit = commits[0];
    const daysSinceLastCommit = lastCommit ? 
      Math.floor((Date.now() - new Date(lastCommit.commit.author.date)) / (1000 * 60 * 60 * 24)) : 
      Infinity;

    if (daysSinceLastCommit > 30) {
      const decay = Math.min(4, Math.floor(daysSinceLastCommit / 30) * 0.5);
      rating -= decay;
      feedback.push(`Score adjusted by -${decay.toFixed(1)} due to inactivity`);
    } else if (daysSinceLastCommit < 7) {
      rating += 0.5;
      feedback.push('High recent activity bonus applied');
    }

    if (unique_contributors >= 4) {
      feedback.push('Excellent team collaboration (4+ contributors)');
    } else if (commitCount > 20) {
      feedback.push('Substantial project contributions detected');
    } else {
      feedback.push('Standard collaboration metrics');
    }

    // Cap rating between 1 and 10
    rating = Math.max(1, Math.min(10, rating));
    rating = Math.round(rating * 10) / 10; // 1 decimal place

    // Generate final feedback
    if (feedback.length === 0) {
      feedback.push('Basic repository structure');
    }

    const finalFeedback = feedback.join('. ') + '.';

    return {
      commits: commitCount,
      contributors: contributors,
      rating: rating,
      feedback: finalFeedback,
      hasWiki: repoData.has_wiki,
      hasIssues: repoData.has_issues,
      lastCommitDate: lastCommit ? new Date(lastCommit.commit.author.date) : null,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      language: repoData.language,
      description: repoData.description
    };

  } catch (error) {
    console.error('Error analyzing repository:', error.message);
    
    // Return default analysis if API fails
    return {
      commits: 0,
      contributors: [],
      rating: 5,
      feedback: 'Could not analyze repository. Please check if the repository is public and the URL is correct.',
      hasWiki: false,
      hasIssues: false,
      lastCommitDate: null,
      stars: 0,
      forks: 0,
      language: null,
      description: null,
      error: error.message
    };
  }
};

module.exports = { analyzeRepo };
