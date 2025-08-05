const express = require('express');
const axios = require('axios');
require('dotenv').config();
const router = express.Router();
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

router.post('/summarize', async (req, res) => {
  const { content, description } = req.body;
  const fullArticle = `${description || ''}\n\n${content || ''}`;
  if (!fullArticle || fullArticle.length < 50) {
    return res.status(400).json({ error: 'Content too short to summarize' });
  }
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6',
      { inputs: `Summarize this news article in under 100 words:\n\n${fullArticle}` },
      { headers: { Authorization: `Bearer ${HF_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    const summaryText = response.data[0]?.summary_text || 'No summary available.';
    const bullets = summaryText.split('. ').slice(0, 3).map(pt => `• ${pt.trim()}`).join('\n');
    const lc = fullArticle.toLowerCase();
    const sentiment = lc.includes('good') ? 'Positive' :
                      lc.includes('bad') || lc.includes('fail') ? 'Negative' :
                      'Neutral';
    res.json({ summary: summaryText, bulletPoints: bullets, sentiment });
  } catch (err) {
    console.error('Hugging Face error:', err.message);
    res.status(500).json({ error: 'Failed to summarize article' });
  }
});

module.exports = router;
