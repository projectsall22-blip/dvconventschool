import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Eye, EyeOff, Lock, User, Hash, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Toast from '../../components/common/Toast';

/* ── Reusable field with left icon ── */
const Field = ({ label, icon: Icon, error, rightEl, ...props }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-gray-700">{label}</label>
    <div className={`flex items-center gap-3 border rounded-xl px-4 h-14 bg-gray-50 transition-all
      ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-indigo-400 focus-within:bg-white'}`}>
      {Icon && <Icon size={18} className="text-gray-400 shrink-0" />}
      <input
        className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium"
        {...props}
      />
      {rightEl}
    </div>
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);

const LoginPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const roleConfig = {
    student: {
      title: 'Student Login',
      identifierLabel: 'UID',
      identifierKey: 'UID',
      placeholder: 'e.g. 2024001',
      icon: Hash,
      inputMode: 'numeric',
      apiPath: '/auth/student-login',
    },
    teacher: {
      title: 'Teacher Login',
      identifierLabel: 'Employee Code',
      identifierKey: 'employeeCode',
      placeholder: 'e.g. TCH102',
      icon: User,
      inputMode: 'text',
      apiPath: '/auth/teacher-login',
    },
    admin: {
      title: 'Admin Login',
      identifierLabel: 'Email or Username',
      identifierKey: 'email',
      placeholder: 'admin@dv.com',
      icon: Mail,
      inputMode: 'email',
      apiPath: '/auth/admin-login',
    },
  };

  const config = roleConfig[role] || roleConfig.student;
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.post(config.apiPath, data);
      const { token, ...userData } = response.data;
      login(userData, token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#eef2f7' }}>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-6">

        {/* Back */}
        <button onClick={() => navigate('/')}
          className="p-1.5 -ml-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
          <ArrowLeft size={22} />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-gray-900">{config.title}</h1>
          <p className="text-sm text-gray-500">Enter your credentials to access your dashboard.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <Field
            label={config.identifierLabel}
            icon={config.icon}
            placeholder={config.placeholder}
            inputMode={config.inputMode}
            error={errors[config.identifierKey]?.message}
            {...register(config.identifierKey, {
              required: `${config.identifierLabel} is required`,
            })}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className={`flex items-center gap-3 border rounded-xl px-4 h-14 bg-gray-50 transition-all
              ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-indigo-400 focus-within:bg-white'}`}>
              <Lock size={18} className="text-gray-400 shrink-0" />
              <input
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium min-w-0"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
          </div>

          {/* Login Button */}
          <button type="submit" disabled={isLoading}
            className="w-full h-14 rounded-xl font-bold text-white text-base transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            {isLoading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Login to System'}
          </button>

          {/* Forgot Password */}
          <div className="text-center pt-1">
            <button type="button"
              className="text-sm font-bold text-gray-700 hover:text-indigo-600 transition-colors"
              onClick={() => alert('Please contact the school office to reset your password.')}>
              Forgot Password?
            </button>
          </div>

          {/* Registration — student only */}
          {role === 'student' && (
            <div className="pt-4 border-t border-gray-100 text-center space-y-1">
              <p className="text-sm text-gray-500">New to DV Convent?</p>
              <button type="button" onClick={() => navigate('/register')}
                className="text-sm font-black text-indigo-600 hover:underline">
                Registration
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 font-medium pt-2">
          Protected by DV Convent Security System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
