import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, GraduationCap, BookOpen, ClipboardCheck, Bell,
  PlusCircle, AlertTriangle, TrendingUp, UserPlus, ChevronRight
} from 'lucide-react';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSettings } from '../../context/SettingsContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/dashboard-stats')
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  const { overview, recentActivity } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-sm text-secondary font-medium">Overview of school operations & staff performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Online</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}          label="Students"   value={overview.totalStudents}              color="text-primary"  bg="bg-indigo-50" />
        <StatCard icon={GraduationCap}  label="Teachers"   value={overview.totalTeachers}              color="text-success"  bg="bg-green-50" />
        <StatCard icon={BookOpen}       label="Classes"    value={overview.totalClasses}               color="text-warning"  bg="bg-amber-50" />
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${overview.attendancePercentage}%`} color="text-danger"   bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Urgent Action Radar */}
          <Card title="Urgent Action Radar" icon={AlertTriangle} className="border-red-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/students/pending')}
                className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100 group transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-danger shadow-sm">
                    <UserPlus size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">Admissions</p>
                    <p className="text-[10px] font-bold text-danger uppercase">Pending Review</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-danger group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-warning shadow-sm">
                    <TrendingUp size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">Today's Present</p>
                    <p className="text-[10px] font-bold text-warning uppercase">{overview.presentToday} Students</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Shortcut Toolbar */}
          <div className="grid grid-cols-3 gap-4">
            <ShortcutButton icon={UserPlus}   label="Add Student" onClick={() => navigate('/admin/students')} />
            <ShortcutButton icon={PlusCircle} label="Add Teacher" onClick={() => navigate('/admin/teachers')} />
            <ShortcutButton icon={Bell}       label="Broadcast"   onClick={() => navigate('/admin/announcements')} />
          </div>
        </div>

        {/* Activity Log */}
        <Card title="Activity Log" icon={TrendingUp}>
          <div className="space-y-4">
            {recentActivity.notices.length === 0 && recentActivity.homework.length === 0 ? (
              <div className="py-10 text-center flex flex-col items-center justify-center animate-in fade-in duration-500">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <TrendingUp size={24} className="text-gray-300" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Session Clean Slate</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase italic">No activity in {settings.currentAcademicYear} yet</p>
              </div>
            ) : (
              <>
                {recentActivity.notices.map((n, i) => (
                  <div key={`n-${i}`} className="flex items-start gap-3 animate-in slide-in-from-right-2 duration-300">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${n.priority === 'Urgent' ? 'bg-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-primary'}`} />
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{n.title}</p>
                      <p className="text-[10px] text-secondary font-medium uppercase tracking-tight">Notice Broadcasted</p>
                    </div>
                  </div>
                ))}
                {recentActivity.homework.map((hw, i) => (
                  <div key={`h-${i}`} className="flex items-start gap-3 animate-in slide-in-from-right-2 duration-300">
                    <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 bg-success" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1">{hw.title}</p>
                      <p className="text-[10px] text-secondary font-medium uppercase tracking-tight">Homework: Class {hw.classId?.className}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <Card className="flex flex-col items-center justify-center py-6">
    <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center mb-3 shadow-sm`}>
      <Icon size={24} />
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </Card>
);

const ShortcutButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all active:scale-95 group"
  >
    <div className="w-12 h-12 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-black text-gray-600 uppercase text-center tracking-tighter leading-none">{label}</span>
  </button>
);

export default AdminDashboard;
