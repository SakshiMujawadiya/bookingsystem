require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 8000,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigin: process.env.CORS_ORIGIN
    ? (process.env.CORS_ORIGIN.includes(',')
        ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
        : process.env.CORS_ORIGIN)
    : '*',
  nodeEnv: process.env.NODE_ENV || 'development',

  workingHours: {
    start: '09:00',
    end: '18:00',
  },
};

module.exports = config;
