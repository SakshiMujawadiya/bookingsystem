const RoomModel = require('../models/roomModel');
const { findNextAvailable } = require('../services/slotService');
const { validateNextAvailable, validateRoom } = require('../validation');

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const roomController = {
  async getAllRooms(req, res, next) {
    try {
      const date = req.query.date || getTodayString();
      const rooms = await RoomModel.findAll(date);
      res.json(rooms);
    } catch (err) {
      next(err);
    }
  },

  async createRoom(req, res, next) {
    try {
      const { isValid, errors, data } = validateRoom(req.body);
      if (!isValid) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      const { name, capacity, floor, amenities } = data;

      // Check if room name is already in use
      const existing = await RoomModel.findByName(name);
      if (existing) {
        return res.status(409).json({ error: `A room named "${name}" already exists` });
      }

      const newRoom = await RoomModel.create({
        name,
        capacity,
        floor,
        amenities,
      });

      res.status(201).json(newRoom);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'A room with this name already exists' });
      }
      next(err);
    }
  },

  async getRoomById(req, res, next) {
    try {
      const room = await RoomModel.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.json(room);
    } catch (err) {
      next(err);
    }
  },

  async getNextAvailableSlot(req, res, next) {
    try {
      const { isValid, errors, data } = validateNextAvailable(req.query);
      if (!isValid) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      const { date, duration } = data;
      const room = await RoomModel.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const nextSlot = await findNextAvailable(req.params.id, date, duration);

      res.json({
        room_id: room.id,
        room_name: room.name,
        date,
        duration_minutes: duration,
        next_available_start: nextSlot,
        available: nextSlot !== null,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = roomController;
