const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects', require('./routes/tasks'));

// Health Check Route
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    ts: new Date(),
  });
});

// Root Route
app.get('/', (_, res) => {
  res.send('API is running...');
});

// 404 Handler
app.use((_, res) => {
  res.status(404).json({
    message: 'Not found',
  });
});

// Error Handler
app.use(require('./middleware/errorHandler'));

module.exports = app;