'use client';

import { Users, MapPin, Monitor, Plus, Check } from 'lucide-react';
import { Room } from '@/lib/types';

interface RoomCardProps {
  room: Room;
  isSelected: boolean;
  isPastDate?: boolean;
  onSelect: (room: Room) => void;
  onBook: (room: Room) => void;
}

export default function RoomCard({ room, isSelected, isPastDate = false, onSelect, onBook }: RoomCardProps) {
  const amenityList = room.amenities ? room.amenities.split(', ').filter(Boolean) : [];

  return (
    <div
      onClick={() => onSelect(room)}
      className={`group relative flex flex-col justify-between cursor-pointer rounded-2xl border p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        isSelected
          ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
          : 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{room.name}</h3>
              {isSelected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <Check className="h-2.5 w-2.5" /> Filtered
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mt-1">
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span>{room.floor}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-gray-100/80 px-2.5 py-1 text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
            <Users className="h-3.5 w-3.5 text-gray-500" />
            <span>{room.capacity} seats</span>
          </div>
        </div>

        {amenityList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {amenityList.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-md bg-gray-50 border border-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
              >
                <Monitor className="h-3 w-3 text-gray-400" />
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
        <span className="text-xs sm:text-sm font-medium text-gray-500">
          {room.booking_count === 0 ? (
            <span className={isPastDate ? 'text-gray-400' : 'text-emerald-600'}>
              {isPastDate ? 'No bookings' : 'Free today'}
            </span>
          ) : (
            `${room.booking_count} booking${room.booking_count > 1 ? 's' : ''}`
          )}
        </span>
        <button
          type="button"
          disabled={isPastDate}
          onClick={(e) => {
            e.stopPropagation();
            if (!isPastDate) {
              onBook(room);
            }
          }}
          title={isPastDate ? 'Cannot book for past dates' : 'Book this room'}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
            isPastDate
              ? 'bg-gray-100 text-gray-400 border border-gray-200/80 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-xs cursor-pointer'
          }`}
        >
          {!isPastDate && <Plus className="h-3.5 w-3.5" />}
          <span>{isPastDate ? 'Past date' : 'Book'}</span>
        </button>
      </div>
    </div>
  );
}
