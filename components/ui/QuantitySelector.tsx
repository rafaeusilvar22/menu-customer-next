interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-2xl p-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="
          w-8 h-8 flex items-center justify-center rounded-xl
          text-[var(--color-primary)] font-bold text-lg
          hover:bg-[var(--color-primary)]/10
          active:scale-90
          disabled:opacity-30 disabled:active:scale-100
          transition-all duration-150
        "
      >
        −
      </button>
      <span className="w-7 text-center font-semibold text-gray-800 text-sm tabular-nums">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="
          w-8 h-8 flex items-center justify-center rounded-xl
          text-[var(--color-primary)] font-bold text-lg
          hover:bg-[var(--color-primary)]/10
          active:scale-90
          disabled:opacity-30 disabled:active:scale-100
          transition-all duration-150
        "
      >
        +
      </button>
    </div>
  );
}
