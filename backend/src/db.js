const { Pool } = require('pg');
const config = require('./config');

const isRemoteDb = config.databaseUrl && !config.databaseUrl.includes('localhost') && !config.databaseUrl.includes('127.0.0.1');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: (config.nodeEnv === 'production' || isRemoteDb) ? { rejectUnauthorized: false } : false,
  max: 5,
  connectionTimeoutMillis: 8000,
  idleTimeoutMillis: 10000,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE,
      capacity INTEGER NOT NULL,
      floor VARCHAR(50) NOT NULL,
      amenities TEXT DEFAULT ''
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      booked_by VARCHAR(100) NOT NULL,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Index for date-based room lookups
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_bookings_room_date
    ON bookings(room_id, date);
  `);

  console.log('Database tables ready');
}

module.exports = { pool, initDb };
