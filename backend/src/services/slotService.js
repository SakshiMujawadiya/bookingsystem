const { pool } = require('../db');
const config = require('../config');

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const WORK_START_MIN = timeToMinutes(config.workingHours.start);
const WORK_END_MIN = timeToMinutes(config.workingHours.end);

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Find the first open time slot that fits the requested duration
async function findNextAvailable(roomId, date, durationMinutes) {
  const { rows: bookings } = await pool.query(
    `SELECT start_time, end_time FROM bookings
     WHERE room_id = $1 AND date = $2
     ORDER BY start_time`,
    [roomId, date]
  );

  const slots = bookings.map((b) => ({
    start: timeToMinutes(b.start_time.slice(0, 5)),
    end: timeToMinutes(b.end_time.slice(0, 5)),
  }));

  let cursor = WORK_START_MIN;

  for (const slot of slots) {
    const gap = slot.start - cursor;
    if (gap >= durationMinutes) {
      return minutesToTime(cursor);
    }
    cursor = Math.max(cursor, slot.end);
  }

  // Check remaining time until end of workday
  if (WORK_END_MIN - cursor >= durationMinutes) {
    return minutesToTime(cursor);
  }

  return null;
}

module.exports = { findNextAvailable };
