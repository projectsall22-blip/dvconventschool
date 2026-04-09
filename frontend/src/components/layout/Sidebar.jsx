import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { navConfig } from '../../utils/navConfig';
import { useSettings } from '../../context/SettingsContext';

const Sidebar = ({ role = 'admin', isMobileOpen, onMobileClose }) => {
  const menuItems = navConfig[role] || [];
  const { settings } = useSettings();

  const getLinkStyles = ({ isActive }) => `
    flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 group
    ${isActive
      ? 'bg-primary text-white shadow-lg shadow-indigo-200 translate-x-1'
      : 'text-secondary hover:bg-gray-50 hover:text-primary hover:translate-x-1'}
  `;

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 flex items-center justify-between md:hidden border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">DV</div>
          <span className="font-bold text-gray-800">Menu</span>
        </div>
        <button onClick={onMobileClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, i) => (
          <div key={i}>
            {item.path ? (
              <NavLink to={item.path} end className={getLinkStyles} onClick={onMobileClose}>
                <item.icon size={22} className="shrink-0" />
                <span className="text-sm">{item.title}</span>
              </NavLink>
            ) : (
              <div className="pt-2 pb-1 px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {item.title}
              </div>
            )}
            {item.submenu?.map((sub, si) => (
              <NavLink key={si} to={sub.path} end className={getLinkStyles} onClick={onMobileClose}>
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-1 h-1 bg-current rounded-full" />
                </div>
                <span className="text-sm">{sub.title}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Academic Year</p>
          <p className="text-xs font-bold text-gray-700">{settings.currentAcademicYear}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-100 z-30">
        {SidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
