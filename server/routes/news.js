const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

let cache = {};
const CACHE_TTL = 5 * 60 * 1000;

router.get("/", async (req, res) => {
  try {
    const { topic, country, category, to } = req.query;
    const hasSearch = topic && topic.trim();

    let url;
    const params = new URLSearchParams();
    params.append("token", process.env.GNEWS_API_KEY);
    params.append("lang", "en");
    params.append("max", "10");

    if (hasSearch) {
      params.append("q", topic.trim());
      if (to) params.append("to", new Date(to).toISOString());
      url = `https://gnews.io/api/v4/search?${params.toString()}`;
    } else {
      if (topic) params.append("q", topic.trim());
      params.append("topic", category || "general");
      if (to) params.append("to", new Date(to).toISOString());
      url = `https://gnews.io/api/v4/top-headlines?${params.toString()}`;
    }

    const cacheKey = url;
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].time < CACHE_TTL) {
      console.log("Serving from cache:", cacheKey);
      return res.json({ articles: cache[cacheKey].data });
    }

    console.log("Fetching:", url);
    const response = await axios.get(url, { timeout: 10000 });
    const articles = response.data.articles || [];

    cache[cacheKey] = { data: articles, time: now };
    return res.json({ articles });

  } catch (error) {
    console.error("GNews error status:", error.response?.status);
    console.error("GNews error body:", JSON.stringify(error.response?.data));

    if (error.response?.status === 429) {
      const staleKey = Object.keys(cache)[0];
      if (staleKey) {
        console.log("Rate limited — serving stale cache");
        return res.json({ articles: cache[staleKey].data });
      }
      return res.status(429).json({
        error: "Too many requests. Please wait a minute and try again."
      });
    }

    return res.status(500).json({
      error: "Failed to fetch news",
      detail: error.response?.data || error.message
    });
  }
});

module.exports = router;