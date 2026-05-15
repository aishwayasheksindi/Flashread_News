const express = require('express');
const cors = require('cors');
require('dotenv').config();

const newsRoutes = require('../routes/news');
const aiRoutes = require('../routes/ai');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('FlashRead backend is running successfully!');
});

// ❌ REMOVE app.listen()

// ✅ EXPORT app for Vercel
module.exports = app;
