import { CreateBookingPayload, CreateRoomPayload, Booking, Room, NextAvailableResponse, ApiError } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Shared fetch wrapper with error parsing
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data as ApiError;
    throw { error: err.error, status: res.status, conflicting_booking: err.conflicting_booking };
  }

  return data as T;
}

export async function fetchRooms(date: string): Promise<Room[]> {
  return request<Room[]>(`/api/rooms?date=${date}`);
}

export async function createRoom(payload: CreateRoomPayload): Promise<Room> {
  return request<Room>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchBookings(params: { room_id?: string; date?: string }): Promise<Booking[]> {
  const query = new URLSearchParams();
  if (params.room_id) query.set('room_id', params.room_id);
  if (params.date) query.set('date', params.date);
  return request<Booking[]>(`/api/bookings?${query.toString()}`);
}

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  return request<Booking>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelBooking(id: string): Promise<{ message: string; booking: Booking }> {
  return request<{ message: string; booking: Booking }>(`/api/bookings/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchNextAvailable(
  roomId: string,
  date: string,
  duration: number
): Promise<NextAvailableResponse> {
  return request<NextAvailableResponse>(
    `/api/rooms/${roomId}/next-available?date=${date}&duration=${duration}`
  );
}
