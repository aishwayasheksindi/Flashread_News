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

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`FlashRead backend is running on port ${PORT}`);
});
