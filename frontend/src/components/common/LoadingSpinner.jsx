import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizes = {
    xs: 'h-3.5 w-3.5 border-[2px]',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-11 w-11 border-[3px]',
  };

  const colors = {
    primary: 'border-blue-100 border-t-primary',
    white:   'border-white/20 border-t-white',
    success: 'border-emerald-100 border-t-success',
    danger:  'border-red-100 border-t-danger',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} ${colors[color]} rounded-full animate-spin`} />
      {size === 'lg' && (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
