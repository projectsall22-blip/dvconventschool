import JSZip from 'jszip';

// ─── Output canvas dimensions (3× CR-80) ─────────────────────────────────────
const W = 612;   // 204 × 3
const H = 969;   // 323 × 3
const R = 3;

const s = (v) => v * R;

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
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const clipRoundRect = (ctx, x, y, w, h, r) => {
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
};

const ellipseText = (ctx, text, maxWidth) => {
  if (!text) return 'N/A';
  let t = String(text);
  while (ctx.measureText(t).width > maxWidth && t.length > 1) t = t.slice(0, -1);
  if (t.length < String(text).length) t = t.slice(0, -1) + '…';
  return t;
};

// ════════════════════════════════════════════════════════════════════════════
// STUDENT CARD
// ════════════════════════════════════════════════════════════════════════════
const drawStudentCard = async (canvas, student, settings, assets) => {
  const { logoImg, signImg, photoImg } = assets;
  const ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;

  ctx.save();
  clipRoundRect(ctx, 0, 0, W, H, s(12));
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // ── HEADER ──────────────────────────────────────────────────────────────────
  // Taller header to fit bigger logo + text
  const hdrH = s(72);
  const hGrad = ctx.createLinearGradient(0, 0, W, hdrH);
  hGrad.addColorStop(0, '#1a2e6e');
  hGrad.addColorStop(1, '#1e3a8a');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, W, hdrH);

  // ── Logo (bigger: 48px → was 32px) ──
  const logoSz = s(48);
  const lx     = s(10);
  const ly     = (hdrH - logoSz) / 2;   // vertically centred in header

  ctx.save();
  ctx.beginPath();
  ctx.arc(lx + logoSz / 2, ly + logoSz / 2, logoSz / 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth   = s(2.5);
  ctx.stroke();
  ctx.clip();
  if (logoImg) ctx.drawImage(logoImg, lx, ly, logoSz, logoSz);
  else { ctx.fillStyle = '#e0e7ff'; ctx.fillRect(lx, ly, logoSz, logoSz); }
  ctx.restore();

  // ── School text ──
  const tx  = lx + logoSz + s(10);
  const tmx = W - tx - s(8);

  ctx.textBaseline = 'top';
  ctx.textAlign    = 'left';

  // School name — bigger (was 9px → now 13px)
  ctx.font      = `900 ${s(10)}px Arial`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(ellipseText(ctx, settings.schoolName || 'D V CONVENT SCHOOL', tmx), tx, ly + s(4));

  // Address — bigger (was 6.5px → now 9px)
  ctx.font      = `400 ${s(8)}px Arial`;
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(ellipseText(ctx, settings.schoolAddress || 'Akodha,Rohi,Bhadohi-221308', tmx), tx, ly + s(20));

  // Phone — bigger (was 6.5px → now 9px)
  ctx.font      = `400 ${s(8)}px Arial`;
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`📞 ${settings.contactNumber || '0000000000'}`, tx, ly + s(34));

  // ── BODY ────────────────────────────────────────────────────────────────────
  const bGrad = ctx.createLinearGradient(0, hdrH, 0, H - s(39));
  bGrad.addColorStop(0,   '#dbeafe');
  bGrad.addColorStop(0.6, '#eff6ff');
  bGrad.addColorStop(1,   '#ffffff');
  ctx.fillStyle = bGrad;
  ctx.fillRect(0, hdrH, W, H - hdrH);

  // Photo circle
  const pr = s(28), px = W / 2, py = hdrH + s(10) + pr;
  ctx.save();
  ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.strokeStyle = '#1e3a8a'; ctx.lineWidth = s(3); ctx.stroke();
  ctx.clip();
  if (photoImg) {
    ctx.drawImage(photoImg, px - pr, py - pr, pr * 2, pr * 2);
  } else {
    ctx.fillStyle = '#e0e7ff'; ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    ctx.font = `900 ${s(22)}px Arial`; ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((student.name || '?').charAt(0).toUpperCase(), px, py);
  }
  ctx.restore();

  // Name
  const nameY = py + pr + s(8);
  ctx.font = `900 ${s(11)}px Arial`; ctx.fillStyle = '#1e3a8a';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(student.name || '', W / 2, nameY);

  // UID badge
  const uidTxt = `UID : ${student.UID || 'N/A'}`;
  ctx.font = `900 ${s(7.5)}px Arial`;
  const uidW = ctx.measureText(uidTxt).width + s(20), uidH = s(16);
  const uidX = (W - uidW) / 2, uidY = nameY + s(15);
  roundRect(ctx, uidX, uidY, uidW, uidH, s(6));
  ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = s(1.5); ctx.stroke();
  ctx.fillStyle = '#fefce8'; ctx.fill();
  ctx.fillStyle = '#92400e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(uidTxt, W / 2, uidY + uidH / 2);

  // Divider
  const divY = uidY + uidH + s(6);
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = s(1); ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(s(8), divY); ctx.lineTo(W - s(8), divY); ctx.stroke();

  // Info rows
  const dob = student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB') : 'N/A';
  const rows = [
    { label: 'FATHER',  value: student.fatherName || student.guardianName || 'N/A' },
    { label: 'D.O.B',   value: dob },
    { label: 'CLASS',   value: student.class || 'N/A' },
    { label: 'MOBILE',  value: student.fatherMobile || student.guardianMobile || 'N/A' },
    { label: 'ADDRESS', value: student.address || 'N/A' },
  ];
  const rsY = divY + s(5), rsp = s(13), vx = s(8) + s(38) + s(4), vmx = W - vx - s(8);
  rows.forEach(({ label, value }, i) => {
    const ry = rsY + i * rsp;
    ctx.font = `900 ${s(6)}px Arial`; ctx.fillStyle = '#1e3a8a';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`${label}:`, s(12), ry);
    ctx.font = `700 ${s(6.5)}px Arial`; ctx.fillStyle = '#111827';
    ctx.fillText(ellipseText(ctx, value, vmx), vx, ry);
  });

  // ── FOOTER ──────────────────────────────────────────────────────────────────
  const ftY = H - s(46);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, ftY, W, s(30));
  ctx.save();
  ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = s(1); ctx.setLineDash([s(4), s(3)]);
  ctx.beginPath(); ctx.moveTo(0, ftY); ctx.lineTo(W, ftY); ctx.stroke();
  ctx.restore();

  ctx.font = `900 ${s(5.5)}px Arial`; ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('SESSION:', s(8), ftY + s(4));
  ctx.font = `900 ${s(6)}px Arial`; ctx.fillStyle = '#374151';
  ctx.fillText(settings.currentAcademicYear || '2025-26', s(8), ftY + s(12));

  if (signImg) {
    const sh = s(18), sw = sh * (signImg.width / signImg.height);
    const sx = W - sw - s(8), sy = ftY + s(2);
    ctx.drawImage(signImg, sx, sy, sw, sh);
    ctx.strokeStyle = '#374151'; ctx.lineWidth = s(1); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(sx, sy + sh + s(1)); ctx.lineTo(sx + sw, sy + sh + s(1)); ctx.stroke();
    ctx.font = `900 ${s(5.5)}px Arial`; ctx.fillStyle = '#374151';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('PRINCIPAL', sx + sw / 2, sy + sh + s(3));
  }

  // ── STRIP ───────────────────────────────────────────────────────────────────
  const stY = H - s(16);
  ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, stY, W, s(16));
  ctx.font = `700 ${s(7)}px Arial`; ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('If found, please return to school', W / 2, stY + s(8));

  ctx.restore();
};

