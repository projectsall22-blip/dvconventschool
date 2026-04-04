import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none select-none relative overflow-hidden';

  const sizes = {
    sm: 'h-9 px-4 text-xs gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-12 px-7 text-sm gap-2',
  };

  const variantStyles = {
    primary:   { background: 'linear-gradient(to right, #1E3A5F, #1E40AF)' },
    danger:    { background: 'linear-gradient(to right, #dc2626, #b91c1c)' },
    success:   { background: 'linear-gradient(to right, #059669, #047857)' },
    gold:      { background: 'linear-gradient(to right, #f59e0b, #d97706)' },
    secondary: {},
    outline:   {},
    ghost:     {},
  };

  const variants = {
    primary:   'text-white shadow-md hover:opacity-90',
    secondary: 'bg-slate-700 text-white hover:bg-slate-600 shadow-sm',
    danger:    'text-white shadow-sm hover:opacity-90',
    success:   'text-white shadow-sm hover:opacity-90',
    outline:   'border-2 border-[#1E40AF]/30 text-[#1E40AF] bg-white hover:bg-[#1E40AF]/5 hover:border-[#1E40AF]/60',
    ghost:     'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
    gold:      'text-white shadow-sm hover:opacity-90',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={variantStyles[variant] || {}}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : 16} className="shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
