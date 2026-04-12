import JSZip from 'jszip';

// 216×340px at 3× = 648×1020
const CW = 648;
const CH = 1020;
const R  = 3;
const s  = (v) => v * R;

const loadImage = (src) =>
  new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const ellipseText = (ctx, text, maxW) => {
  if (!text) return '—';
  let t = String(text);
  while (ctx.measureText(t).width > maxW && t.length > 1) t = t.slice(0, -1);
  if (t.length < String(text).length) t = t.slice(0, -1) + '…';
  return t;
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

// ════════════════════════════════════════════════════════════════════════════
// STUDENT CARD
// ════════════════════════════════════════════════════════════════════════════
const drawStudentCard = async (canvas, student, settings, assets, color = '#1565c0') => {
  const { logoImg, signImg, photoImg } = assets;
  const ctx = canvas.getContext('2d');
  canvas.width = CW; canvas.height = CH;

  ctx.save();
  roundRect(ctx, 0, 0, CW, CH, s(12));
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CW, CH);

  // ── Header ──────────────────────────────────────────────────────────────
  const hdrH = s(72);
  const hg = ctx.createLinearGradient(0, 0, 0, hdrH);
  hg.addColorStop(0, color); hg.addColorStop(1, color + 'dd');
  ctx.fillStyle = hg; ctx.fillRect(0, 0, CW, hdrH);

  // Logo
  const logoSz = s(52), lx = s(10), ly = (hdrH - logoSz) / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(lx + logoSz/2, ly + logoSz/2, logoSz/2, 0, Math.PI*2);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = s(2); ctx.stroke(); ctx.clip();
  if (logoImg) ctx.drawImage(logoImg, lx, ly, logoSz, logoSz);
  else { ctx.fillStyle = '#e0e7ff'; ctx.fillRect(lx, ly, logoSz, logoSz); }
  ctx.restore();

  // School text — centered in remaining space
  const tx = lx + logoSz + s(8), tw = CW - tx - s(8);
  const tyStart = ly + s(4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = `900 ${s(12.5)}px Arial`; ctx.fillStyle = '#fff';
  ctx.fillText(ellipseText(ctx, settings.schoolName || 'D V Convent School', tw), tx + tw/2, tyStart);
  ctx.font = `400 ${s(6.5)}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('(Govt. Recognised)', tx + tw/2, tyStart + s(16));
  ctx.font = `400 ${s(6.5)}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(ellipseText(ctx, settings.schoolAddress || 'Akodha, Rohi, Bhadohi - 221308', tw), tx + tw/2, tyStart + s(26));
  ctx.font = `800 ${s(7)}px Arial`; ctx.fillStyle = '#fff';
  ctx.fillText(`Phone No.: ${settings.contactNumber || '—'}`, tx + tw/2, tyStart + s(37));

  // ── Wave divider ─────────────────────────────────────────────────────────
  const waveH = s(10);
  const wg = ctx.createLinearGradient(0, hdrH, 0, hdrH + waveH);
  wg.addColorStop(0, color + 'dd'); wg.addColorStop(1, '#ffffff');
  ctx.fillStyle = wg; ctx.fillRect(0, hdrH, CW, waveH);

  // ── Photo ─────────────────────────────────────────────────────────────────
  const photoW = s(86), photoH = s(94);
  const photoX = (CW - photoW) / 2, photoY = hdrH + waveH - s(2);
  ctx.strokeStyle = color; ctx.lineWidth = s(2.5);
  ctx.strokeRect(photoX, photoY, photoW, photoH);
  if (photoImg) {
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
  } else {
    ctx.fillStyle = '#dbeafe'; ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.font = `900 ${s(36)}px Arial`; ctx.fillStyle = color;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((student.name || '?').charAt(0).toUpperCase(), photoX + photoW/2, photoY + photoH/2);
  }

  // ── Name + UID badge ─────────────────────────────────────────────────────
  const nameY = photoY + photoH + s(5);
  ctx.font = `700 ${s(13)}px Arial`; ctx.fillStyle = '#111827';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(ellipseText(ctx, student.name || '', CW - s(20)), CW/2, nameY);

  // UID pill
  const uidTxt = `UID: ${student.UID || '—'}`;
  ctx.font = `800 ${s(7.5)}px Arial`;
  const uidW = ctx.measureText(uidTxt).width + s(24), uidH = s(14);
  const uidX = (CW - uidW) / 2, uidY = nameY + s(17);
  roundRect(ctx, uidX, uidY, uidW, uidH, s(7));
  ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(uidTxt, CW/2, uidY + uidH/2);

  // ── Info rows ─────────────────────────────────────────────────────────────
  const rows = [
    ["Father's Name", student.fatherName || '—'],
    ["Mother's Name", student.motherName || '—'],
    ['D.O.B.',        fmtDate(student.dateOfBirth)],
    ['Contact No.',   student.fatherMobile || student.guardianMobile || '—'],
    ['Add.',          student.address || '—'],
  ];
  const rsY = uidY + uidH + s(5), rh = s(14), lx2 = s(12), vx = lx2 + s(62);
  rows.forEach(([lbl, val], i) => {
    const ry = rsY + i * rh;
    // divider
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = s(1);
    ctx.beginPath(); ctx.moveTo(lx2, ry); ctx.lineTo(CW - lx2, ry); ctx.stroke();
    ctx.font = `600 ${s(7)}px Arial`; ctx.fillStyle = '#374151';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(lbl, lx2, ry + rh/2);
    ctx.font = `500 ${s(7)}px Arial`; ctx.fillStyle = '#111827';
    ctx.fillText(ellipseText(ctx, val, CW - vx - lx2), vx, ry + rh/2);
  });

  // ── Footer: Class + Sign ─────────────────────────────────────────────────
  const ftY = rsY + rows.length * rh + s(2);
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = s(1);
  ctx.beginPath(); ctx.moveTo(lx2, ftY); ctx.lineTo(CW - lx2, ftY); ctx.stroke();

  ctx.font = `800 ${s(10)}px Arial`; ctx.fillStyle = '#111827';
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(`Class : ${student.class || '—'}`, lx2, ftY + s(14));

  if (signImg) {
    const sh = s(22), sw = sh * (signImg.width / signImg.height);
    const sx = CW - sw - lx2, sy = ftY + s(3);
    ctx.drawImage(signImg, sx, sy, sw, sh);
    ctx.strokeStyle = '#374151'; ctx.lineWidth = s(1);
    ctx.beginPath(); ctx.moveTo(sx, sy + sh + s(1)); ctx.lineTo(sx + sw, sy + sh + s(1)); ctx.stroke();
    ctx.font = `600 ${s(7)}px Arial`; ctx.fillStyle = '#374151';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Principal Sign.', sx + sw/2, sy + sh + s(2));
  }

  // ── Bottom note ───────────────────────────────────────────────────────────
  const noteY = CH - s(16);
  ctx.fillStyle = color; ctx.fillRect(0, noteY, CW, s(16));
  ctx.font = `500 ${s(5.5)}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(`If found, please return to school  •  Ph: ${settings.contactNumber || '—'}`, CW/2, noteY + s(8));

  ctx.restore();
};

// ════════════════════════════════════════════════════════════════════════════
// TEACHER CARD
// ════════════════════════════════════════════════════════════════════════════
const drawTeacherCard = async (canvas, teacher, settings, assets) => {
  const { logoImg, signImg, photoImg } = assets;
  const ctx = canvas.getContext('2d');
  canvas.width = CW; canvas.height = CH;

  ctx.save();
  roundRect(ctx, 0, 0, CW, CH, s(12));
  ctx.clip();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, CW, CH);

  // ── Dark Red Header ───────────────────────────────────────────────────────
  const hdrH = s(72);
  const hg = ctx.createLinearGradient(0, 0, 0, hdrH);
  hg.addColorStop(0, '#8b1a1a'); hg.addColorStop(1, '#a52020');
  ctx.fillStyle = hg; ctx.fillRect(0, 0, CW, hdrH);

  // Logo
  const logoSz = s(52), lx = s(10), ly = (hdrH - logoSz) / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(lx + logoSz/2, ly + logoSz/2, logoSz/2, 0, Math.PI*2);
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = s(2); ctx.stroke(); ctx.clip();
  if (logoImg) ctx.drawImage(logoImg, lx, ly, logoSz, logoSz);
  else { ctx.fillStyle = '#fff'; ctx.fillRect(lx, ly, logoSz, logoSz); }
  ctx.restore();

  // School text — centered like student card
  const tx = lx + logoSz + s(8), tw = CW - tx - s(8);
  const tyStart = ly + s(4);
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = `900 ${s(12.5)}px Arial`; ctx.fillStyle = '#fff';
  ctx.fillText(ellipseText(ctx, settings.schoolName || 'D V Convent School', tw), tx + tw/2, tyStart);
  ctx.font = `400 ${s(6.5)}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('(Govt. Recognised)', tx + tw/2, tyStart + s(16));
  ctx.font = `400 ${s(6.5)}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(ellipseText(ctx, settings.schoolAddress || 'Akodha, Rohi, Bhadohi - 221308', tw), tx + tw/2, tyStart + s(26));
  ctx.font = `800 ${s(7)}px Arial`; ctx.fillStyle = '#fff';
  ctx.fillText(`Phone No.: ${settings.contactNumber || '—'}`, tx + tw/2, tyStart + s(37));

  // ── White body ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, hdrH, CW, CH - hdrH);

  // Photo
  const photoW = s(96), photoH = s(106);
  const photoX = (CW - photoW) / 2, photoY = hdrH + s(8);
  ctx.strokeStyle = '#8b1a1a'; ctx.lineWidth = s(2.5);
  ctx.strokeRect(photoX, photoY, photoW, photoH);
  ctx.save();
  ctx.beginPath(); ctx.rect(photoX, photoY, photoW, photoH); ctx.clip();
  if (photoImg) {
    ctx.drawImage(photoImg, photoX, photoY, photoW, photoH);
  } else {
    ctx.fillStyle = '#f5e0e0'; ctx.fillRect(photoX, photoY, photoW, photoH);
    ctx.font = `900 ${s(40)}px Arial`; ctx.fillStyle = '#8b1a1a';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((teacher.name || '?').charAt(0).toUpperCase(), photoX + photoW/2, photoY + photoH/2);
  }
  ctx.restore();

  // Name
  const nameY = photoY + photoH + s(5);
  ctx.font = `900 ${s(13)}px Arial`; ctx.fillStyle = '#111827';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(ellipseText(ctx, teacher.name || '', CW - s(20)), CW/2, nameY);

  // Emp ID pill
  const uidTxt = `ID: ${teacher.employeeCode || '—'}`;
  ctx.font = `800 ${s(7.5)}px Arial`;
  const uidW = ctx.measureText(uidTxt).width + s(24), uidH = s(14);
  const uidX = (CW - uidW) / 2, uidY = nameY + s(17);
  roundRect(ctx, uidX, uidY, uidW, uidH, s(7));
  ctx.fillStyle = '#8b1a1a'; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(uidTxt, CW/2, uidY + uidH/2);

  // Info rows — 3 rows including Designation
  const rows = [
    ['Designation', teacher.designation || 'Teacher'],
    ['Phone',       teacher.phone || '—'],
    ['Address',     teacher.address || '—'],
  ];
  const rsY = uidY + uidH + s(5), rh = s(15), lx2 = s(12), vx = lx2 + s(58);
  ctx.strokeStyle = '#f0e0e0'; ctx.lineWidth = s(1);
  ctx.beginPath(); ctx.moveTo(lx2, rsY); ctx.lineTo(CW - lx2, rsY); ctx.stroke();
  rows.forEach(([lbl, val], i) => {
    const ry = rsY + i * rh;
    ctx.font = `700 ${s(7)}px Arial`; ctx.fillStyle = '#8b1a1a';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`${lbl}:`, lx2, ry + rh/2);
    ctx.font = `500 ${s(7)}px Arial`; ctx.fillStyle = '#111827';
    ctx.fillText(ellipseText(ctx, val, CW - vx - lx2), vx, ry + rh/2);
    ctx.strokeStyle = '#f5e0e0'; ctx.lineWidth = s(1);
    ctx.beginPath(); ctx.moveTo(lx2, ry + rh); ctx.lineTo(CW - lx2, ry + rh); ctx.stroke();
  });

  // ── Principal Sign ────────────────────────────────────────────────────────
  const ftY = rsY + rows.length * rh + s(4);
  ctx.strokeStyle = '#f0e0e0'; ctx.lineWidth = s(1);
  ctx.beginPath(); ctx.moveTo(lx2, ftY); ctx.lineTo(CW - lx2, ftY); ctx.stroke();
  if (signImg) {
    const sh = s(22), sw = sh * (signImg.width / signImg.height);
    const sx = CW - sw - lx2, sy = ftY + s(4);
    ctx.drawImage(signImg, sx, sy, sw, sh);
    ctx.strokeStyle = '#374151'; ctx.lineWidth = s(1);
    ctx.beginPath(); ctx.moveTo(sx, sy + sh + s(1)); ctx.lineTo(sx + sw, sy + sh + s(1)); ctx.stroke();
    ctx.font = `600 ${s(7)}px Arial`; ctx.fillStyle = '#374151';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('Principal Sign.', sx + sw/2, sy + sh + s(2));
  }

  // ── Red bottom strip ──────────────────────────────────────────────────────
  const stY = CH - s(20);
  ctx.fillStyle = '#8b1a1a'; ctx.fillRect(0, stY, CW, s(20));
  ctx.font = `900 ${s(11)}px Arial`; ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('STAFF ID CARD', CW/2, stY + s(10));

  ctx.restore();
};

// ─── Internals ────────────────────────────────────────────────────────────────
const itemToBlob = async (item, type, settings, sharedAssets, studentColor = '#1565c0') => {
  const apiBase  = import.meta.env?.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const photoSrc = item.profileImage
    ? (item.profileImage.startsWith('data:') ? item.profileImage : `${apiBase}${item.profileImage}`)
    : null;
  const photoImg = await loadImage(photoSrc);
  const canvas   = document.createElement('canvas');
  if (type === 'student') await drawStudentCard(canvas, item, settings, { ...sharedAssets, photoImg }, studentColor);
  else                     await drawTeacherCard(canvas, item, settings, { ...sharedAssets, photoImg });
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png', 1.0)
  );
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const downloadCards = async (items, type, settings, schoolLogoSrc, signImageSrc, onProgress, studentColor = '#1565c0') => {
  if (!items?.length) throw new Error('No items to download');
  const label  = type === 'student' ? 'student' : 'teacher';
  const shared = {
    logoImg: await loadImage(settings.schoolLogo || schoolLogoSrc),
    signImg: await loadImage(signImageSrc),
  };

  if (items.length === 1) {
    onProgress?.(0, 1);
    triggerDownload(await itemToBlob(items[0], type, settings, shared, studentColor), `${label}-id-card.png`);
    onProgress?.(1, 1);
    return;
  }

  const zip    = new JSZip();
  const folder = zip.folder(`${label}-id-cards`);
  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length);
    folder.file(`${label}-card-${String(i + 1).padStart(3, '0')}.png`, await itemToBlob(items[i], type, settings, shared, studentColor));
  }
  onProgress?.(items.length, items.length);
  triggerDownload(await zip.generateAsync({ type: 'blob' }), `${label}-id-cards.zip`);
};
