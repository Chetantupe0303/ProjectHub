const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  facultyRecipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  repoUrl: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+/.test(v);
      },
      message: 'Invalid GitHub repository URL'
    }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Reviewed', 'Approved', 'Rejected'],
    default: 'Pending' 
  },
  analysis: {
    commits: { type: Number, default: 0 },
    contributors: [{ type: String }],
    rating: { type: Number, min: 1, max: 10, default: 5 },
    feedback: { type: String, default: '' },
    hasWiki: { type: Boolean, default: false },
    hasIssues: { type: Boolean, default: false },
    lastCommitDate: { type: Date }
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  },
  reviewedAt: { 
    type: Date 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
