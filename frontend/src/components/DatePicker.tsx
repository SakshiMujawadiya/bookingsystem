'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function shift(days: number) {
    const d = new Date(value + 'T00:00:00');
    d.setDate(d.getDate() + days);
    onChange(formatDate(d));
  }

  function setToday() {
    onChange(formatDate(new Date()));
  }

  function triggerPicker() {
    if (!inputRef.current) return;
    try {
      if ('showPicker' in HTMLInputElement.prototype) {
        inputRef.current.showPicker();
      } else {
        inputRef.current.focus();
      }
    } catch (_) {
      inputRef.current.focus();
    }
  }

  const display = formatDisplay(value);
  const isToday = value === formatDate(new Date());

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {/* Previous Day Button */}
      <button
        type="button"
        onClick={() => shift(-1)}
        aria-label="Previous Day"
        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Date Selector Box */}
      <div
        onClick={triggerPicker}
        className="relative cursor-pointer group"
      >
        <div className="flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-xl border border-gray-200 bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-gray-800 shadow-2xs group-hover:border-indigo-400 group-hover:bg-indigo-50/20 transition-all">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 flex-shrink-0" />
          <span className="whitespace-nowrap font-medium">{display}</span>
          {isToday ? (
            <span className="rounded-full bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 uppercase tracking-wide">
              Today
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setToday();
              }}
              className="rounded-md bg-gray-100 hover:bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Today
            </button>
          )}
        </div>

        {/* Native date input overlay with showPicker handler */}
        <input
          ref={inputRef}
          type="date"
          value={value}
          onClick={(e) => {
            e.stopPropagation();
            triggerPicker();
          }}
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>

      {/* Next Day Button */}
      <button
        type="button"
        onClick={() => shift(1)}
        aria-label="Next Day"
        className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
