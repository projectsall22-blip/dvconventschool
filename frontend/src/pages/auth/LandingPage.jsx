import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import logo from '../../assets/school_logo.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const roles = [
    {
      title: 'Student & Parent',
      description: 'Check your attendance, homework, and academic performance.',
      icon: Users,
      path: '/login/student',
      color: 'bg-primary',
      blobColor: 'bg-indigo-500',
      textColor: 'text-primary',
      cta: 'Access Portal',
    },
    {
      title: 'Teacher Portal',
      description: 'Manage your classes, mark attendance, and enter student marks.',
      icon: GraduationCap,
      path: '/login/teacher',
      color: 'bg-success',
      blobColor: 'bg-green-500',
      textColor: 'text-success',
      cta: 'Staff Login',
    },
    {
      title: 'Administration',
      description: 'Manage school operations, staff, students, and generate reports.',
      icon: ShieldCheck,
      path: '/login/admin',
      color: 'bg-purple-600',
      blobColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      cta: 'Admin Dashboard',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">

      {/* Hero */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="max-w-3xl mx-auto space-y-4">

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 blur-md opacity-30 scale-110" />
              <img src={logo} alt="DV Convent School Logo"
                className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 object-contain drop-shadow-xl rounded-full" />
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {settings.schoolName || 'DV Convent School'}
            </h1>
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-orange-600 tracking-wide">
              {settings.schoolSlogan || 'शिक्षार्थ आइए, सेवार्थ जाइए'}
            </h2>
          </div>

          <div className="flex items-center justify-center gap-3 py-2">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-gray-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-gray-300" />
          </div>

          <div className="max-w-md mx-auto text-center">
            <p className="text-gray-600 font-medium text-sm md:text-base leading-relaxed">
              Welcome to our School Management System.<br />
              Please select your role to continue.
            </p>
          </div>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {roles.map((role, i) => (
          <button key={i} onClick={() => navigate(role.path)}
            className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden">
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full transition-transform group-hover:scale-150 duration-500 opacity-10 ${role.blobColor}`} />
            <div className={`relative w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
              <role.icon size={32} />
            </div>
            <div className="relative">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{role.title}</h2>
              <p className="text-secondary text-sm leading-relaxed mb-6">{role.description}</p>
              <div className={`flex items-center gap-2 font-bold text-sm ${role.textColor}`}>
                {role.cta}
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <footer className="mt-16 text-center">
        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">
          Academic Session {settings.currentAcademicYear}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
