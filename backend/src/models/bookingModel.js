const { pool } = require('../db');

const BookingModel = {
  // Check if room has an overlapping reservation for the requested time
  async findConflict(roomId, date, startTime, endTime, excludeBookingId = null) {
    let query = `
      SELECT id, title, booked_by, date, start_time, end_time
      FROM bookings
      WHERE room_id = $1
        AND date = $2
        AND start_time < $3::time
        AND end_time > $4::time
    `;
    const params = [roomId, date, endTime, startTime];

    if (excludeBookingId) {
      query += ' AND id != $5';
      params.push(excludeBookingId);
    }

    query += ' ORDER BY start_time LIMIT 1';

    const { rows } = await pool.query(query, params);
    return rows[0] || null;
  },

  async create({ room_id, title, booked_by, date, start_time, end_time }) {
    const query = `
      INSERT INTO bookings (room_id, title, booked_by, date, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [
      room_id,
      title,
      booked_by,
      date,
      start_time,
      end_time,
    ]);
    return rows[0];
  },

  async findAll({ roomId, date } = {}) {
    let query = `
      SELECT b.*, r.name as room_name
      FROM bookings b
      JOIN rooms r ON r.id = b.room_id
      WHERE 1=1
    `;
    const params = [];

    if (roomId) {
      params.push(roomId);
      query += ` AND b.room_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND b.date = $${params.length}`;
    }

    query += ' ORDER BY b.date, b.start_time';

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async deleteById(id) {
    const { rows } = await pool.query(
      'DELETE FROM bookings WHERE id = $1 RETURNING *',
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = BookingModel;
