'use client';

interface Props {
  onClick: () => void;
  className?: string;
}

export function BackButton({ onClick, className = '' }: Props) {
  return (
    <button
      onClick={onClick}
      aria-label="Voltar"
      className={`
        w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600
        hover:bg-gray-200 hover:text-gray-900
        active:scale-90
        transition-all duration-150
        focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2
        ${className}
      `}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
