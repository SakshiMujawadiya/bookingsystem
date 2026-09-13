'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Building2, Calendar, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Room, Booking, CreateRoomPayload } from '@/lib/types';
import { fetchRooms, fetchBookings, createBooking, cancelBooking, createRoom } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import RoomCard from '@/components/RoomCard';
import BookingList from '@/components/BookingList';
import BookingModal from '@/components/BookingModal';
import CreateRoomModal from '@/components/CreateRoomModal';
import DatePicker from '@/components/DatePicker';
import RoomFilter from '@/components/RoomFilter';

function todayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Home() {
  const { addToast } = useToast();

  const [date, setDate] = useState(todayStr);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [filterRoomId, setFilterRoomId] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Modal states
  const [modalRoom, setModalRoom] = useState<Room | null>(null);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const currentToday = todayStr();
  const isPastDate = date < currentToday;

  const loadRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const data = await fetchRooms(date);
      setRooms(data);
    } catch (err: any) {
      addToast(err.error || 'Failed to load rooms', 'error');
    } finally {
      setLoadingRooms(false);
    }
  }, [date, addToast]);

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const data = await fetchBookings({ room_id: filterRoomId || undefined, date });
      setBookings(data);
    } catch (err: any) {
      addToast(err.error || 'Failed to load bookings', 'error');
    } finally {
      setLoadingBookings(false);
    }
  }, [date, filterRoomId, addToast]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  function handleSelectRoom(room: Room) {
    const newId = selectedRoomId === room.id ? '' : room.id;
    setSelectedRoomId(newId);
    setFilterRoomId(newId);
  }

  function handleFilterChange(roomId: string) {
    setFilterRoomId(roomId);
    setSelectedRoomId(roomId);
  }

  async function handleCreateBooking(data: { title: string; booked_by: string; start_time: string; end_time: string }) {
    if (!modalRoom) return;
    if (isPastDate) {
      addToast('Cannot book a meeting room for a past date', 'error');
      return;
    }

    try {
      await createBooking({
        room_id: modalRoom.id,
        date,
        ...data,
      });
      addToast(`Booked "${data.title}" in ${modalRoom.name}`, 'success');
      setModalRoom(null);
      loadRooms();
      loadBookings();
    } catch (err: any) {
      addToast(err.error || 'Failed to create booking', 'error');
    }
  }

  async function handleCreateRoom(data: CreateRoomPayload) {
    const newRoom = await createRoom(data);
    addToast(`Room "${newRoom.name}" created successfully`, 'success');
    setIsCreateRoomOpen(false);
    await loadRooms();
  }

  async function handleCancel(booking: Booking) {
    try {
      const result = await cancelBooking(booking.id);
      addToast(result.message, 'success');
      loadRooms();
      loadBookings();
    } catch (err: any) {
      addToast(err.error || 'Failed to cancel booking', 'error');
    }
  }

  const freeRoomsCount = useMemo(() => {
    return rooms.filter((r) => r.booking_count === 0).length;
  }, [rooms]);

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs flex-shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate tracking-tight">
                Meeting Rooms
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">Office booking & schedule manager</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateRoomOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3 py-2 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Room</span>
            </button>
            <DatePicker value={date} onChange={setDate} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl w-full px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">Total Rooms</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{rooms.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                {isPastDate ? 'Unbooked Rooms' : 'Free Today'}
              </p>
              <p className="text-base sm:text-xl font-bold text-emerald-700">{freeRoomsCount}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 flex-shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
                {isPastDate ? 'Past Reservations' : 'Day Reservations'}
              </p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        {isPastDate && (
          <div className="flex items-start sm:items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-amber-900 shadow-2xs">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold">Viewing past bookings: </span>
              <span>
                You are viewing the schedule for a past date. Previous bookings are displayed below, but new reservations cannot be booked for past dates.
              </span>
            </div>
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                {isPastDate ? 'Rooms & History' : 'Available Rooms'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPastDate
                  ? 'Click any room to filter historical bookings. Past dates cannot be booked.'
                  : 'Click any room card to filter bookings or click Book'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {selectedRoomId && (
                <button
                  type="button"
                  onClick={() => handleFilterChange('')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  Clear filter
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCreateRoomOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-gray-500" />
                <span>New Room</span>
              </button>
            </div>
          </div>

          {loadingRooms ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 h-44" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoomId === room.id}
                  isPastDate={isPastDate}
                  onSelect={handleSelectRoom}
                  onBook={(room) => {
                    if (!isPastDate) setModalRoom(room);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                {isPastDate ? 'Historical Bookings' : 'Schedule & Bookings'}
              </h2>
              {bookings.length > 0 && (
                <span className="rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  {bookings.length}
                </span>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <RoomFilter rooms={rooms} value={filterRoomId} onChange={handleFilterChange} />
            </div>
          </div>

          <BookingList
            bookings={bookings}
            loading={loadingBookings}
            isPastDate={isPastDate}
            onCancel={handleCancel}
          />
        </section>
      </main>

      {modalRoom && (
        <BookingModal
          room={modalRoom}
          date={date}
          open={!!modalRoom}
          onClose={() => setModalRoom(null)}
          onSubmit={handleCreateBooking}
        />
      )}

      <CreateRoomModal
        open={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSubmit={handleCreateRoom}
      />
    </div>
  );
}
