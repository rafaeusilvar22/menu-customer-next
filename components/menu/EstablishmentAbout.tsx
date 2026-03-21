'use client';

import { useState, useEffect } from 'react';
import type { Workspace, BusinessHours } from '@/types/workspace';

const DAY_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const PAYMENT_LABELS: Record<string, string> = {
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  pix: 'Pix',
  cash: 'Dinheiro',
  voucher: 'Vale-refeição',
};

interface Props {
  workspace: Workspace;
  businessHours?: BusinessHours[];
}

export function EstablishmentAbout({ workspace, businessHours }: Props) {
  const [open, setOpen] = useState(false);
  const today = new Date().getDay();

  const addressParts = [
    workspace.address && workspace.address_number
      ? `${workspace.address}, ${workspace.address_number}`
      : workspace.address,
    workspace.address_complement || null,
    workspace.address_neighborhood || null,
    workspace.address_city && workspace.address_state
      ? `${workspace.address_city} – ${workspace.address_state}`
      : workspace.address_city || null,
    workspace.address_zipcode || null,
  ].filter(Boolean);

  const hasAddress = addressParts.length > 0;
  const hasContact = !!(workspace.phone || workspace.email);
  const hasPayments = workspace.accepted_payment_methods?.length > 0;
  const hasHours = businessHours && businessHours.length > 0;

  if (!hasAddress && !hasContact && !hasPayments && !hasHours) return null;

  const byDay = hasHours
    ? Object.fromEntries(businessHours!.map((bh) => [bh.day_of_week, bh]))
    : {};

  const todayEntry = byDay[today];
  const todayIsClosed = todayEntry?.is_closed ?? false;
  const todayTimeRange =
    todayEntry?.open_time && todayEntry?.close_time
      ? `${todayEntry.open_time} – ${todayEntry.close_time}`
      : null;

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors lg:px-6"
      >
        <span className="flex items-center gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Informações do estabelecimento
          {hasHours && todayTimeRange && !todayIsClosed && (
            <span className="text-xs text-gray-400 font-normal">· hoje {todayTimeRange}</span>
          )}
          {hasHours && todayIsClosed && (
            <span className="text-xs text-red-400 font-normal">· fechado hoje</span>
          )}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 animate-overlay-fade"
            onClick={() => setOpen(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm animate-sheet-up overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 font-semibold text-gray-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)]">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Informações do estabelecimento
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

            {/* Content */}
            <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">

              {/* About */}
              {workspace.about && (
                <div className="px-5 py-4 flex gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Sobre</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{workspace.about}</p>
                  </div>
                </div>
              )}

              {/* Business hours */}
              {hasHours && (
                <div className="px-5 py-4 flex gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 font-medium mb-2">Horários de funcionamento</p>
                    <div className="space-y-1.5">
                      {DAY_LABELS.map((label, idx) => {
                        const entry = byDay[idx];
                        const isToday = idx === today;
                        const isClosed = entry?.is_closed ?? false;
                        const timeRange =
                          entry?.open_time && entry?.close_time
                            ? `${entry.open_time} – ${entry.close_time}`
                            : '—';

                        return (
                          <div
                            key={idx}
                            className={`flex justify-between text-sm ${isToday ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                          >
                            <span className="flex items-center gap-1.5">
                              {isToday && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                              )}
                              <span className={isToday ? '' : 'ml-3'}>
                                {label}
                                {isToday && <span className="text-[var(--color-primary)] ml-1 text-xs font-medium">(hoje)</span>}
                              </span>
                            </span>
                            <span className={isClosed ? 'text-red-500' : isToday ? 'text-[var(--color-primary)]' : 'text-gray-700'}>
                              {isClosed ? 'Fechado' : timeRange}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {hasAddress && (
                <div className="px-5 py-4 flex gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Endereço</p>
                    {addressParts.map((part, i) => (
                      <p key={i} className="text-sm text-gray-700 leading-snug">{part}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Phone */}
              {workspace.phone && (
                <div className="px-5 py-4 flex gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">Telefone</p>
                    <a href={`tel:${workspace.phone}`} className="text-sm text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                      {workspace.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Email */}
              {workspace.email && (
                <div className="px-5 py-4 flex gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-1">E-mail</p>
                    <a href={`mailto:${workspace.email}`} className="text-sm text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                      {workspace.email}
                    </a>
                  </div>
                </div>
              )}

              {/* Payment methods */}
              {hasPayments && (
                <div className="px-5 py-4 flex gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-primary)] mt-0.5 flex-shrink-0">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-2">Formas de pagamento</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workspace.accepted_payment_methods.map((method) => (
                        <span
                          key={method}
                          className="inline-flex items-center text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 font-medium"
                        >
                          {PAYMENT_LABELS[method] ?? method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
