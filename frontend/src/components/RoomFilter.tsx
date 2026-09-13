'use client';

import { Filter } from 'lucide-react';
import { Room } from '@/lib/types';

interface RoomFilterProps {
  rooms: Room[];
  value: string;
  onChange: (roomId: string) => void;
}

export default function RoomFilter({ rooms, value, onChange }: RoomFilterProps) {
  return (
    <div className="relative inline-flex items-center w-full sm:w-auto">
      <Filter className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full sm:w-auto appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-200 hover:border-gray-300 transition-colors cursor-pointer"
      >
        <option value="">All rooms ({rooms.length})</option>
        {rooms.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name} · {r.capacity} seats
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2.5 h-4 w-4 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
