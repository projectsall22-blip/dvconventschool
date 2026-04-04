import React, { useState, useEffect } from 'react';
import {
  BookOpen, CheckCircle, Clock, Megaphone, Calendar,
  ChevronRight, AlertCircle, TrendingUp, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/users/dashboard')
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load dashboard. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-24"><LoadingSpinner size="lg" /></div>;

  if (error) return (
    <div className="flex flex-col items-center py-24 gap-3">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
        <AlertCircle size={28} className="text-danger" />
      </div>
      <p className="font-semibold text-slate-700">{error}</p>
    </div>
  );

  const { profileSummary, academicFeed, today } = data;
  const attendance = parseFloat(profileSummary.attendancePercentage) || 0;
  const attendanceColor = attendance >= 75 ? 'text-success' : attendance >= 60 ? 'text-warning' : 'text-danger';
  const attendanceBg = attendance >= 75 ? 'from-emerald-500 to-teal-600' : attendance >= 60 ? 'from-amber-500 to-orange-500' : 'from-red-500 to-danger';

  return (
    <div className="space-y-5 animate-in fade-in duration-500">

      {/* Hero Banner */}
      <div
        className="relative rounded-3xl p-6 md:p-8 overflow-hidden shadow-card-lg"
        style={{ background: 'linear-gradient(135deg, #0F2044 0%, #1E3A5F 50%, #1E40AF 100%)' }}
      >
        {/* Orbs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-blue-200/80 text-[10px] font-black uppercase tracking-widest">Student Portal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
              Hey, {user.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-blue-200/70 text-sm font-medium">
              Class {user.class} &nbsp;·&nbsp; UID: {user.UID || 'N/A'}
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="glass rounded-2xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-[9px] font-black text-blue-200/70 uppercase tracking-widest mb-0.5">Attendance</p>
              <p className={`text-xl font-black ${attendanceColor}`}>{profileSummary.attendancePercentage}%</p>
            </div>
            <div className="glass rounded-2xl px-4 py-3 text-center min-w-[80px]">
              <p className="text-[9px] font-black text-blue-200/70 uppercase tracking-widest mb-0.5">Pending HW</p>
              <p className="text-xl font-black text-white">{academicFeed.pendingHomeworkCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatPill icon={CheckCircle} label="Attendance" value={`${profileSummary.attendancePercentage}%`} gradient={attendanceBg} />
        <StatPill icon={BookOpen}    label="Pending HW"  value={academicFeed.pendingHomeworkCount}         gradient="from-amber-500 to-orange-500" />
        <StatPill icon={Clock}       label="Periods"     value={today.schedule.length}                     gradient="from-blue-500 to-blue-700" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Today's Timetable */}
        <Card title="Today's Schedule" icon={Calendar}>
          <div className="space-y-2.5">
            {today.schedule.length > 0 ? (
              <>
                {today.schedule.slice(0, 5).map((period, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                    <span className="text-[10px] font-black text-primary bg-blue-50 border border-blue-100 px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0">
                      {period.startTime}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors truncate">
                      {period.subjectId?.subjectName || 'Break / Assembly'}
                    </p>
                  </div>
                ))}
                <Link to="/student/timetable" className="flex items-center justify-center gap-1.5 w-full text-[10px] font-black text-primary uppercase tracking-widest mt-1 py-2 hover:bg-blue-50 rounded-xl transition-colors">
                  Full Timetable <ChevronRight size={13} />
                </Link>
              </>
            ) : (
              <EmptyState icon={Calendar} message="No classes scheduled today." />
            )}
          </div>
        </Card>

        {/* Announcements */}
        <Card title="Announcements" icon={Megaphone}>
          <div className="space-y-2">
            {today.announcements.length > 0 ? (
              today.announcements.map((item, idx) => (
                <Link to="/student/announcements" key={idx}
                  className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    item.priority === 'Urgent' ? 'bg-danger animate-pulse shadow-[0_0_6px_rgba(220,38,38,0.5)]' : 'bg-primary'
                  }`} />
                  <div className="flex-grow min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-secondary line-clamp-1 mt-0.5">{item.message}</p>
                  </div>
                  <ChevronRight size={13} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                </Link>
              ))
            ) : (
              <EmptyState icon={Megaphone} message="No announcements yet." />
            )}
          </div>
        </Card>
      </div>

      {/* Homework Feed */}
      {academicFeed.pendingHomeworkCount > 0 && (
        <Card title="Homework" icon={BookOpen}
          action={
            <Link to="/student/homework" className="text-[10px] font-black text-primary uppercase tracking-wide hover:underline flex items-center gap-1">
              View All <ChevronRight size={11} />
            </Link>
          }
        >
          <div className="flex items-center gap-4 p-4 bg-amber-50/60 rounded-xl border border-amber-100">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                {academicFeed.pendingHomeworkCount} pending assignment{academicFeed.pendingHomeworkCount !== 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-secondary mt-0.5">Tap to view and submit</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const StatPill = ({ icon: Icon, label, value, gradient }) => (
  <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-md hover:-translate-y-0.5 transition-transform duration-200 overflow-hidden relative`}>
    <div className="absolute -right-3 -top-3 w-14 h-14 bg-white/10 rounded-full" />
    <Icon size={16} className="text-white/70 mb-2 relative z-10" />
    <p className="text-[9px] font-black text-white/70 uppercase tracking-widest relative z-10">{label}</p>
    <p className="text-lg font-black text-white relative z-10">{value}</p>
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="py-10 text-center flex flex-col items-center gap-2">
    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center">
      <Icon size={22} className="text-slate-300" />
    </div>
    <p className="text-xs font-semibold text-slate-400">{message}</p>
  </div>
);

export default StudentDashboard;
