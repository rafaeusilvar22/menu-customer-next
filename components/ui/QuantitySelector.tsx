interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function QuantitySelector({ value, min = 1, max = 99, onChange }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-2 py-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 flex items-center justify-center text-xl font-bold text-[var(--color-primary)] disabled:opacity-30"
      >
        −
      </button>
      <span className="w-6 text-center font-semibold text-gray-800">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 flex items-center justify-center text-xl font-bold text-[var(--color-primary)] disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
