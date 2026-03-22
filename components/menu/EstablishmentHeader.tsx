import Image from 'next/image';
import { Workspace } from '@/types/workspace';
import { formatCurrency } from '@/lib/format';

interface Props {
  workspace: Workspace;
}

export function EstablishmentHeader({ workspace }: Props) {
  const isOpen = workspace.status === 'active';

  return (
    <div className="relative">
      {/* Cover image area */}
      <div className="relative w-full h-44 lg:h-64 bg-[var(--color-secondary)] overflow-hidden">
        {workspace.banner ? (
          <Image
            src={workspace.banner}
            alt={`Banner ${workspace.name}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : workspace.logo ? (
          <Image
            src={workspace.logo}
            alt={workspace.name}
            fill
            sizes="100vw"
            className="object-cover opacity-25"
            priority
          />
        ) : null}
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Open/Closed badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold backdrop-blur-sm ${
              isOpen ? 'bg-green-500/80 text-white' : 'bg-red-500/70 text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {isOpen ? 'Aberto' : 'Fechado'}
          </span>
        </div>
      </div>

      {/* Info panel */}
      <div className="bg-white px-4 lg:px-6 pt-3 pb-4 shadow-sm max-w-[1240px] mx-auto w-full">
        <div className="flex items-start gap-3">
          {/* Avatar overlapping cover */}
          <div className="relative -mt-10 w-16 h-16 flex-shrink-0 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-gray-100">
            {workspace.logo ? (
              <Image
                src={workspace.logo}
                alt={workspace.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--color-primary)] flex items-center justify-center text-white text-2xl font-bold">
                {workspace.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-lg font-bold text-gray-900 leading-tight truncate">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">{workspace.description}</p>
            )}
          </div>
        </div>

        {/* Info chips */}
        {(workspace.delivery_enabled || workspace.avg_preparation_time || workspace.min_order_amount) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {workspace.avg_preparation_time && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 font-medium">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {workspace.avg_preparation_time} min
              </span>
            )}
            {workspace.delivery_enabled && workspace.delivery_fee != null && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 font-medium">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 5v4h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                {Number(workspace.delivery_fee) === 0 ? 'Entrega grátis' : `Entrega ${formatCurrency(Number(workspace.delivery_fee))}`}
              </span>
            )}
            {workspace.min_order_amount != null && Number(workspace.min_order_amount) > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 font-medium">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                Mín. {formatCurrency(Number(workspace.min_order_amount))}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
