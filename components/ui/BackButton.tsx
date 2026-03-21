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
      className={`w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-transform ${className}`}
    >
      <svg
        width="20"
        height="20"
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
