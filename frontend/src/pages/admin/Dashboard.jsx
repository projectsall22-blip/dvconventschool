import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, ClipboardCheck, Bell,
  PlusCircle, AlertTriangle, TrendingUp,
  UserPlus, Activity, Sparkles, ArrowUpRight
} from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard-stats')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-24"><LoadingSpinner size="lg" /></div>;

  const { overview, recentActivity } = data;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* Hero */}
      <div
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden shadow-card-lg"
        style={{ background: 'linear-gradient(135deg, #0F2044 0%, #1E3A5F 50%, #1E40AF 100%)' }}
      >
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-violet-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-amber-300" />
              <span className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-blue-200/70 text-sm font-medium">{settings.schoolName} — Command Center</p>
          </div>

          <div className="flex items-center gap-2 glass rounded-2xl px-4 py-2.5 self-start sm:self-auto">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">System Online</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}          label="Total Students"  value={overview.totalStudents}              gradient="from-blue-500 to-blue-700"     />
        <StatCard icon={GraduationCap}  label="Teachers"        value={overview.totalTeachers}              gradient="from-emerald-500 to-teal-600"  />
        <StatCard icon={BookOpen}       label="Classes"         value={overview.totalClasses}               gradient="from-amber-500 to-orange-600"  />
        <StatCard icon={ClipboardCheck} label="Attendance"      value={`${overview.attendancePercentage}%`} gradient="from-violet-500 to-purple-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">

          {/* Action Required */}
          <Card title="Action Required" icon={AlertTriangle}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionCard
                icon={UserPlus}
                title="Pending Admissions"
                sub="Review applications"
                color="red"
                onClick={() => navigate('/admin/students/pending')}
              />
              <ActionCard
                icon={Activity}
                title="Today's Attendance"
                sub={`${overview.presentToday} students present`}
                color="amber"
                onClick={() => navigate('/admin/attendance')}
              />
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions" icon={Sparkles}>
            <div className="grid grid-cols-3 gap-3">
              <QuickBtn icon={UserPlus}   label="Add Student"  onClick={() => navigate('/admin/students')}      gradient="from-blue-500 to-blue-700" />
              <QuickBtn icon={PlusCircle} label="Add Teacher"  onClick={() => navigate('/admin/teachers')}      gradient="from-emerald-500 to-teal-600" />
              <QuickBtn icon={Bell}       label="Broadcast"    onClick={() => navigate('/admin/announcements')} gradient="from-violet-500 to-purple-700" />
            </div>
          </Card>
        </div>

        {/* Activity Log */}
        <Card title="Recent Activity" icon={TrendingUp}>
          <div className="space-y-3">
            {recentActivity.notices.length === 0 && recentActivity.homework.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <TrendingUp size={22} className="text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-400">No recent activity</p>
              </div>
            ) : (
              <>
                {recentActivity.notices.map((n, i) => (
                  <ActivityRow key={`n-${i}`} dot={n.priority === 'Urgent' ? 'bg-danger' : 'bg-primary'} title={n.title} sub="Notice Broadcasted" />
                ))}
                {recentActivity.homework.map((hw, i) => (
                  <ActivityRow key={`h-${i}`} dot="bg-success" title={hw.title} sub={`Homework · Class ${hw.classId?.className}`} />
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-5 text-white shadow-card-lg overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
    <div className="absolute -right-5 -top-5 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-500" />
    <div className="relative z-10">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
        <Icon size={19} className="text-white" />
      </div>
      <p className="text-white/70 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ icon: Icon, title, sub, color, onClick }) => {
  const colors = {
    red:   { bg: 'from-red-50 to-rose-50', border: 'border-red-100', icon: 'bg-white text-danger border-red-100', text: 'text-danger' },
    amber: { bg: 'from-amber-50 to-yellow-50', border: 'border-amber-100', icon: 'bg-white text-warning border-amber-100', text: 'text-warning' },
  };
  const c = colors[color];
  return (
    <button
      onClick={onClick}
      className={`group flex items-center justify-between p-4 bg-gradient-to-br ${c.bg} rounded-2xl border ${c.border} hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98] w-full text-left`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center shadow-sm border`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className={`text-[10px] font-bold ${c.text} uppercase tracking-wide`}>{sub}</p>
        </div>
      </div>
      <ArrowUpRight size={16} className={`${c.text} group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0`} />
    </button>
  );
};

const QuickBtn = ({ icon: Icon, label, onClick, gradient }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center justify-center gap-2.5 p-4 bg-white border border-slate-100 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all active:scale-[0.97]"
  >
    <div className={`w-11 h-11 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
      <Icon size={20} />
    </div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight text-center leading-tight">{label}</span>
  </button>
);

const ActivityRow = ({ dot, title, sub }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{title}</p>
      <p className="text-[10px] text-secondary font-medium uppercase tracking-tight mt-0.5">{sub}</p>
    </div>
  </div>
);

export default AdminDashboard;
