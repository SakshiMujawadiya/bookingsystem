'use client';

import { useState, FormEvent } from 'react';
import { X, Clock, Zap, MapPin, Users } from 'lucide-react';
import { Room } from '@/lib/types';
import { fetchNextAvailable } from '@/lib/api';

interface BookingModalProps {
  room: Room;
  date: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; booked_by: string; start_time: string; end_time: string }) => Promise<void>;
}

export default function BookingModal({ room, date, open, onClose, onSubmit }: BookingModalProps) {
  const [title, setTitle] = useState('');
  const [bookedBy, setBookedBy] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [findingSlot, setFindingSlot] = useState(false);

  if (!open) return null;

  function getTodayStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const isPastDate = date < getTodayStr();

  function validate() {
    const errs: Record<string, string> = {};

    if (isPastDate) {
      errs.title = 'Cannot book a meeting room for a past date';
      setErrors(errs);
      return false;
    }

    if (!title.trim()) errs.title = 'Title is required';
    if (!bookedBy.trim()) errs.booked_by = 'Your name is required';

    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);

    if (endMin <= startMin) errs.end_time = 'End time must be after start time';
    if (startMin < 540) errs.start_time = 'Cannot start before 09:00';
    if (endMin > 1080) errs.end_time = 'Cannot end after 18:00';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isPastDate || !validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), booked_by: bookedBy.trim(), start_time: startTime, end_time: endTime });
      setTitle('');
      setBookedBy('');
      setStartTime('09:00');
      setEndTime('10:00');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFindSlot() {
    const startMin = timeToMin(startTime);
    const endMin = timeToMin(endTime);
    const duration = endMin > startMin ? endMin - startMin : 60;

    setFindingSlot(true);
    try {
      const result = await fetchNextAvailable(room.id, date, duration);
      if (result.next_available_start) {
        setStartTime(result.next_available_start);
        const newEnd = timeToMin(result.next_available_start) + duration;
        setEndTime(minToTime(Math.min(newEnd, 1080)));
        setErrors({});
      } else {
        setErrors({ start_time: `No ${duration}-minute slot available on this date` });
      }
    } catch {
      setErrors({ start_time: 'Could not find available slot' });
    } finally {
      setFindingSlot(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-5 sm:p-6 text-left shadow-2xl transition-all border border-gray-100 max-h-[92vh] flex flex-col">
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">New Booking</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                <span className="font-medium text-indigo-600">{room.name}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  {room.floor}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  {room.capacity} seats
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto flex-1 pr-0.5">
            {isPastDate && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                This date has already passed. New bookings can only be made for today or future dates.
              </div>
            )}

            <div>
              <label htmlFor="booking-title" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Meeting title
              </label>
              <input
                id="booking-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Review"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                  errors.title ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 font-medium mt-1">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="booking-by" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Your name
              </label>
              <input
                id="booking-by"
                type="text"
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                placeholder="e.g. Sarah Connor"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                  errors.booked_by ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                }`}
              />
              {errors.booked_by && <p className="text-xs text-red-600 font-medium mt-1">{errors.booked_by}</p>}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-time" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Start time (09:00 - 18:00)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    min="09:00"
                    max="18:00"
                    className={`w-full rounded-xl border pl-10 pr-3 py-2.5 text-base sm:text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                      errors.start_time ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>
                {errors.start_time && <p className="text-xs text-red-600 font-medium mt-1">{errors.start_time}</p>}
              </div>

              <div>
                <label htmlFor="end-time" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  End time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min="09:00"
                    max="18:00"
                    className={`w-full rounded-xl border pl-10 pr-3 py-2.5 text-base sm:text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                      errors.end_time ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>
                {errors.end_time && <p className="text-xs text-red-600 font-medium mt-1">{errors.end_time}</p>}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleFindSlot}
                disabled={findingSlot || isPastDate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3.5 py-2 text-xs sm:text-sm font-medium text-indigo-700 hover:bg-indigo-100 active:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Zap className="h-4 w-4 text-indigo-500" />
                {findingSlot ? 'Finding open slot...' : 'Find next available slot'}
              </button>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || isPastDate}
                className="w-full sm:w-auto rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPastDate ? 'Cannot Book Past Date' : submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
