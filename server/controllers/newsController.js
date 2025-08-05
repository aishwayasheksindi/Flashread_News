const axios = require('axios');

let cachedData = null;
let lastFetched = 0;

const getTopHeadlines = async (req, res) => {
  const now = Date.now();
  const cacheDuration = 5 * 60 * 1000;

  if (cachedData && now - lastFetched < cacheDuration) {
    console.log('✅ Serving cached data');
    return res.json(cachedData);
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        category: 'general',
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    cachedData = response.data;
    lastFetched = now;

    console.log('🆕 Fetched fresh news');
    res.json(response.data);
  } catch (error) {
    console.error('❌ Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

module.exports = { getTopHeadlines };
