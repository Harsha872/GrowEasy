import type { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

const styles: Record<string, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50',
  secondary:
    'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 disabled:opacity-50',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 disabled:opacity-50',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
    />
  );
}
