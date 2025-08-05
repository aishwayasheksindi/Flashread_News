const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

const categoryMap = {
  business: 'business',
  entertainment: 'entertainment',
  health: 'health',
  science: 'science',
  sports: 'sports',
  technology: 'technology',
  politics: 'politics',
  education: 'education',
};

router.get('/', async (req, res) => {
  try {
    const { country, topic, category, from, to } = req.query;

    let query = topic?.trim() || '';
    if (!query && category && categoryMap[category.toLowerCase()]) {
      query = categoryMap[category.toLowerCase()];
    }
    if (!query) query = 'news';

    const params = {
      q: query,
      token: GNEWS_API_KEY,
      lang: 'en',
      max: 20,
      sortby: 'publishedAt',
    };

    if (country) {
      params.country = country;
    }

    if (from) {
      const fromDate = new Date(from);
      if (!isNaN(fromDate)) {
        fromDate.setHours(0, 0, 0, 0);
        params.from = fromDate.toISOString();
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (!isNaN(toDate)) {
        toDate.setHours(23, 59, 59, 999);
        params.to = toDate.toISOString();
      }
    }

    const response = await axios.get('https://gnews.io/api/v4/search', { params });
    res.json(response.data);
  } catch (error) {
    console.error('Failed to fetch news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
