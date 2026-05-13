import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, hint, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 flex items-center w-4 h-4">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full py-3 rounded-xl border text-gray-900 bg-white text-sm
            placeholder:text-gray-400 outline-none transition-all duration-150
            ${icon ? 'pl-10 pr-4' : 'px-4'}
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary-light/50'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
