const mongoose = require('mongoose');
let Schema=mongoose.Schema
const AnalysisSchema = new Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Store analysis results
  results: {
    violations: [{
      id: String,
      impact: String, // critical, serious, moderate, minor
      description: String,
      help: String,
      nodes: [{
        html: String,
        target: [String],
        failureSummary: String
      }]
    }],
    passes: [{
      id: String,
      description: String,
      help: String,
      nodes: [{
        html: String,
        target: [String]
      }]
    }],
    incomplete: [{
      id: String,
      impact: String,
      description: String,
      help: String,
      nodes: [{
        html: String,
        target: [String],
        failureSummary: String
      }]
    }]
  },
  // Statistics
  stats: {
    violationCount: Number,
    passCount: Number,
    incompleteCount: Number,
    criticalIssues: Number,
    seriousIssues: Number,
    moderateIssues: Number,
    minorIssues: Number
  },
  // Share token for public access
  shareToken: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', AnalysisSchema);