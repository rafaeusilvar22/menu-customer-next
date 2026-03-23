import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses = {
  primary:
    'bg-[var(--color-primary)] text-white shadow-sm shadow-[var(--color-primary)]/30 ' +
    'hover:bg-[var(--color-emphasis)] hover:shadow-md hover:shadow-[var(--color-primary)]/25 ' +
    'active:scale-[0.97] active:shadow-sm',
  secondary:
    'bg-[var(--color-secondary)] text-white shadow-sm ' +
    'hover:opacity-90 active:scale-[0.97]',
  ghost:
    'bg-transparent border border-gray-200 text-gray-700 ' +
    'hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97]',
  danger:
    'bg-red-500 text-white shadow-sm ' +
    'hover:bg-red-600 active:scale-[0.97]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        rounded-xl font-medium
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Carregando...
        </span>
      ) : children}
    </button>
  );
}