// ════════════════════════════════════════════════════════════════════════════
// TEACHER CARD
// ════════════════════════════════════════════════════════════════════════════
const drawTeacherCard = async (canvas, teacher, settings, assets) => {
  const { logoImg, signImg, photoImg } = assets;
  const ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;

  ctx.save();
  clipRoundRect(ctx, 0, 0, W, H, s(12));
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // HEADER (red)
  const hdrH = s(72);
  const hGrad = ctx.createLinearGradient(0, 0, W, hdrH);
  hGrad.addColorStop(0, '#7f1d1d');
  hGrad.addColorStop(1, '#991b1b');
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, W, hdrH);

  // Logo (bigger)
  const logoSz = s(48);
  const lx     = s(10);
  const ly     = (hdrH - logoSz) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(lx + logoSz / 2, ly + logoSz / 2, logoSz / 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = s(2.5); ctx.stroke();
  ctx.clip();
  if (logoImg) ctx.drawImage(logoImg, lx, ly, logoSz, logoSz);
  else { ctx.fillStyle = '#fee2e2'; ctx.fillRect(lx, ly, logoSz, logoSz); }
  ctx.restore();

  const tx = lx + logoSz + s(10), tmx = W - tx - s(8);
  ctx.textBaseline = 'top'; ctx.textAlign = 'left';

  ctx.font = `900 ${s(10)}px Arial`; ctx.fillStyle = '#ffffff';
  ctx.fillText(ellipseText(ctx, settings.schoolName || 'D V CONVENT SCHOOL', tmx), tx, ly + s(4));

  ctx.font = `400 ${s(8)}px Arial`; ctx.fillStyle = '#fca5a5';
  ctx.fillText(ellipseText(ctx, settings.schoolAddress || 'Akodha,Rohi,Bhadohi-221308', tmx), tx, ly + s(20));

  ctx.font = `400 ${s(8)}px Arial`; ctx.fillStyle = '#fbbf24';
  ctx.fillText(`📞 ${settings.contactNumber || '0000000000'}`, tx, ly + s(34));

  // BODY (pink)
  const bGrad = ctx.createLinearGradient(0, hdrH, 0, H - s(39));
  bGrad.addColorStop(0, '#fee2e2'); bGrad.addColorStop(0.6, '#fff5f5'); bGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = bGrad;
  ctx.fillRect(0, hdrH, W, H - hdrH);

  // Photo square
  const psz = s(72), ppx = (W - psz) / 2, ppy = hdrH + s(8);
  ctx.save();
  roundRect(ctx, ppx, ppy, psz, psz, s(8));
  ctx.strokeStyle = '#991b1b'; ctx.lineWidth = s(3); ctx.stroke(); ctx.clip();
  if (photoImg) ctx.drawImage(photoImg, ppx, ppy, psz, psz);
  else {
    ctx.fillStyle = '#fee2e2'; ctx.fillRect(ppx, ppy, psz, psz);
    ctx.font = `900 ${s(22)}px Arial`; ctx.fillStyle = '#991b1b';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((teacher.name || '?').charAt(0).toUpperCase(), W / 2, ppy + psz / 2);
  }
  ctx.restore();

  const nameY = ppy + psz + s(6);
  ctx.font = `900 ${s(9)}px Arial`; ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillText(teacher.name || '', W / 2, nameY);

  const idTxt = `ID : ${teacher.employeeCode || 'N/A'}`;
  ctx.font = `900 ${s(7.5)}px Arial`;
  const idW = ctx.measureText(idTxt).width + s(20), idH = s(16);
  const idx = (W - idW) / 2, idy = nameY + s(13);
  roundRect(ctx, idx, idy, idW, idH, s(6));
  ctx.fillStyle = '#7f1d1d'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(idTxt, W / 2, idy + idH / 2);

  const divY = idy + idH + s(6);
  ctx.strokeStyle = '#fecaca'; ctx.lineWidth = s(1);
  ctx.beginPath(); ctx.moveTo(s(8), divY); ctx.lineTo(W - s(8), divY); ctx.stroke();

  const dob = teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString('en-GB') : 'N/A';
  const rows = [
    { label: 'D.O.B',   value: dob },
    { label: 'PHONE',   value: teacher.phone },
    { label: 'QUAL.',   value: teacher.qualifications },
    { label: 'EXP.',    value: teacher.experience ? `${teacher.experience} yrs` : 'N/A' },
    { label: 'ADDRESS', value: teacher.address },
  ];
  const rsY = divY + s(5), rsp = s(13), vx = s(8) + s(38) + s(4), vmx = W - vx - s(8);
  rows.forEach(({ label, value }, i) => {
    const ry = rsY + i * rsp;
    ctx.font = `900 ${s(6)}px Arial`; ctx.fillStyle = '#991b1b';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(`${label}:`, s(12), ry);
    ctx.font = `700 ${s(6.5)}px Arial`; ctx.fillStyle = '#111827';
    ctx.fillText(ellipseText(ctx, value || 'N/A', vmx), vx, ry);
  });

  // FOOTER
  const ftY = H - s(46);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, ftY, W, s(30));
  ctx.save();
  ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = s(1); ctx.setLineDash([s(4), s(3)]);
  ctx.beginPath(); ctx.moveTo(0, ftY); ctx.lineTo(W, ftY); ctx.stroke();
  ctx.restore();
  ctx.font = `900 ${s(5.5)}px Arial`; ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText('SESSION:', s(8), ftY + s(4));
  ctx.font = `900 ${s(6)}px Arial`; ctx.fillStyle = '#374151';
  ctx.fillText(settings.currentAcademicYear || '2025-26', s(8), ftY + s(12));
  if (signImg) {
    const sh = s(18), sw = sh * (signImg.width / signImg.height);
    const sx = W - sw - s(8), sy = ftY + s(2);
    ctx.drawImage(signImg, sx, sy, sw, sh);
    ctx.strokeStyle = '#374151'; ctx.lineWidth = s(1); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(sx, sy + sh + s(1)); ctx.lineTo(sx + sw, sy + sh + s(1)); ctx.stroke();
    ctx.font = `900 ${s(5.5)}px Arial`; ctx.fillStyle = '#374151';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('PRINCIPAL', sx + sw / 2, sy + sh + s(3));
  }

  const stY = H - s(16);
  ctx.fillStyle = '#7f1d1d'; ctx.fillRect(0, stY, W, s(16));
  ctx.font = `700 ${s(7)}px Arial`; ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('TEACHING STAFF', W / 2, stY + s(8));

  ctx.restore();
};

