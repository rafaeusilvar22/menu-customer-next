interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-1.5 py-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-lg font-bold text-[var(--color-primary)] disabled:opacity-30 active:scale-95 transition-transform"
      >
        −
      </button>
      <span className="w-6 text-center font-semibold text-gray-800 text-sm">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center rounded-xl text-lg font-bold text-[var(--color-primary)] disabled:opacity-30 active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  );
}
