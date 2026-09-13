const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validateBooking(body = {}) {
  const errors = [];
  const { room_id, title, booked_by, date, start_time, end_time } = body;

  if (!room_id || !UUID_REGEX.test(room_id)) {
    errors.push('room_id must be a valid UUID');
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    errors.push('Title is required');
  } else if (title.trim().length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  if (!booked_by || typeof booked_by !== 'string' || !booked_by.trim()) {
    errors.push('Booked by is required');
  } else if (booked_by.trim().length > 100) {
    errors.push('Booked by cannot exceed 100 characters');
  }

  if (!date || !DATE_REGEX.test(date)) {
    errors.push('Date must be YYYY-MM-DD');
  } else {
    const today = getTodayString();
    if (date < today) {
      errors.push('Cannot book a meeting room for a past date');
    }
  }
  if (!start_time || !TIME_REGEX.test(start_time)) {
    errors.push('Start time must be HH:MM');
  }
  if (!end_time || !TIME_REGEX.test(end_time)) {
    errors.push('End time must be HH:MM');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      room_id,
      title: title ? title.trim() : '',
      booked_by: booked_by ? booked_by.trim() : '',
      date,
      start_time,
      end_time,
    },
  };
}

function validateNextAvailable(query = {}) {
  const errors = [];
  const { date, duration } = query;

  if (!date || !DATE_REGEX.test(date)) {
    errors.push('Date must be YYYY-MM-DD');
  }

  const dur = Number(duration);
  if (!duration || isNaN(dur) || !Number.isInteger(dur) || dur < 15) {
    errors.push('Duration must be at least 15 minutes');
  } else if (dur > 540) {
    errors.push('Duration cannot exceed 9 hours');
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      date,
      duration: dur,
    },
  };
}

function validateRoom(body = {}) {
  const errors = [];
  const { name, capacity, floor, amenities } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Room name is required');
  } else if (name.trim().length < 2) {
    errors.push('Room name must be at least 2 characters');
  } else if (name.trim().length > 100) {
    errors.push('Room name cannot exceed 100 characters');
  }

  const cap = Number(capacity);
  if (capacity === undefined || capacity === null || capacity === '' || isNaN(cap) || !Number.isInteger(cap) || cap < 1) {
    errors.push('Capacity must be an integer of at least 1 person');
  } else if (cap > 1000) {
    errors.push('Capacity cannot exceed 1000');
  }

  if (!floor || typeof floor !== 'string' || !floor.trim()) {
    errors.push('Floor / Location is required');
  } else if (floor.trim().length > 50) {
    errors.push('Floor cannot exceed 50 characters');
  }

  let formattedAmenities = '';
  if (Array.isArray(amenities)) {
    formattedAmenities = amenities.map((a) => String(a).trim()).filter(Boolean).join(', ');
  } else if (typeof amenities === 'string') {
    formattedAmenities = amenities.trim();
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      name: name ? name.trim() : '',
      capacity: cap,
      floor: floor ? floor.trim() : '',
      amenities: formattedAmenities,
    },
  };
}

module.exports = {
  validateBooking,
  validateNextAvailable,
  validateRoom,
};
