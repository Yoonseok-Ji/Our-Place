import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const v = {
  primary:   'bg-primary text-white hover:bg-primary-hover active:bg-primary-dark',
  secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-150 active:bg-gray-200',
  ghost:     'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  danger:    'bg-red-50 text-red-500 hover:bg-red-100',
};
const s = {
  sm: 'text-sm px-3.5 py-2 rounded-xl gap-1.5 font-medium',
  md: 'text-sm px-4 py-2.5 rounded-xl gap-2 font-semibold',
  lg: 'text-base px-5 py-3.5 rounded-2xl gap-2 font-semibold',
};

export default function Button({ variant='primary', size='md', loading, disabled, icon, fullWidth, className='', children, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center transition-all duration-100 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${v[variant]} ${s[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading
        ? <span className="w-4 h-4 border-[2px] border-current border-t-transparent rounded-full animate-spin shrink-0" />
        : icon && <span className="shrink-0 flex">{icon}</span>
      }
      {children}
    </button>
  );
}
