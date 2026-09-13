const express = require('express');
const cors = require('cors');
const config = require('./config');
const { initDb } = require('./db');
const seed = require('./seed');
const errorHandler = require('./middleware/errorHandler');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const docsRoutes = require('./routes/docs');

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Routes
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use(docsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use(errorHandler);

// Start server
async function start() {
  try {
    await initDb();
    await seed();

    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message || err);
    process.exit(1);
  }
}

start();
