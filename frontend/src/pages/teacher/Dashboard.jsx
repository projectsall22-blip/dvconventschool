import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardCheck, BookMarked, Trophy, AlertCircle, CheckCircle2, 
  Clock, ChevronRight, PlusCircle, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get('/teacher/dashboard');
        setData(res.data);
      } catch (err) {
        console.error("Dashboard Load Error");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  if (!data) return null;

  const { schedule, alerts, myAssignments } = data;
  const hasAlerts = alerts.attendanceRequired.length > 0 || alerts.marksEntryRequired.length > 0;
  const totalTasks = alerts.attendanceRequired.length + alerts.marksEntryRequired.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#0F2044] via-[#1E3A5F] to-[#1E40AF] rounded-3xl p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-sky-400/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-amber-300 fill-amber-300" />
              <span className="text-blue-200 text-xs font-bold uppercase tracking-widest">Teacher Portal</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">
              Hello, {user.name.split(' ')[0]}! 👋
            </h2>
            <p className="text-blue-200 text-sm font-medium">
              {schedule.length} {schedule.length === 1 ? 'class' : 'classes'} scheduled today
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20 text-center">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Assignments</p>
              <p className="text-xl font-black text-white">{myAssignments.length}</p>
            </div>
            <div className={`backdrop-blur-sm rounded-2xl px-4 py-3 border text-center ${totalTasks > 0 ? 'bg-red-500/20 border-red-400/30' : 'bg-white/10 border-white/20'}`}>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-black text-white">{totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <QuickAction icon={ClipboardCheck} label="Attendance" color="from-emerald-500 to-teal-600"   onClick={() => navigate('/teacher/attendance')} />
        <QuickAction icon={PlusCircle}     label="Homework"   color="from-amber-500 to-orange-500"   onClick={() => navigate('/teacher/homework')} />
        <QuickAction icon={Trophy}         label="Marks"      color="from-violet-500 to-purple-700"  onClick={() => navigate('/teacher/marks')} />
      </div>

      {/* Alerts */}
      <Card title="Action Items" icon={AlertCircle}>
        <div className="space-y-3">
          {hasAlerts ? (
            <>
              {alerts.attendanceRequired.map((className, idx) => (
                <AlertRow key={`att-${idx}`} message={`Attendance pending for Class ${className}`} onClick={() => navigate('/teacher/attendance')} />
              ))}
              {alerts.marksEntryRequired.map((item, idx) => (
                <AlertRow key={`mark-${idx}`} message={`${item.examName} marks pending: ${item.class} (${item.subject})`} onClick={() => navigate('/teacher/marks')} />
              ))}
            </>
          ) : (
            <div className="py-8 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-50 text-success rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={26} />
              </div>
              <p className="text-sm font-bold text-slate-500">All caught up for today!</p>
            </div>
          )}
        </div>
      </Card>

      {/* Today's Schedule */}
      <Card title="Today's Schedule" icon={Clock}>
        <div className="space-y-3">
          {schedule && schedule.length > 0 ? (
            schedule.map((period, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition-colors">
                <div className="text-center w-14 shrink-0">
                  <p className="text-xs font-black text-primary">{period.startTime}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{period.endTime}</p>
                </div>
                <div className="w-px h-8 bg-slate-200 shrink-0" />
                <div className="flex-grow">
                  <p className="text-sm font-black text-slate-900">{period.subjectName}</p>
                  <p className="text-[10px] font-bold text-secondary uppercase">Class {period.className}</p>
                </div>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-primary text-[10px] font-black border border-blue-100 shrink-0">
                  P{period.periodNumber}
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center flex flex-col items-center gap-2 opacity-40">
              <Clock size={32} className="text-slate-400" />
              <p className="text-sm font-bold uppercase italic text-slate-500">No classes today.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const QuickAction = ({ icon: Icon, label, color, onClick }) => (
  <button onClick={onClick} className="group flex flex-col items-center gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all active:scale-95">
    <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
      <Icon size={22} />
    </div>
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{label}</span>
  </button>
);

const AlertRow = ({ message, onClick }) => (
  <div onClick={onClick} className="flex items-center justify-between p-3.5 bg-red-50 border border-red-100 rounded-xl cursor-pointer hover:bg-red-100/50 transition-colors group">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-danger rounded-full animate-pulse shrink-0" />
      <p className="text-xs font-bold text-slate-700">{message}</p>
    </div>
    <ChevronRight size={14} className="text-danger group-hover:translate-x-1 transition-transform shrink-0" />
  </div>
);

export default TeacherDashboard;
