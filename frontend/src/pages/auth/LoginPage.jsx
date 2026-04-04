import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Eye, EyeOff, Lock, User, Hash, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import logo from '../../assets/school_logo.png';

const roleConfig = {
  student: {
    title: 'Student Login',
    subtitle: 'Access your academic portal',
    identifierLabel: 'Student UID',
    identifierKey: 'UID',
    placeholder: 'e.g. 2024001',
    icon: Hash,
    inputMode: 'numeric',
    apiPath: '/auth/student-login',
    accent: 'from-blue-500 to-blue-700',
    badge: 'Student',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  teacher: {
    title: 'Teacher Login',
    subtitle: 'Access your staff portal',
    identifierLabel: 'Employee Code',
    identifierKey: 'employeeCode',
    placeholder: 'e.g. TCH102',
    icon: User,
    inputMode: 'text',
    apiPath: '/auth/teacher-login',
    accent: 'from-emerald-500 to-teal-600',
    badge: 'Staff',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  admin: {
    title: 'Admin Login',
    subtitle: 'Access the control panel',
    identifierLabel: 'Email Address',
    identifierKey: 'email',
    placeholder: 'admin@school.com',
    icon: Mail,
    inputMode: 'email',
    apiPath: '/auth/admin-login',
    accent: 'from-violet-500 to-purple-700',
    badge: 'Admin',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
};

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const config = roleConfig[role] || roleConfig.student;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await API.post(config.apiPath, data);
      const { token, ...userData } = res.data;
      login(userData, token);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0F2044 0%, #1E3A5F 45%, #1E40AF 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none opacity-15"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-400">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-float overflow-hidden">

          {/* Header */}
          <div className={`bg-gradient-to-r ${config.accent} p-7 pb-8 relative overflow-hidden`}>
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium"
              >
                <ArrowLeft size={16} /> Back
              </button>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
                  <img src={logo} alt="Logo" className="relative w-12 h-12 rounded-full object-contain ring-1 ring-white/30" />
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/20 text-white px-2.5 py-1 rounded-full mb-1`}>
                    <ShieldCheck size={10} /> {config.badge}
                  </div>
                  <h1 className="text-xl font-black text-white tracking-tight leading-none">{config.title}</h1>
                  <p className="text-white/60 text-xs mt-0.5">{config.subtitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-7 space-y-5">
            <Input
              label={config.identifierLabel}
              icon={config.icon}
              placeholder={config.placeholder}
              inputMode={config.inputMode}
              required
              {...register(config.identifierKey, { required: `${config.identifierLabel} is required` })}
              error={errors[config.identifierKey]?.message}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              placeholder="Enter your password"
              required
              suffix={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-slate-400 hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
              error={errors.password?.message}
            />

            <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-2">
              Sign In
            </Button>

            <div className="text-center">
              <button
                type="button"
                className="text-xs font-semibold text-secondary hover:text-primary transition-colors"
                onClick={() => alert('Please contact the school office to reset your password.')}
              >
                Forgot password?
              </button>
            </div>

            {role === 'student' && (
              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-secondary mb-2">New student?</p>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-xs font-black text-primary hover:underline"
                >
                  Apply for Admission
                </button>
              </div>
            )}
          </form>

          <div className="px-7 pb-6 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Secured by DV Convent School System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
