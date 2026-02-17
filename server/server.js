require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const leadRoutes = require('./routes/leadRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static PDF serving
app.use('/api/pdf', express.static(path.join(__dirname, 'pdfs')));

// Routes
app.use('/api', leadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    storage: 'in-memory',
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`InteriorAI Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
