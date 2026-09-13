const { pool } = require('./db');

const rooms = [
  {
    name: 'Atlas',
    capacity: 10,
    floor: '3rd Floor',
    amenities: 'Whiteboard, TV, Video Conferencing',
  },
  {
    name: 'Nova',
    capacity: 6,
    floor: '2nd Floor',
    amenities: 'Whiteboard, TV',
  },
  {
    name: 'Orion',
    capacity: 4,
    floor: '1st Floor',
    amenities: 'TV',
  },
  {
    name: 'Zenith',
    capacity: 14,
    floor: '4th Floor',
    amenities: 'Whiteboard, TV, Video Conferencing, Phone',
  },
  {
    name: 'Echo',
    capacity: 2,
    floor: '1st Floor',
    amenities: '',
  },
  {
    name: 'Horizon',
    capacity: 8,
    floor: '3rd Floor',
    amenities: 'Whiteboard, Video Conferencing',
  },
];

async function seed() {
  // Only seed if the rooms table is empty — don't duplicate on restart
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM rooms');

  if (rows[0].count > 0) {
    console.log(`Rooms already seeded (${rows[0].count} found), skipping`);
    return;
  }

  for (const room of rooms) {
    await pool.query(
      'INSERT INTO rooms (name, capacity, floor, amenities) VALUES ($1, $2, $3, $4)',
      [room.name, room.capacity, room.floor, room.amenities]
    );
  }

  console.log(`Seeded ${rooms.length} rooms`);
}

module.exports = seed;
