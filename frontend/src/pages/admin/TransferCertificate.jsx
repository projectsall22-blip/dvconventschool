import { useState, useEffect } from 'react';
import { Search, Download, FileText, Clock, AlertTriangle } from 'lucide-react';
import API from '../../api/axios';
import { useSettings } from '../../context/SettingsContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Toast from '../../components/common/Toast';
import schoolLogo from '../../assets/school_logo.png';
import signImage from '../../assets/sign.png';

const CLASSES = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8'];

// A4 at 96 dpi
const A4_W = 794;
const A4_H = 1123;

const loadImg = (src) =>
  new Promise((res) => {
    if (!src) return res(null);
    // For remote URLs, fetch as blob to avoid CORS taint on canvas
    if (src.startsWith('http://') || src.startsWith('https://')) {
      fetch(src)
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload  = () => { URL.revokeObjectURL(url); res(img); };
          img.onerror = () => { URL.revokeObjectURL(url); res(null); };
          img.src = url;
        })
        .catch(() => res(null));
      return;
    }
    const img = new Image();
    img.onload  = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

// ─── Canvas draw ──────────────────────────────────────────────────────────────
const drawTC = async (student, settings, tcData, logoSrc, signSrc, isDuplicate = false) => {
  const canvas = document.createElement('canvas');
  canvas.width  = A4_W;
  canvas.height = A4_H;
  const ctx = canvas.getContext('2d');

  // Try remote logo first, fall back to local asset if it fails
  let logoImg = settings.schoolLogo ? await loadImg(settings.schoolLogo) : null;
  if (!logoImg) logoImg = await loadImg(logoSrc);
  const signImg = await loadImg(signSrc);

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, A4_W, A4_H);

  // Outer border + inner border
  ctx.strokeStyle = '#1a2e6e';
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, A4_W - 24, A4_H - 24);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(22, 22, A4_W - 44, A4_H - 44);

  const PAD = 56;
  const cx  = A4_W / 2;
  let y = 38;

  // ── Logo (centered, circular) ──
  const logoSz = 86;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, y + logoSz / 2, logoSz / 2 + 3, 0, Math.PI * 2);
  ctx.strokeStyle = '#1a2e6e';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, y + logoSz / 2, logoSz / 2, 0, Math.PI * 2);
  ctx.clip();
  if (logoImg) ctx.drawImage(logoImg, cx - logoSz / 2, y, logoSz, logoSz);
  else { ctx.fillStyle = '#e0e7ff'; ctx.fillRect(cx - logoSz / 2, y, logoSz, logoSz); }
  ctx.restore();
 y += logoSz + 32;

  // ── School name ──
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1a2e6e';
  ctx.font = `900 28px "Times New Roman", serif`;
  ctx.fillText(settings.schoolName || 'D V CONVENT SCHOOL', cx, y);
  y += 8;

  // Thin decorative divider
  const dw = 220;
  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - dw / 2, y + 4); ctx.lineTo(cx + dw / 2, y + 4); ctx.stroke();
  y += 16;

  // ── Address ──
  ctx.font = `400 15px "Times New Roman", serif`;
  ctx.fillStyle = '#374151';
  ctx.fillText(settings.schoolAddress || 'Akodha, Rohi, Bhadohi - 221308', cx, y);
  y += 22;

  // ── Phone ──
  ctx.font = `400 14px "Times New Roman", serif`;
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`Phone: ${settings.contactNumber || '0000000000'}`, cx, y);
  y += 18;

  // ── Double rule ──
  ctx.strokeStyle = '#1a2e6e';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(A4_W - PAD, y); ctx.stroke();
  y += 5;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(A4_W - PAD, y); ctx.stroke();
  y += 12;

  // ── Title ──
  ctx.font = `900 20px "Times New Roman", serif`;
  ctx.fillStyle = '#1a2e6e';
  ctx.textAlign = 'center';
  ctx.fillText('TRANSFER CERTIFICATE', cx, y + 16);
  y += 30;

  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(A4_W - PAD, y); ctx.stroke();
  y += 4;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(A4_W - PAD, y); ctx.stroke();
  y += 20;

  // ── TC No & Issue Date ──
  ctx.font = `700 16px "Times New Roman", serif`;
  ctx.fillStyle = '#111827';
  ctx.textAlign = 'left';
  ctx.fillText(`TC No.: ${tcData.tcNumber || '___________'}`, PAD, y);
  ctx.textAlign = 'right';
  ctx.fillText(`Date of Issue: ${tcData.issueDate ? fmt(tcData.issueDate) : fmt(new Date())}`, A4_W - PAD, y);
  y += 28;

  // ── Rows ──
  const rows = [
    ['1.',  'Name of Student',                         student.name || ''],
    ['2.',  "Father's Name",                           student.fatherName || student.guardianName || ''],
    ['3.',  "Mother's Name",                           student.motherName || ''],
    ['4.',  'Date of Birth',                           fmt(student.dateOfBirth)],
    ['5.',  'Nationality',                             tcData.nationality || 'Indian'],
    ['6.',  'Category',                                student.category || ''],
    ['7.',  'Whether passed qualifying examination',   tcData.qualifyingExam || 'Yes'],
    ['8.',  'Class in which studying',                 student.class || ''],
    ['9.',  'School / Board Admission No.',            student.UID || ''],
    ['10.', 'Date of Admission',                       tcData.admissionDate ? fmt(tcData.admissionDate) : ''],
    ['11.', 'Date of Leaving',                         fmt(tcData.leavingDate)],
    ['12.', 'Reason for Leaving',                      tcData.reason || ''],
    ['13.', 'Last Class Attended',                     tcData.lastClass || student.class || ''],
    ['14.', 'Whether fees paid up to date',            tcData.feesPaid || 'Yes'],
    ['15.', 'Character & Conduct',                     tcData.conduct || 'Good'],
    ['16.', 'Remarks',                                 tcData.remarks || ''],
  ];

  const ROW_H   = 40;
  const NUM_W   = 36;
  const LABEL_W = 320;
  const VAL_X   = PAD + NUM_W + LABEL_W + 16;

  rows.forEach(([num, label, value], i) => {
    const ry = y + i * ROW_H;
    // row separator
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, ry + ROW_H - 2); ctx.lineTo(A4_W - PAD, ry + ROW_H - 2); ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#6b7280';
    ctx.font = `600 15px "Times New Roman", serif`;
    ctx.fillText(num, PAD, ry + 24);

    ctx.fillStyle = '#111827';
    ctx.font = `700 15px "Times New Roman", serif`;
    ctx.fillText(label, PAD + NUM_W, ry + 24);

    ctx.font = `400 15px "Times New Roman", serif`;
    ctx.fillText(`:  ${value}`, VAL_X, ry + 24);

    // dotted underline for value
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(VAL_X + 20, ry + 28);
    ctx.lineTo(A4_W - PAD, ry + 28);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  y += rows.length * ROW_H + 20;

  // ── Certified text ──
  ctx.font = `italic 15px "Times New Roman", serif`;
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'left';
  ctx.fillText('Certified that the above information is correct as per school records.', PAD, y);
  y += 70;

  // ── Signatures ──
  // Class teacher (left)
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + 180, y); ctx.stroke();
  ctx.font = `700 14px "Times New Roman", serif`;
  ctx.fillStyle = '#111827';
  ctx.textAlign = 'center';
  ctx.fillText('Class Teacher', PAD + 90, y + 18);

  // Principal (right) with sign image
  const sigX = A4_W - PAD - 200;
  if (signImg) {
    const sh = 50, sw = sh * (signImg.width / signImg.height);
    ctx.drawImage(signImg, sigX + (200 - sw) / 2, y - 54, sw, sh);
  }
  ctx.beginPath(); ctx.moveTo(sigX, y); ctx.lineTo(sigX + 200, y); ctx.stroke();
  ctx.fillText('Principal / Head of School', sigX + 100, y + 18);

  // ── Stamp circle ──
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(A4_W / 2, y - 20, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `400 12px "Times New Roman", serif`;
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'center';
  ctx.fillText('School Stamp', A4_W / 2, y - 14);

  // ── Duplicate watermark ──
  if (isDuplicate) {
    ctx.save();
    ctx.translate(A4_W / 2, A4_H / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.font = `bold 90px "Times New Roman", serif`;
    ctx.fillStyle = 'rgba(220, 38, 38, 0.15)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DUPLICATE COPY', 0, 0);
    ctx.restore();
  }

  return canvas;
};

