const { pool } = require('../db');

const RoomModel = {
  async findAll(date) {
    const query = `
      SELECT r.*,
        (SELECT COUNT(*) FROM bookings b
         WHERE b.room_id = r.id AND b.date = $1
        )::int AS booking_count
      FROM rooms r
      ORDER BY r.name
    `;
    const { rows } = await pool.query(query, [date]);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findByName(name) {
    const { rows } = await pool.query(
      'SELECT * FROM rooms WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );
    return rows[0] || null;
  },

  async create({ name, capacity, floor, amenities = '' }) {
    const query = `
      INSERT INTO rooms (name, capacity, floor, amenities)
      VALUES ($1, $2, $3, $4)
      RETURNING *, 0 AS booking_count
    `;
    const { rows } = await pool.query(query, [name, capacity, floor, amenities]);
    return rows[0];
  },
};

module.exports = RoomModel;
