import { useState, useEffect } from 'react';
import { Search, Download, Users, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../api/axios';
import { useSettings } from '../../context/SettingsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import schoolLogo from '../../assets/school_logo.png';
import signImage from '../../assets/sign.png';
import { downloadCards } from '../../utils/idCardDownload';

const CARD_W_PX = 204;
const CARD_H_PX = 323;

const cardBase = {
  width: CARD_W_PX, height: CARD_H_PX,
  minWidth: CARD_W_PX, maxWidth: CARD_W_PX,
  minHeight: CARD_H_PX, maxHeight: CARD_H_PX,
  fontFamily: 'Arial, Helvetica, sans-serif',
  borderRadius: 12, overflow: 'hidden',
  display: 'flex', flexDirection: 'column',
  background: '#fff',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  flexShrink: 0, position: 'relative',
};

// ─── StudentCard preview ──────────────────────────────────────────────────────
const StudentCard = ({ student, settings }) => {
  const dob        = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A';
  const contact    = student.fatherMobile || student.guardianMobile || 'N/A';
  const parentName = student.fatherName   || student.guardianName   || 'N/A';

  return (
    <div style={cardBase}>
      {/* ── Header — taller, bigger logo + text ── */}
      <div style={{
        background: 'linear-gradient(135deg,#1a2e6e,#1e3a8a)',
        padding: '6px 8px',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
        minHeight: 60,        // ← taller header
      }}>
        {/* Logo 48px (was 32px) */}
        <img
          src={settings.schoolLogo || schoolLogo} alt="logo"
          style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* School name 13px (was 9px) */}
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 10, letterSpacing: '0.3px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {settings.schoolName || 'D V CONVENT SCHOOL'}
          </div>
          {/* Address 9px (was 6.5px) */}
          <div style={{ color: '#cbd5e1', fontSize: 8, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {settings.schoolAddress || 'Akodha,Rohi,Bhadohi-221308'}
          </div>
          {/* Phone 9px (was 6.5px) */}
          <div style={{ color: '#fbbf24', fontSize: 8, lineHeight: 1.4 }}>
            📞 {settings.contactNumber || '0000000000'}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ background: 'linear-gradient(180deg,#dbeafe 0%,#eff6ff 60%,#fff 100%)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 8px 0', gap: 4 }}>
        {/* Photo */}
        <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #1e3a8a', overflow: 'hidden', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {student.profileImage
            ? <img src={student.profileImage} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 22, fontWeight: 900, color: '#1e3a8a' }}>{student.name?.charAt(0)}</span>}
        </div>
        {/* Name */}
        <div style={{ padding: '2px 8px' }}>
          <span style={{ color: '#1e3a8a', fontWeight: 900, fontSize: 11, letterSpacing: '0.3px' }}>{student.name}</span>
        </div>
        {/* UID */}
        <div style={{ border: '1.5px solid #ca8a04', borderRadius: 6, padding: '2px 10px', background: '#fefce8' }}>
          <span style={{ color: '#92400e', fontWeight: 900, fontSize: 7.5 }}>UID : {student.UID || 'N/A'}</span>
        </div>
        {/* Info rows */}
        <div style={{ width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {[['FATHER', parentName], ['D.O.B', dob], ['CLASS', student.class], ['MOBILE', contact], ['ADDRESS', student.address]].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
              <span style={{ color: '#1e3a8a', fontWeight: 900, fontSize: 6, width: 38, flexShrink: 0, letterSpacing: '0.3px' }}>{label}:</span>
              <span style={{ fontSize: 6.5, fontWeight: 700, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px dashed #cbd5e1', padding: '4px 8px 3px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0, background: '#fff' }}>
        <div>
          <div style={{ fontSize: 5.5, fontWeight: 900, color: '#6b7280', letterSpacing: '0.3px' }}>SESSION:</div>
          <div style={{ fontSize: 6, fontWeight: 900, color: '#374151' }}>{settings.currentAcademicYear || '2025-26'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={signImage} alt="sign" style={{ height: 18, objectFit: 'contain' }} />
          <div style={{ borderTop: '1px solid #374151', fontSize: 5.5, fontWeight: 900, color: '#374151', letterSpacing: '0.5px', paddingTop: 1 }}>PRINCIPAL</div>
        </div>
      </div>

      {/* ── Strip ── */}
      <div style={{ background: '#1e3a8a', padding: '7px 0', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 7, fontWeight: 700, letterSpacing: '0.5px' }}>If found, please return to school</span>
      </div>
    </div>
  );
};

// ─── TeacherCard preview ──────────────────────────────────────────────────────
const TeacherCard = ({ teacher, settings }) => {
  const dob = teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString('en-GB') : 'N/A';

  return (
    <div style={cardBase}>
      <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#991b1b)', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, minHeight: 72 }}>
        <img src={settings.schoolLogo || schoolLogo} alt="logo" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 10, letterSpacing: '0.3px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.schoolName || 'D V CONVENT SCHOOL'}</div>
          <div style={{ color: '#fca5a5', fontSize: 8, lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings.schoolAddress || 'Akodha,Rohi,Bhadohi-221308'}</div>
          <div style={{ color: '#fbbf24', fontSize: 8, lineHeight: 1.4 }}>📞 {settings.contactNumber || '0000000000'}</div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(180deg,#fee2e2 0%,#fff5f5 60%,#fff 100%)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 8px 0', gap: 4 }}>
        <div style={{ width: 56, height: 56, borderRadius: 8, border: '3px solid #991b1b', overflow: 'hidden', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {teacher.profileImage
            ? <img src={teacher.profileImage} alt="photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 22, fontWeight: 900, color: '#991b1b' }}>{teacher.name?.charAt(0)}</span>}
        </div>
        <div style={{ fontWeight: 900, fontSize: 9, color: '#1f2937', textAlign: 'center' }}>{teacher.name}</div>
        <div style={{ background: '#7f1d1d', borderRadius: 6, padding: '2px 10px' }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 7.5 }}>ID : {teacher.employeeCode || 'N/A'}</span>
        </div>
        <div style={{ width: '100%', borderTop: '1px solid #fecaca', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {[['D.O.B', dob], ['PHONE', teacher.phone], ['QUAL.', teacher.qualifications], ['EXP.', teacher.experience ? `${teacher.experience} yrs` : 'N/A'], ['ADDRESS', teacher.address]].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
              <span style={{ color: '#991b1b', fontWeight: 900, fontSize: 6, width: 38, flexShrink: 0, letterSpacing: '0.3px' }}>{label}:</span>
              <span style={{ fontSize: 6.5, fontWeight: 700, color: '#111827', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'N/A'}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #fca5a5', padding: '4px 8px 3px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0, background: '#fff' }}>
        <div>
          <div style={{ fontSize: 5.5, fontWeight: 900, color: '#6b7280', letterSpacing: '0.3px' }}>SESSION:</div>
          <div style={{ fontSize: 6, fontWeight: 900, color: '#374151' }}>{settings.currentAcademicYear || '2025-26'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={signImage} alt="sign" style={{ height: 18, objectFit: 'contain' }} />
          <div style={{ borderTop: '1px solid #374151', fontSize: 5.5, fontWeight: 900, color: '#374151', letterSpacing: '0.5px', paddingTop: 1 }}>PRINCIPAL</div>
        </div>
      </div>

      <div style={{ background: '#7f1d1d', padding: '7px 0', textAlign: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontSize: 7, fontWeight: 700, letterSpacing: '0.5px' }}>TEACHING STAFF</span>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const IDCardGenerator = () => {
  const { settings } = useSettings();
  const [tab, setTab]               = useState('student');
  const [search, setSearch]         = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState(null);
  const [selected, setSelected]     = useState(new Set());
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({});
  const [printing, setPrinting]     = useState(false);
  const [progress, setProgress]     = useState({ current: 0, total: 0 });

  useEffect(() => {
    const t = setTimeout(fetchData, 300);
    return () => clearTimeout(t);
  }, [tab, search, classFilter, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 'student') {
        const res = await API.get('/admin/students', { params: { search, studentClass: classFilter, status: 'active', page, limit: 20 } });
        setItems(res.data.students); setPagination(res.data.pagination);
      } else {
        const res = await API.get('/admin/teachers', { params: { search, status: 'active', page, limit: 20 } });
        setItems(res.data.teachers); setPagination(res.data.pagination);
      }
    } catch { setToast({ message: 'Failed to load data', type: 'error' }); }
    finally   { setLoading(false); }
  };

  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll    = () => selected.size === items.length ? setSelected(new Set()) : setSelected(new Set(items.map(i => i._id)));
  const selectedItems = items.filter(i => selected.has(i._id));

  const handleDownload = async () => {
    if (!selectedItems.length) { setToast({ message: 'Select at least one card', type: 'error' }); return; }
    setPrinting(true);
    setProgress({ current: 0, total: selectedItems.length });
    setToast({ message: selectedItems.length === 1 ? 'Preparing PNG…' : 'Preparing ZIP…', type: 'success' });
    try {
      await downloadCards(selectedItems, tab, settings, schoolLogo, signImage,
        (current, total) => setProgress({ current, total }));
      setToast({ message: selectedItems.length === 1 ? 'PNG downloaded!' : `ZIP downloaded (${selectedItems.length} cards)!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Download failed: ' + err.message, type: 'error' });
    } finally {
      setPrinting(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleTabChange = (t) => { setTab(t); setSearch(''); setClassFilter(''); setSelected(new Set()); setPage(1); };
  const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">ID Card Generator</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">CR-80 standard • 54mm × 85.6mm</p>
        </div>
        <button onClick={handleDownload} disabled={printing}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm">
          <Download size={16} />
          {printing
            ? progress.total > 1 ? `Processing ${progress.current}/${progress.total}…` : 'Processing…'
            : selectedItems.length > 1 ? `Download ZIP (${selectedItems.length})` : `Download PNG (${selectedItems.length})`}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {[['student', 'Students', <Users size={14} />], ['teacher', 'Teachers', <GraduationCap size={14} />]].map(([t, label, icon]) => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t ? `bg-white ${t === 'student' ? 'text-indigo-700' : 'text-red-700'} shadow-sm` : 'text-gray-500 hover:text-gray-700'}`}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] bg-gray-50 rounded-xl px-3 h-10 border border-gray-100">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input className="bg-transparent text-sm font-medium outline-none w-full placeholder:text-gray-400"
            placeholder={tab === 'student' ? 'Search name or UID...' : 'Search name or code...'}
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {tab === 'student' && (
          <select className="h-10 bg-gray-50 border border-gray-100 rounded-xl px-3 text-xs font-bold outline-none"
            value={classFilter} onChange={e => { setClassFilter(e.target.value); setPage(1); }}>
            <option value="">All Classes</option>
            {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        )}
        <button onClick={toggleAll}
          className="h-10 px-4 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-100">
          {selected.size === items.length && items.length > 0 ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="py-20 text-center text-gray-400 font-medium">No records found</div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {items.map(item => (
            <div key={item._id} onClick={() => toggleSelect(item._id)} style={{ cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
              <div style={{ position: 'absolute', inset: -3, borderRadius: 15, border: selected.has(item._id) ? '3px solid #4f46e5' : '3px solid transparent', transition: 'border-color 0.15s', pointerEvents: 'none', zIndex: 10 }} />
              {selected.has(item._id) && (
                <div style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, zIndex: 20, boxShadow: '0 2px 6px rgba(79,70,229,0.4)' }}>✓</div>
              )}
              {tab === 'student' ? <StudentCard student={item} settings={settings} /> : <TeacherCard teacher={item} settings={settings} />}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 shadow-sm"><ChevronLeft size={18} /></button>
          <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Page {page} / {pagination.totalPages}</span>
          <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)} className="p-2 bg-white border border-gray-200 rounded-xl disabled:opacity-30 shadow-sm"><ChevronRight size={18} /></button>
        </div>
      )}
    </div>
  );
};

export default IDCardGenerator;