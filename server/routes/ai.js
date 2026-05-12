const express = require('express');
require('dotenv').config();
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/summarize', async (req, res) => {
  const { content, description } = req.body;

  const fullArticle = `${description || ''}\n\n${content || ''}`.trim();

  if (!fullArticle || fullArticle.length < 50) {
    return res.status(400).json({ error: 'Content too short to summarize' });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `You are a news summarizer. Given the following news article, provide:
1. A detailed summary of atleast 100 words
2. Exactly 3 key bullet points
3. Sentiment analysis (only one word: Positive, Negative, or Neutral)

Respond ONLY in this exact JSON format, no extra text, no markdown:
{
  "summary": "your summary here",
  "bulletPoints": ["point 1", "point 2", "point 3"],
  "sentiment": "Positive"
}

Article:
${fullArticle.slice(0, 2000)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const text = chatCompletion.choices[0]?.message?.content?.trim();
    console.log('Groq raw response:', text);

    // Clean markdown fences if present
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return res.json({
      summary: parsed.summary,
      bulletPoints: parsed.bulletPoints.map(b => `• ${b}`).join('\n'),
      sentiment: parsed.sentiment
    });

  } catch (err) {
    console.error('Groq error:', err.message);
    return res.status(500).json({
      error: 'Summarization failed: ' + err.message
    });
  }
});

module.exports = router;