// ─── Internals ────────────────────────────────────────────────────────────────
const itemToBlob = async (item, type, settings, sharedAssets) => {
  const photoImg = await loadImage(item.profileImage || null);
  const canvas   = document.createElement('canvas');
  if (type === 'student') await drawStudentCard(canvas, item, settings, { ...sharedAssets, photoImg });
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

// ─── Public API ───────────────────────────────────────────────────────────────
export const downloadCards = async (items, type, settings, schoolLogoSrc, signImageSrc, onProgress) => {
  if (!items?.length) throw new Error('No items to download');
  const label  = type === 'student' ? 'student' : 'teacher';
  const shared = {
    logoImg: await loadImage(settings.schoolLogo || schoolLogoSrc),
    signImg: await loadImage(signImageSrc),
  };

  if (items.length === 1) {
    onProgress?.(0, 1);
    triggerDownload(await itemToBlob(items[0], type, settings, shared), `${label}-id-card.png`);
    onProgress?.(1, 1);
    return;
  }

  const zip    = new JSZip();
  const folder = zip.folder(`${label}-id-cards`);
  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length);
    folder.file(`${label}-card-${String(i + 1).padStart(3, '0')}.png`, await itemToBlob(items[i], type, settings, shared));
  }
  onProgress?.(items.length, items.length);
  triggerDownload(await zip.generateAsync({ type: 'blob' }), `${label}-id-cards.zip`);
};