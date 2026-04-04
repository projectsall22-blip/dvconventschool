import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import logo from '../../assets/school_logo.png';

const roles = [
  {
    title: 'Student Portal',
    description: 'View attendance, homework, marks and your timetable.',
    icon: Users,
    path: '/login/student',
    gradient: 'from-blue-500 to-blue-700',
    ring: 'ring-blue-200',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    cta: 'Student Login',
    dot: 'bg-blue-400',
  },
  {
    title: 'Teacher Portal',
    description: 'Manage classes, mark attendance and enter student marks.',
    icon: GraduationCap,
    path: '/login/teacher',
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    cta: 'Staff Login',
    dot: 'bg-emerald-400',
    featured: true,
  },
  {
    title: 'Administration',
    description: 'Full school management — staff, students, reports and settings.',
    icon: ShieldCheck,
    path: '/login/admin',
    gradient: 'from-violet-500 to-purple-700',
    ring: 'ring-violet-200',
    badge: 'bg-violet-50 text-violet-700 border-violet-100',
    cta: 'Admin Dashboard',
    dot: 'bg-violet-400',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-5 md:p-8"
      style={{ background: 'linear-gradient(135deg, #0F2044 0%, #1E3A5F 45%, #1E40AF 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Hero */}
      <div className="relative z-10 text-center mb-10 md:mb-14 animate-in fade-in slide-in-from-top-6 duration-700">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-xl scale-125" />
            <div className="absolute inset-0 rounded-full bg-white/10 blur-md" />
            <img
              src={logo}
              alt="School Logo"
              className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain rounded-full ring-2 ring-white/25 shadow-2xl"
            />
          </div>
        </div>

        {/* School name */}
        <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
          <Sparkles size={12} className="text-amber-300" />
          <span className="text-amber-200 text-xs font-bold uppercase tracking-widest">School Management System</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2">
          {settings.schoolName || 'DV Convent School'}
        </h1>
        <p className="text-amber-300/90 text-base sm:text-lg font-semibold tracking-wide mb-4">
          {settings.schoolSlogan || 'शिक्षार्थ आइए, सेवार्थ जाइए'}
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/25" />
        </div>
      </div>

      {/* Role cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
        {roles.map((role, i) => (
          <button
            key={i}
            onClick={() => navigate(role.path)}
            className={`group relative bg-white rounded-3xl p-7 text-left overflow-hidden transition-all duration-300
              hover:-translate-y-2 hover:shadow-float active:scale-[0.98]
              ${role.featured ? 'ring-2 ring-emerald-300/60 shadow-glow-green' : 'shadow-xl'}
            `}
          >
            {/* Featured badge */}
            {role.featured && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                Staff
              </div>
            )}

            {/* BG decoration */}
            <div className={`absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br ${role.gradient} opacity-8 group-hover:opacity-12 group-hover:scale-125 transition-all duration-500`} />

            {/* Icon */}
            <div className={`relative w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
              <role.icon size={28} />
            </div>

            {/* Text */}
            <h2 className="text-lg font-black text-slate-900 mb-1.5 tracking-tight">{role.title}</h2>
            <p className="text-secondary text-sm leading-relaxed mb-5">{role.description}</p>

            {/* CTA */}
            <div className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide border rounded-full px-3.5 py-1.5 ${role.badge} transition-all group-hover:gap-3`}>
              <div className={`w-1.5 h-1.5 rounded-full ${role.dot}`} />
              {role.cta}
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-10 text-center">
        <p className="text-blue-300/50 text-[10px] font-bold uppercase tracking-widest">
          Academic Session {settings.currentAcademicYear}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
