import React from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const configs = {
  success: {
    icon: CheckCircle,
    bg: 'bg-emerald-600',
    border: 'border-emerald-500/50',
    glow: 'shadow-glow-green',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-danger',
    border: 'border-red-400/50',
    glow: 'shadow-glow-red',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-500',
    border: 'border-amber-400/50',
    glow: 'shadow-glow-amber',
  },
  info: {
    icon: Info,
    bg: 'bg-primary',
    border: 'border-blue-400/50',
    glow: 'shadow-glow-blue',
  },
};

const Toast = ({ message, type = 'success', onClose }) => {
  const { icon: Icon, bg, border, glow } = configs[type] || configs.info;

  return (
    <div
      className={`
        fixed top-5 left-1/2 -translate-x-1/2 z-[200]
        flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl ${glow}
        min-w-[300px] max-w-[90vw] text-white
        ${bg} ${border}
        animate-in slide-in-from-top-4 fade-in duration-300
      `}
      role="alert"
    >
      <div className="bg-white/20 rounded-lg p-1 shrink-0">
        <Icon size={16} />
      </div>
      <p className="text-sm font-semibold flex-grow leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded-full transition-colors ml-1 shrink-0"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
