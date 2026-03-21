'use client';

import { useState, useEffect } from 'react';
import type { BusinessHours } from '@/types/workspace';

const DAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Props {
  businessHours: BusinessHours[];
}

export function BusinessHoursAccordion({ businessHours }: Props) {
  const [open, setOpen] = useState(false);
  const today = new Date().getDay();

  const byDay = Object.fromEntries(businessHours.map((bh) => [bh.day_of_week, bh]));

  const todayEntry = byDay[today];
  const todayIsClosed = todayEntry?.is_closed ?? false;
  const todayTimeRange =
    todayEntry?.open_time && todayEntry?.close_time
      ? `${todayEntry.open_time} – ${todayEntry.close_time}`
      : null;

  // Body scroll lock while modal is open
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors lg:px-6"
      >
        <span className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Horários de funcionamento
          {todayTimeRange && !todayIsClosed && (
            <span className="text-xs text-gray-400 font-normal">· hoje {todayTimeRange}</span>
          )}
          {todayIsClosed && (
            <span className="text-xs text-red-400 font-normal">· fechado hoje</span>
          )}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 animate-overlay-fade"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-sheet-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Horários de funcionamento
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Days list */}
            <div className="divide-y divide-gray-50">
              {DAY_LABELS.map((label, idx) => {
                const entry = byDay[idx];
                const isToday = idx === today;
                const isClosed = entry?.is_closed ?? false;
                const timeRange =
                  entry?.open_time && entry?.close_time
                    ? `${entry.open_time} – ${entry.close_time}`
                    : 'Aberto';

                return (
                  <div
                    key={idx}
                    className={`flex justify-between items-center px-5 py-3 text-sm ${
                      isToday
                        ? 'bg-[var(--color-primary)]/8 font-semibold text-gray-900'
                        : 'text-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                      )}
                      <span className={isToday ? '' : 'ml-3.5'}>
                        {label}
                        {isToday && <span className="text-[var(--color-primary)] ml-1.5 text-xs font-medium">(hoje)</span>}
                      </span>
                    </div>
                    <span className={`font-medium ${isClosed ? 'text-red-500' : isToday ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>
                      {isClosed ? 'Fechado' : timeRange}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
