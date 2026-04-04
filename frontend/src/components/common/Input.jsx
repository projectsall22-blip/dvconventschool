import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      suffix,
      type = 'text',
      placeholder,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {label && (
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
            {label}
            {required && <span className="text-danger">*</span>}
          </label>
        )}

        <div className="relative group">
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors pointer-events-none">
              <Icon size={16} />
            </div>
          )}

          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            className={`
              w-full h-11 rounded-xl border bg-white/80 transition-all duration-200 outline-none
              text-slate-800 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal
              ${Icon ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-12' : 'pr-4'}
              ${
                error
                  ? 'border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/10 bg-red-50/30'
                  : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10'
              }
              disabled:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400
            `}
            {...props}
          />

          {suffix && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {suffix}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-semibold text-danger flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="w-1 h-1 rounded-full bg-danger inline-block" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-secondary">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