// ─── TC Preview (React, scaled down) ─────────────────────────────────────────
const TCPreview = ({ student, settings, tcData, logoSrc, signSrc, isDuplicate = false }) => {
  const admDate = tcData.admissionDate ? fmt(tcData.admissionDate) : '';
  const issueDate = tcData.issueDate ? fmt(tcData.issueDate) : fmt(new Date());

  const rows = [
    ['1.',  'Name of Student',                         student.name || ''],
    ['2.',  "Father's Name",                           student.fatherName || student.guardianName || ''],
    ['3.',  "Mother's Name",                           student.motherName || ''],
    ['4.',  'Date of Birth',                           fmt(student.dateOfBirth)],
    ['5.',  'Nationality',                             tcData.nationality || 'Indian'],
    ['6.',  'Category',                                student.category || ''],
    ['7.',  'Whether passed qualifying examination',   tcData.qualifyingExam || 'Yes'],
    ['8.',  'Class in which studying',                 student.class || ''],
    ['9.',  'School / Board Admission No.',            student.UID || ''],
    ['10.', 'Date of Admission',                       admDate],
    ['11.', 'Date of Leaving',                         fmt(tcData.leavingDate)],
    ['12.', 'Reason for Leaving',                      tcData.reason || ''],
    ['13.', 'Last Class Attended',                     tcData.lastClass || student.class || ''],
    ['14.', 'Whether fees paid up to date',            tcData.feesPaid || 'Yes'],
    ['15.', 'Character & Conduct',                     tcData.conduct || 'Good'],
    ['16.', 'Remarks',                                 tcData.remarks || ''],
  ];

  return (
    <div style={{
      width: A4_W, minHeight: A4_H, background: '#fff',
      fontFamily: '"Times New Roman", serif',
      padding: '38px 56px 40px', boxSizing: 'border-box',
      border: '5px solid #1a2e6e', position: 'relative',
      outline: '1.5px solid #1a2e6e', outlineOffset: '-10px',
    }}>
      {/* ── Centered letterhead ── */}
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        {/* Logo circle */}
        <div style={{
          width: 86, height: 86, borderRadius: '50%',
          border: '2.5px solid #1a2e6e',
          overflow: 'hidden', margin: '0 auto 14px',
          background: '#e0e7ff',
        }}>
          <img src={logoSrc} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        {/* School name */}
        <div style={{ fontSize: 28, fontWeight: 900, color: '#1a2e6e', letterSpacing: 0.5 }}>
          {settings.schoolName || 'D V CONVENT SCHOOL'}
        </div>
        {/* Thin accent rule */}
        <div style={{ width: 220, height: 1, background: '#a5b4fc', margin: '8px auto 10px' }} />
        {/* Address */}
        <div style={{ fontSize: 15, color: '#374151' }}>
          {settings.schoolAddress || 'Akodha, Rohi, Bhadohi - 221308'}
        </div>
        {/* Phone */}
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          Phone: {settings.contactNumber || '0000000000'}
        </div>
      </div>

      {/* Double rule */}
      <div style={{ borderTop: '3px solid #1a2e6e', marginTop: 16, paddingTop: 4, borderBottom: '1px solid #1a2e6e', paddingBottom: 0 }} />

      {/* Title */}
      <div style={{ textAlign: 'center', padding: '10px 0 8px' }}>
        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 4, color: '#1a2e6e' }}>TRANSFER CERTIFICATE</span>
      </div>

      {/* Double rule bottom */}
      <div style={{ borderTop: '1px solid #1a2e6e', paddingTop: 3, borderBottom: '3px solid #1a2e6e', marginBottom: 18 }} />

      {/* TC No & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
        <span>TC No.: {tcData.tcNumber || '___________'}</span>
        <span>Date of Issue: {issueDate}</span>
      </div>

      {/* Rows */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
        <tbody>
          {rows.map(([num, label, value]) => (
            <tr key={num} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '7px 4px', width: 36, color: '#6b7280', fontWeight: 600, verticalAlign: 'top' }}>{num}</td>
              <td style={{ padding: '7px 8px', width: '44%', fontWeight: 700, verticalAlign: 'top' }}>{label}</td>
              <td style={{ padding: '7px 4px', verticalAlign: 'top' }}>
                :&nbsp;&nbsp;
                <span style={{ borderBottom: '1px dotted #9ca3af', display: 'inline-block', minWidth: 200 }}>{value}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Certified */}
      <div style={{ marginTop: 22, fontSize: 15, fontStyle: 'italic', color: '#374151', lineHeight: 1.8 }}>
        Certified that the above information is correct as per school records.
      </div>

      {/* Signatures */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 56 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ borderTop: '1.5px solid #374151', paddingTop: 6, width: 180, fontSize: 14, fontWeight: 700 }}>Class Teacher</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img src={signSrc} alt="sign" style={{ height: 50, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
          <div style={{ borderTop: '1.5px solid #374151', paddingTop: 6, width: 200, fontSize: 14, fontWeight: 700 }}>Principal / Head of School</div>
        </div>
      </div>

      {/* Stamp */}
      <div style={{
        position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
        width: 104, height: 104, border: '1.5px dashed #d1d5db', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>School<br />Stamp</span>
      </div>

      {/* Duplicate watermark */}
      {isDuplicate && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{
            fontSize: 90, fontWeight: 'bold', color: 'rgba(220,38,38,0.15)',
            transform: 'rotate(-45deg)', whiteSpace: 'nowrap',
            fontFamily: '"Times New Roman", serif',
          }}>DUPLICATE COPY</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TransferCertificate = () => {
  const { settings } = useSettings();
  const [search, setSearch]           = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [students, setStudents]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [selected, setSelected]       = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [issued, setIssued]           = useState(false);
  const [issuing, setIssuing]         = useState(false);
  const [activeTab, setActiveTab]     = useState('issue');
  const [history, setHistory]         = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [tcData, setTcData] = useState({
    tcNumber: '', issueDate: new Date().toISOString().split('T')[0],
    admissionDate: '', leavingDate: '', reason: '', lastClass: '',
    nationality: 'Indian', qualifyingExam: 'Yes', feesPaid: 'Yes',
    conduct: 'Good', remarks: '',
  });

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [search, classFilter]);

  useEffect(() => {
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/students', {
        params: { search, studentClass: classFilter, status: 'inactive', limit: 50 },
      });
      setStudents(res.data.students || []);
    } catch {
      setToast({ message: 'Failed to load students', type: 'error' });
    } finally { setLoading(false); }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await API.get('/admin/students', { params: { status: 'inactive', limit: 200 } });
      setHistory((res.data.students || []).filter(s => s.tcIssuedAt));
    } catch {
      setToast({ message: 'Failed to load history', type: 'error' });
    } finally { setHistoryLoading(false); }
  };

  const handleSelect = (student) => {
    setSelected(student);
    setIsDuplicate(!!student.tcIssuedAt);
    setIssued(!!student.tcIssuedAt); // already issued = can download directly
    setTcData(prev => ({
      ...prev,
      lastClass: student.class || '',
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split('T')[0]
        : '',
    }));
  };

  const handleIssue = async () => {
    if (!selected) { setToast({ message: 'Select a student first', type: 'error' }); return; }
    setIssuing(true);
    try {
      const { data } = await API.put(`/admin/students/${selected._id}/issue-tc`);
      setIsDuplicate(data.isDuplicate);
      setIssued(true);
      setStudents(prev => prev.map(s =>
        s._id === selected._id ? { ...s, tcIssuedAt: data.tcIssuedAt || new Date().toISOString() } : s
      ));
      setSelected(prev => ({ ...prev, tcIssuedAt: data.tcIssuedAt || new Date().toISOString() }));
      setToast({ message: data.isDuplicate ? 'Already issued — duplicate copy will be generated' : 'TC issued successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to issue TC: ' + err.message, type: 'error' });
    } finally { setIssuing(false); }
  };

  const handleDownload = async () => {
    if (!selected) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const canvas  = await drawTC(selected, settings, tcData, schoolLogo, signImage, isDuplicate);
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`TC_${selected.name?.replace(/\s+/g, '_')}_${selected.UID || 'student'}.pdf`);
      setToast({ message: isDuplicate ? 'Duplicate copy downloaded!' : 'TC downloaded!', type: 'success' });
    } catch (err) {
      setToast({ message: 'Download failed: ' + err.message, type: 'error' });
    } finally { setDownloading(false); }
  };

  return (
    <div className="space-y-5">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Transfer Certificate</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">Only inactive students are eligible for TC</p>
        </div>
        <div className="flex gap-2">
          {!issued ? (
            <button onClick={handleIssue} disabled={!selected || issuing}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              <FileText size={15} />
              {issuing ? 'Issuing…' : 'Issue TC'}
            </button>
          ) : (
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              <Download size={15} />
              {downloading ? 'Generating…' : isDuplicate ? 'Download Duplicate' : 'Download PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[['issue', 'Issue TC'], ['history', 'TC History']].map(([tab, label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'history' && <Clock size={13} className="inline mr-1 -mt-0.5" />}
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'issue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left */}
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Select Inactive Student</p>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1 bg-gray-50 rounded-xl px-3 h-10 border border-gray-100">
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <input className="bg-transparent text-sm font-medium outline-none w-full placeholder:text-gray-400"
                    placeholder="Search name or UID..." value={search}
                    onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="h-10 bg-gray-50 border border-gray-100 rounded-xl px-3 text-xs font-bold outline-none"
                  value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                  <option value="">All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              {loading ? (
                <div className="py-8 flex justify-center"><LoadingSpinner size="sm" /></div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {students.length === 0
                    ? <p className="text-center text-gray-400 text-sm py-6">No inactive students found</p>
                    : students.map(s => (
                      <div key={s._id} onClick={() => handleSelect(s)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          selected?._id === s._id ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-transparent hover:bg-gray-100'
                        }`}>
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-black text-orange-700 text-sm shrink-0 overflow-hidden">
                          {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500">Class {s.class} &bull; UID: {s.UID || 'N/A'}</p>
                        </div>
                        {s.tcIssuedAt && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <AlertTriangle size={10} /> Issued
                          </span>
                        )}
                        {selected?._id === s._id && <span className="text-indigo-600 text-xs font-black shrink-0">Selected</span>}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {selected && (
              <>
                {isDuplicate && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-amber-800 text-sm font-semibold">
                    <AlertTriangle size={16} className="shrink-0" />
                    TC already issued on {fmt(selected.tcIssuedAt)} — next download will be marked DUPLICATE COPY
                  </div>
                )}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-widest">TC Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'TC Number',          key: 'tcNumber',      type: 'text', placeholder: 'e.g. TC-2025-001' },
                      { label: 'Issue Date',          key: 'issueDate',     type: 'date' },
                      { label: 'Admission Date',      key: 'admissionDate', type: 'date' },
                      { label: 'Date of Leaving',     key: 'leavingDate',   type: 'date' },
                      { label: 'Last Class Attended', key: 'lastClass',     type: 'text', placeholder: 'e.g. Class 5' },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="text-xs font-bold text-gray-600 block mb-1">{label}</label>
                        <input type={type} placeholder={placeholder} value={tcData[key]}
                          onChange={e => setTcData(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-400" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Fees Paid',       key: 'feesPaid',       options: ['Yes', 'No'] },
                      { label: 'Conduct',         key: 'conduct',        options: ['Excellent', 'Good', 'Satisfactory', 'Poor'] },
                      { label: 'Qualifying Exam', key: 'qualifyingExam', options: ['Yes', 'No', 'N/A'] },
                      { label: 'Nationality',     key: 'nationality',    options: ['Indian', 'Other'] },
                    ].map(({ label, key, options }) => (
                      <div key={key}>
                        <label className="text-xs font-bold text-gray-600 block mb-1">{label}</label>
                        <select value={tcData[key]} onChange={e => setTcData(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-400">
                          {options.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Reason for Leaving</label>
                    <input type="text" placeholder="e.g. Family relocation" value={tcData.reason}
                      onChange={e => setTcData(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">Remarks</label>
                    <input type="text" placeholder="Optional remarks" value={tcData.remarks}
                      onChange={e => setTcData(prev => ({ ...prev, remarks: e.target.value }))}
                      className="w-full h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-indigo-400" />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right — Preview */}
          <div className="flex items-start justify-center overflow-hidden min-h-[400px]">
            {selected ? (
              <div style={{ transform: 'scale(0.48)', transformOrigin: 'top center', marginBottom: -590 }}>
                <TCPreview student={selected} settings={settings} tcData={tcData}
                  logoSrc={settings.schoolLogo || schoolLogo} signSrc={signImage} isDuplicate={isDuplicate} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400 py-20">
                <FileText size={48} strokeWidth={1} />
                <p className="text-sm font-medium">Select an inactive student to preview TC</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-black text-gray-700">Issued TC Records</p>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">{history.length} total</span>
          </div>
          {historyLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner size="sm" /></div>
          ) : history.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
              <Clock size={36} strokeWidth={1} />
              <p className="text-sm font-medium">No TCs have been issued yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs font-black text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">#</th>
                    <th className="px-5 py-3 text-left">Student</th>
                    <th className="px-5 py-3 text-left">Class</th>
                    <th className="px-5 py-3 text-left">UID</th>
                    <th className="px-5 py-3 text-left">TC Issued On</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((s, i) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-gray-400 font-medium">{i + 1}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-black text-orange-700 text-xs shrink-0 overflow-hidden">
                            {s.profileImage ? <img src={s.profileImage} alt="" className="w-full h-full object-cover" /> : s.name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-900">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{s.class}</td>
                      <td className="px-5 py-3 text-gray-600 font-mono text-xs">{s.UID || '—'}</td>
                      <td className="px-5 py-3 font-medium text-gray-700">{fmt(s.tcIssuedAt)}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => { handleSelect(s); setActiveTab('issue'); }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                          Reprint (Duplicate)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TransferCertificate;
