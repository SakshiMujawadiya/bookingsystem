'use client';

import { useState, FormEvent } from 'react';
import { X, Building2, Users, MapPin, Sparkles, Plus } from 'lucide-react';
import { CreateRoomPayload } from '@/lib/types';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoomPayload) => Promise<void>;
}

const COMMON_AMENITIES = [
  'Whiteboard',
  'TV Screen',
  'Video Conferencing',
  'Projector',
  'Conference Phone',
  'Standing Desks',
];

export default function CreateRoomModal({ open, onClose, onSubmit }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('8');
  const [floor, setFloor] = useState('1st Floor');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Whiteboard', 'TV Screen']);
  const [customAmenity, setCustomAmenity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  function toggleAmenity(item: string) {
    setSelectedAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  }

  function handleAddCustomAmenity() {
    const trimmed = customAmenity.trim();
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
      setCustomAmenity('');
    }
  }

  function validate() {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Room name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Room name must be at least 2 characters';
    }

    const cap = Number(capacity);
    if (!capacity || isNaN(cap) || !Number.isInteger(cap) || cap < 1) {
      errs.capacity = 'Capacity must be at least 1 person';
    } else if (cap > 1000) {
      errs.capacity = 'Capacity cannot exceed 1000';
    }

    if (!floor.trim()) {
      errs.floor = 'Floor / Location is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        capacity: Number(capacity),
        floor: floor.trim(),
        amenities: selectedAmenities.join(', '),
      });
      // Reset form
      setName('');
      setCapacity('8');
      setFloor('1st Floor');
      setSelectedAmenities(['Whiteboard', 'TV Screen']);
      setCustomAmenity('');
      setErrors({});
    } catch (err: any) {
      if (err.error && err.error.toLowerCase().includes('already exists')) {
        setErrors({ name: err.error });
      } else {
        setErrors({ general: err.error || 'Failed to create room' });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-5 sm:p-6 text-left shadow-2xl transition-all border border-gray-100 max-h-[92vh] flex flex-col">
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Add New Meeting Room</h2>
                <p className="text-xs text-gray-500 mt-0.5">Define room capacity, floor location, and amenities</p>
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
            {errors.general && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-medium">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="room-name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Room name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  id="room-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  placeholder="e.g. Apex Conference Hall"
                  className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                    errors.name ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                  }`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-600 font-medium mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="room-capacity" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Seating capacity <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="room-capacity"
                    type="number"
                    min="1"
                    max="1000"
                    value={capacity}
                    onChange={(e) => {
                      setCapacity(e.target.value);
                      if (errors.capacity) setErrors((prev) => ({ ...prev, capacity: '' }));
                    }}
                    className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                      errors.capacity ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>
                {errors.capacity && <p className="text-xs text-red-600 font-medium mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label htmlFor="room-floor" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Floor / Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="room-floor"
                    type="text"
                    value={floor}
                    onChange={(e) => {
                      setFloor(e.target.value);
                      if (errors.floor) setErrors((prev) => ({ ...prev, floor: '' }));
                    }}
                    placeholder="e.g. 2nd Floor (West Wing)"
                    className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                      errors.floor ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>
                {errors.floor && <p className="text-xs text-red-600 font-medium mt-1">{errors.floor}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Room Amenities & Equipment
              </label>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {COMMON_AMENITIES.map((amenity) => {
                  const selected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        selected
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      {amenity}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  placeholder="Add custom amenity (press Enter)..."
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Custom tags list */}
              {selectedAmenities.filter((a) => !COMMON_AMENITIES.includes(a)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedAmenities
                    .filter((a) => !COMMON_AMENITIES.includes(a))
                    .map((a) => (
                      <span
                        key={a}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        {a}
                        <button
                          type="button"
                          onClick={() => toggleAmenity(a)}
                          className="text-indigo-400 hover:text-indigo-600 ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 pt-4 border-t border-gray-100 mt-6 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                {submitting ? 'Creating Room...' : 'Create Room'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
