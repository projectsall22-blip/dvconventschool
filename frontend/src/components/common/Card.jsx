import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  footer,
  action,
  className = '',
  noPadding = false,
  gradient = false,
  glass = false,
}) => {
  const base = gradient
    ? 'bg-gradient-to-br from-primary-dark via-[#1E3A5F] to-primary text-white border-0 shadow-card-lg'
    : glass
    ? 'glass-white shadow-card-lg border border-white/80'
    : 'bg-white border border-slate-100/80 shadow-card hover:shadow-card-hover';

  return (
    <div className={`${base} rounded-2xl transition-shadow duration-300 overflow-hidden ${className}`}>
      {(title || Icon) && (
        <div
          className={`px-5 py-4 flex items-center justify-between ${
            gradient ? 'border-b border-white/10' : 'border-b border-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className={`p-2 rounded-xl ${
                  gradient ? 'bg-white/15 backdrop-blur-sm' : 'bg-blue-50 text-primary'
                }`}
              >
                <Icon size={17} className={gradient ? 'text-white' : 'text-primary'} />
              </div>
            )}
            <div>
              <h3
                className={`font-bold text-sm leading-none ${
                  gradient ? 'text-white' : 'text-slate-800'
                }`}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  className={`text-xs mt-1 ${
                    gradient ? 'text-blue-200' : 'text-secondary'
                  }`}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={noPadding ? 'p-0' : 'p-5 md:p-6'}>{children}</div>

      {footer && (
        <div
          className={`px-5 py-3 border-t ${
            gradient
              ? 'border-white/10 bg-white/5'
              : 'border-slate-100 bg-slate-50/60'
          }`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
