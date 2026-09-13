export interface Room {
  id: string;
  name: string;
  capacity: number;
  floor: string;
  amenities: string;
  booking_count: number;
}

export interface Booking {
  id: string;
  room_id: string;
  room_name: string;
  title: string;
  booked_by: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface CreateBookingPayload {
  room_id: string;
  title: string;
  booked_by: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface CreateRoomPayload {
  name: string;
  capacity: number;
  floor: string;
  amenities?: string;
}

export interface NextAvailableResponse {
  room_id: string;
  room_name: string;
  date: string;
  duration_minutes: number;
  next_available_start: string | null;
  available: boolean;
}

export interface ApiError {
  error: string;
  conflicting_booking?: Booking;
}
