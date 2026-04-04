import React from 'react';
import { NavLink } from 'react-router-dom';
import { bottomNavConfig } from '../../utils/navConfig';

const BottomNav = ({ role = 'student' }) => {
  const items = bottomNavConfig[role] || [];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-2 pb-safe"
      style={{ background: 'linear-gradient(90deg, #0F2044 0%, #1E3A5F 55%, #1E40AF 100%)' }}
    >
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center justify-around h-16">
        {items.map((item, i) => (
          <NavLink key={i} to={item.path} end className="flex-1">
            {({ isActive }) => (
              <div className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 ${isActive ? 'text-white' : 'text-blue-300/60'}`}>
                <div className={`relative p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/15 scale-110' : ''}`}>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
                  )}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tight transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  {item.title}
                </span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
