import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, GraduationCap } from 'lucide-react';
import { navConfig } from '../../utils/navConfig';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = ({ role = 'admin', isMobileOpen, onMobileClose }) => {
  const menuItems = navConfig[role] || [];
  const { settings } = useSettings();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative
    ${isActive
      ? 'bg-white/15 text-white shadow-inner-glow border border-white/20 translate-x-0.5'
      : 'text-blue-200/80 hover:bg-white/8 hover:text-white hover:translate-x-0.5'}`;

  const Content = (
    <div className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #0F2044 0%, #1E3A5F 60%, #1E40AF 100%)' }}>
      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      {/* Mobile header */}
      <div className="relative z-10 p-5 flex items-center justify-between md:hidden border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm">Navigation</span>
        </div>
        <button onClick={onMobileClose} className="p-1.5 hover:bg-white/10 rounded-xl text-white/60 transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-grow px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, i) => (
          <div key={i}>
            {item.path ? (
              <NavLink to={item.path} end className={linkClass} onClick={onMobileClose}>
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />
                    )}
                    <item.icon size={18} className="shrink-0" />
                    <span>{item.title}</span>
                  </>
                )}
              </NavLink>
            ) : (
              <p className="pt-5 pb-1.5 px-3.5 text-[9px] font-black text-blue-300/50 uppercase tracking-[0.15em]">
                {item.title}
              </p>
            )}

            {item.submenu?.map((sub, si) => (
              <NavLink key={si} to={sub.path} end className={linkClass} onClick={onMobileClose}>
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" />}
                    <div className="w-5 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                    </div>
                    <span>{sub.title}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative z-10 p-3 border-t border-white/10">
        <div className="bg-white/8 rounded-xl p-3.5 border border-white/10 backdrop-blur-sm">
          <p className="text-[9px] font-black text-blue-300/60 uppercase tracking-widest mb-0.5">Academic Year</p>
          <p className="text-xs font-bold text-white">{settings.currentAcademicYear}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:block fixed left-0 top-14 md:top-16 bottom-0 w-[260px] z-30 shadow-sidebar overflow-hidden">
        {Content}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 bottom-0 w-[270px] shadow-2xl animate-in slide-in-from-left duration-300 overflow-hidden">
            {Content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
