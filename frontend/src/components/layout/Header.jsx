import React, { useState, useEffect } from 'react';
import { Menu, Bell, User, LogOut, ChevronDown, CheckCheck, Clock, Info } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { useSettings } from '../../context/SettingsContext';
import logo from '../../assets/school_logo.png';

const Header = ({ user, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { settings } = useSettings();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifs = async () => {
    try {
      const res = await API.get('/users/notifications');
      setNotifications(res.data);
    } catch { /* silent */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/users/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifs();
    const id = setInterval(fetchNotifs, 30000);
    return () => clearInterval(id);
  }, [user, location.pathname]);

  const closeAll = () => { setShowProfileMenu(false); setShowNotifMenu(false); };

  return (
    <header
      className="fixed top-0 left-0 right-0 h-14 md:h-16 z-50 flex items-center px-4 md:px-6 shadow-header"
      style={{ background: 'linear-gradient(90deg, #0F2044 0%, #1E3A5F 55%, #1E40AF 100%)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3 relative z-10">
        <button onClick={onMenuClick} className="p-2 -ml-1 hover:bg-white/10 rounded-xl md:hidden text-white/80 transition-colors" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-sm" />
            <img src={logo} alt="Logo" className="relative w-8 h-8 md:w-9 md:h-9 rounded-full object-contain ring-1 ring-white/30" />
          </div>
          <div className="hidden sm:block">
            <p className="text-white font-bold text-sm leading-none tracking-tight">{settings.schoolName}</p>
            <p className="text-blue-300/70 text-[10px] font-medium mt-0.5 uppercase tracking-widest">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Right */}
      <div className="flex items-center gap-1.5 md:gap-2 relative z-10">

        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifMenu((v) => !v); setShowProfileMenu(false); fetchNotifs(); }}
            className={`relative p-2 rounded-xl transition-all ${showNotifMenu ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-black rounded-full border-2 border-[#1E3A5F] flex items-center justify-center px-0.5">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeAll} />
              <div className="fixed inset-x-4 top-[60px] md:absolute md:right-0 md:left-auto md:inset-x-auto md:top-full md:mt-2 w-auto md:w-80 bg-white rounded-2xl shadow-float border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">Notifications</h3>
                    {unreadCount > 0 && <p className="text-[10px] text-secondary">{unreadCount} unread</p>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                      <CheckCheck size={11} /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-[340px] overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                  {notifications.length > 0 ? notifications.map((n) => (
                    <Link key={n._id} to={n.link || '#'} onClick={closeAll}
                      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-blue-50/40 transition-colors relative ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                    >
                      {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r" />}
                      <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${!n.isRead ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Info size={13} />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className={`text-xs leading-snug mb-1 line-clamp-2 ${!n.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-500'}`}>{n.message}</p>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase">
                          <Clock size={9} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </Link>
                  )) : (
                    <div className="py-12 text-center flex flex-col items-center gap-2 opacity-40">
                      <Bell size={32} className="text-slate-400" />
                      <p className="text-xs font-bold uppercase text-slate-500">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfileMenu((v) => !v); setShowNotifMenu(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-white/10 rounded-xl transition-all"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-white/30 bg-white/20 flex items-center justify-center text-white shrink-0">
              {user?.profileImage ? <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User size={18} />}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-white text-xs font-bold leading-none">{user?.name?.split(' ')[0]}</p>
              <p className="text-blue-300/70 text-[10px] capitalize mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown size={13} className={`text-white/50 transition-transform hidden md:block ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={closeAll} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-float border border-slate-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-secondary uppercase font-bold tracking-wide">{user?.role}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { closeAll(); navigate(`/${user.role}/profile`); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors text-left">
                    <User size={15} className="text-primary" /> My Profile
                  </button>
                  <button onClick={() => { closeAll(); logout(); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors text-left">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
