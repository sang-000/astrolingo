const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  content: String,        // NEW: full article text for simplification
  link: { type: String, required: true, unique: true },
  publishedAt: { type: Date, required: true },
  simplifiedContent: {
    child: String,
    student: String,
    research: String,
  },
  source: String,       // allows filtering by 'NASA-News' or other sources
  imageUrl: String,     // store article image
  mediaType: String,    // article, video, etc.
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);
