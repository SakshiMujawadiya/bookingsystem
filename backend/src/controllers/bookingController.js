const BookingModel = require('../models/bookingModel');
const RoomModel = require('../models/roomModel');
const config = require('../config');
const { validateBooking } = require('../validation');

const WORK_START = config.workingHours.start;
const WORK_END = config.workingHours.end;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

const WORK_START_MIN = timeToMinutes(WORK_START);
const WORK_END_MIN = timeToMinutes(WORK_END);

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateTimeRange(startTime, endTime) {
  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  if (endMin <= startMin) {
    return 'End time must be after start time';
  }
  if (startMin < WORK_START_MIN) {
    return `Booking cannot start before working hours (${WORK_START})`;
  }
  if (endMin > WORK_END_MIN) {
    return `Booking cannot end after working hours (${WORK_END})`;
  }

  return null;
}

/**
 * Booking Controller - Handles HTTP requests for booking endpoints
 */
const bookingController = {
  async getBookings(req, res, next) {
    try {
      const { room_id, date } = req.query;
      const bookings = await BookingModel.findAll({ roomId: room_id, date });
      res.json(bookings);
    } catch (err) {
      next(err);
    }
  },

  async createBooking(req, res, next) {
    try {
      const { isValid, errors, data } = validateBooking(req.body);
      if (!isValid) {
        return res.status(400).json({ error: errors.join(', ') });
      }

      const { room_id, title, booked_by, date, start_time, end_time } = data;

      // Don't allow creating bookings for past dates
      const today = getTodayString();
      if (date < today) {
        return res.status(400).json({ error: 'Cannot book a meeting room for a past date' });
      }

      const room = await RoomModel.findById(room_id);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      const timeError = validateTimeRange(start_time, end_time);
      if (timeError) {
        return res.status(400).json({ error: timeError });
      }

      // Check for overlap with existing reservations
      const conflict = await BookingModel.findConflict(room_id, date, start_time, end_time);
      if (conflict) {
        return res.status(409).json({
          error: `Time conflict with existing booking: "${conflict.title}" (${conflict.start_time.slice(0, 5)}–${conflict.end_time.slice(0, 5)}) booked by ${conflict.booked_by}`,
          conflicting_booking: conflict,
        });
      }

      const newBooking = await BookingModel.create({
        room_id,
        title,
        booked_by,
        date,
        start_time,
        end_time,
      });

      res.status(201).json(newBooking);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/bookings/:id - Cancel a booking
  async cancelBooking(req, res, next) {
    try {
      const deleted = await BookingModel.deleteById(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      res.json({
        message: 'Booking cancelled successfully',
        booking: deleted,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = bookingController;
