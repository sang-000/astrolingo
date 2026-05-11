// models/APOD.js
// MongoDB schema for NASA Astronomy Picture of the Day

const mongoose = require('mongoose');

const apodSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  explanation: {
    type: String,
    required: true,
    maxlength: 5000
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  hdurl: {
    type: String,
    trim: true
  },
  media_type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  copyright: {
    type: String,
    trim: true
  },
  
  // AI-generated content
  shortDescription: {
    type: String,
    maxlength: 200,
    default: null
  },
  creativeCaption: {
    type: String,
    maxlength: 150,
    default: null
  },
  
  // Processing metadata
  aiProcessed: {
    type: Boolean,
    default: false
  },
  aiProvider: {
    type: String,
    enum: ['gemini', 'fallback'],
    default: null
  },
  aiError: {
    type: String,
    default: null
  },
  
  // System metadata
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
  collection: 'apod'
});

// Indexes for performance
apodSchema.index({ date: -1 });
apodSchema.index({ isActive: 1, date: -1 });
apodSchema.index({ aiProcessed: 1 });

// Pre-save middleware
apodSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to get recent APOD entries
apodSchema.statics.getRecent = function(limit = 15) {
  return this.find({ isActive: true })
    .sort({ date: -1 })
    .limit(limit);
};

// Static method to get today's APOD
apodSchema.statics.getToday = function() {
  const today = new Date().toISOString().split('T')[0];
  return this.findOne({ date: today, isActive: true });
};

// Static method to check if APOD exists for date
apodSchema.statics.existsForDate = function(date) {
  return this.findOne({ date: date });
};

// Static method to find entries needing AI processing
apodSchema.statics.findPendingAI = function() {
  return this.find({
    aiProcessed: false,
    isActive: true
  }).limit(10);
};

// Instance method to generate short description from explanation
apodSchema.methods.generateShortDescription = function() {
  if (!this.explanation) return 'Amazing cosmic view captured by space telescopes.';
  
  // Extract first sentence or first 150 characters
  const firstSentence = this.explanation.split('.')[0];
  if (firstSentence.length <= 150) {
    return firstSentence + '.';
  }
  
  return this.explanation.substring(0, 147) + '...';
};

// Instance method to get display description
apodSchema.methods.getDisplayDescription = function() {
  return this.shortDescription || this.generateShortDescription();
};

// Instance method to get display caption
apodSchema.methods.getDisplayCaption = function() {
  return this.creativeCaption || this.title;
};

// Virtual for age in days
apodSchema.virtual('ageInDays').get(function() {
  const today = new Date();
  const apodDate = new Date(this.date);
  const diffTime = Math.abs(today - apodDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted date
apodSchema.virtual('formattedDate').get(function() {
  return new Date(this.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

module.exports = mongoose.model('APOD', apodSchema);
