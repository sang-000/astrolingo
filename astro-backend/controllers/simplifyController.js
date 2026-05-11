// controllers/simplifyController.js
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const Article = require('../models/Article');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🌸 Gemini API helper
async function callGemini(prompt) {
    if (!process.env.GEMINI_API_KEY) throw new Error('Gemini API key missing (GEMINI_API_KEY).');

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.7,
        }
    });

    if (response && response.text) {
        return response.text.trim();
    }

    throw new Error('Gemini API returned no valid response');
}

// 🧠 Prompt builder
function buildPrompt(level, sourceText) {
    if (level === 'child') {
        return `Rewrite the following space news article for an 8-year-old child. Use very simple words, short sentences, and make it exciting and fun to read. Avoid technical jargon. Focus on the amazing discoveries and adventures in space. Keep it under 150 words. Article text:\n\n${sourceText}`;
    }
    if (level === 'student') {
        return `Summarize and simplify the following space news article for a high school student. Use clear language, explain scientific concepts simply, and maintain educational value. Keep it informative but accessible. Include key facts and discoveries. Keep it under 300 words. Article text:\n\n${sourceText}`;
    }
    // research
    return `Provide a clear, detailed summary of the following space news article for researchers and professionals. Maintain all technical details, scientific accuracy, and professional terminology. Include all data, measurements, and technical specifications mentioned. Article text:\n\n${sourceText}`;
}

// 🌠 Main simplify controller
exports.simplifyArticle = async (req, res) => {
    try {
        const id = req.params.id;
        const { level = 'student', force = false } = req.body || {};

        if (!['child', 'student', 'research'].includes(level)) {
            return res.status(400).json({ success: false, message: 'Invalid level' });
        }

        const article = await Article.findById(id);
        if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

        article.simplifiedContent = article.simplifiedContent || {};

        // ⚡ Return cached result if available
        if (!force && article.simplifiedContent[level]) {
            return res.json({ success: true, source: 'cache', simplified: article.simplifiedContent[level] });
        }

        // 🌿 Prepare text
        const sourceText = (article.content || article.description || article.title || '').trim();
        if (!sourceText) return res.status(400).json({ success: false, message: 'No source text to simplify.' });

        const MAX_INPUT_CHARS = 4000;
        const inputForModel = sourceText.length > MAX_INPUT_CHARS
            ? sourceText.slice(0, MAX_INPUT_CHARS) + '...'
            : sourceText;

        const prompt = buildPrompt(level, inputForModel);

        console.log('🧠 Calling Gemini API...');
        const simplified = await callGemini(prompt);
        console.log('✅ Simplified text received.');

        // 📝 Save simplified version
        article.simplifiedContent[level] = simplified;
        article.simplifiedAt = article.simplifiedAt || {};
        article.simplifiedAt[level] = new Date();
        await article.save();

        return res.json({ success: true, source: 'api', simplified });
    } catch (err) {
        console.error('❌ simplifyArticle error:', err?.message || err);
        return res.status(500).json({ success: false, message: err?.message || 'Server error' });
    }
};

