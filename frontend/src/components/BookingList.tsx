'use client';

import { Clock, User, Trash2, CalendarX, MapPin } from 'lucide-react';
import { Booking } from '@/lib/types';

interface BookingListProps {
  bookings: Booking[];
  loading: boolean;
  isPastDate?: boolean;
  onCancel: (booking: Booking) => void;
}

export default function BookingList({ bookings, loading, isPastDate = false, onCancel }: BookingListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-gray-200 bg-white p-4">
            <div className="h-4 w-36 sm:w-48 rounded bg-gray-200 mb-2" />
            <div className="h-3 w-24 sm:w-32 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 p-6 text-center">
        <CalendarX className="h-10 w-10 sm:h-12 sm:w-12 mb-3 text-gray-300 stroke-[1.5]" />
        <p className="text-base sm:text-lg font-medium text-gray-600">
          {isPastDate ? 'No bookings on this past date' : 'No bookings for this date'}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-sm">
          {isPastDate
            ? 'No meetings were scheduled on this day.'
            : 'Select any meeting room above and click Book to schedule your meeting.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 sm:px-4 sm:py-3.5 hover:border-gray-300 hover:shadow-xs transition-all"
        >
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-2.5 py-1 flex-shrink-0">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                {booking.start_time.slice(0, 5)} – {booking.end_time.slice(0, 5)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{booking.title}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-gray-400" />
                  {booking.booked_by}
                </span>
                {booking.room_name && (
                  <span className="flex items-center gap-1 text-indigo-600 font-medium">
                    <MapPin className="h-3 w-3" />
                    {booking.room_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-gray-100 pt-2 sm:border-t-0 sm:pt-0">
            {isPastDate ? (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                Completed
              </span>
            ) : (
              <button
                onClick={() => onCancel(booking)}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 active:bg-red-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all cursor-pointer"
                title="Cancel booking"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sm:hidden">Cancel</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
