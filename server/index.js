const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const newsRoutes = require('./routes/news');
const aiRoutes = require('./routes/ai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.use('/news', newsRoutes);
app.use('/ai', aiRoutes);

// Root route to confirm server is running
app.get('/', (req, res) => {
  res.send('FlashRead backend is running!');
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).send('Route not found');
});

app.listen(PORT, () => {
  console.log(`FlashRead backend is running on http://localhost:${PORT}`);
});
