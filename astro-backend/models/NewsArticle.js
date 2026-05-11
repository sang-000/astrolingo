// models/NewsArticle.js
// Enhanced MongoDB schema for space news articles with AI simplification

const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    trim: true,
    default: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=600&fit=crop'
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  description: {
    type: String,
    maxlength: 1000
  },
  source: {
    type: String,
    required: true,
    enum: ['NASA', 'Spaceflight News', 'Universe Today', 'ESA', 'Space Daily', 'Other'],
    index: true
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  
  // AI Simplified Content Fields
  childContent: {
    type: String,
    maxlength: 1000,
    default: null
  },
  studentContent: {
    type: String,
    maxlength: 2000,
    default: null
  },
  researcherContent: {
    type: String,
    maxlength: 5000,
    default: null
  },
  
  // Simplification Metadata
  simplificationStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  simplificationProvider: {
    type: String,
    enum: ['huggingface', 'gemini', 'fallback'],
    default: null
  },
  simplificationError: {
    type: String,
    default: null
  },
  
  // Metadata
  category: {
    type: String,
    default: 'Space News'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'newsarticles'
});

// Indexes for performance
newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ source: 1, publishedAt: -1 });
newsArticleSchema.index({ isActive: 1, publishedAt: -1 });
newsArticleSchema.index({ simplificationStatus: 1 });

// Pre-save middleware to update lastUpdated
newsArticleSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to find articles needing simplification
newsArticleSchema.statics.findPendingSimplification = function() {
  return this.find({
    simplificationStatus: { $in: ['pending', 'failed'] },
    isActive: true
  }).limit(10);
};

// Static method to check if article exists
newsArticleSchema.statics.articleExists = async function(url, title) {
  const existing = await this.findOne({
    $or: [
      { url: url },
      { title: { $regex: new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
    ]
  });
  return !!existing;
};

// Instance method to get simplified content by level
newsArticleSchema.methods.getSimplifiedContent = function(level) {
  switch (level) {
    case 'child':
      return this.childContent || this.description || this.content.substring(0, 200) + '...';
    case 'student':
      return this.studentContent || this.description || this.content.substring(0, 400) + '...';
    case 'researcher':
      return this.researcherContent || this.content;
    default:
      return this.content;
  }
};

// Virtual for article age
newsArticleSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.publishedAt.getTime()) / (1000 * 60 * 60));
});

// Virtual for simplified content availability
newsArticleSchema.virtual('hasSimplification').get(function() {
  return !!(this.childContent && this.studentContent && this.researcherContent);
});

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
