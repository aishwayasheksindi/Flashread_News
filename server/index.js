const express = require('express');
const cors = require('cors');
require('dotenv').config();

const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);

// Root route to test server
app.get('/', (req, res) => {
  res.send('FlashRead backend is running successfully!');
});

// ✅ Always use Railway’s assigned PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`FlashRead backend is running on port ${PORT}`);
});
