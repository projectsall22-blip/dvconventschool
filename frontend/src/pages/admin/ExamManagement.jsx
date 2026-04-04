import React, { useState, useEffect } from "react";
import {
  Plus, Calendar, CheckCircle2, Play, Trash2,
  ShieldCheck, Clock, PenLine, BookOpen, Star,
  Dumbbell, Info, RotateCcw, AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import API from "../../api/axios";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Toast from "../../components/common/Toast";
import { useSettings } from "../../context/SettingsContext";

/* ─── constants ─────────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  Scheduled: { dot: "bg-blue-400",    badge: "bg-blue-50 text-blue-700 border-blue-200",          label: "Scheduled" },
  Ongoing:   { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Ongoing"   },
  Completed: { dot: "bg-gray-400",    badge: "bg-gray-50 text-gray-500 border-gray-200",          label: "Completed" },
  Cancelled: { dot: "bg-red-400",     badge: "bg-red-50 text-red-600 border-red-200",             label: "Cancelled" },
};

/* Component definitions — order matches CBSE marksheet columns */
const COMPONENTS = [
  {
    key:         "periodicTest",
    label:       "Periodic Test",
    shortLabel:  "PT",
    defaultMax:  10,
    icon:        PenLine,
    color: {
      card:  "border-violet-200 bg-violet-50",
      icon:  "bg-violet-100 text-violet-600",
      pill:  "bg-violet-100 text-violet-700",
      strip: "bg-violet-400",
    },
    description: "Written periodic / class test",
  },
  {
    key:         "noteBooks",
    label:       "Note Books",
    shortLabel:  "NB",
    defaultMax:  5,
    icon:        BookOpen,
    color: {
      card:  "border-blue-200 bg-blue-50",
      icon:  "bg-blue-100 text-blue-600",
      pill:  "bg-blue-100 text-blue-700",
      strip: "bg-blue-400",
    },
    description: "Note book submission & maintenance",
  },
  {
    key:         "subEnrichment",
    label:       "Subject Enrichment",
    shortLabel:  "SE",
    defaultMax:  5,
    icon:        Star,
    color: {
      card:  "border-amber-200 bg-amber-50",
      icon:  "bg-amber-100 text-amber-600",
      pill:  "bg-amber-100 text-amber-700",
      strip: "bg-amber-400",
    },
    description: "Activity / project / practical",
  },
  {
    key:         "finalExam",
    label:       "Final Exam",
    shortLabel:  "Exam",
    defaultMax:  80,
    icon:        Dumbbell,
    color: {
      card:  "border-emerald-200 bg-emerald-50",
      icon:  "bg-emerald-100 text-emerald-600",
      pill:  "bg-emerald-100 text-emerald-700",
      strip: "bg-emerald-500",
    },
    description: "Half-Yearly / Annual written exam",
  },
];

const TERMS = ["Term-1", "Term-2"];

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* ─── Single Component Slot Card ─────────────────────────────────────────── */
const SlotCard = ({ term, comp, exam, onAdd, onStatusChange, onDelete }) => {
  const { icon: Icon, color, label, description, defaultMax } = comp;
  const st = exam ? (STATUS_STYLES[exam.status] || STATUS_STYLES.Scheduled) : null;

  /* ── Empty slot ── */
  if (!exam) {
    return (
      <div className={`rounded-2xl border-2 border-dashed ${color.card} p-4 flex flex-col gap-3 transition-all hover:shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.icon}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-700 leading-tight">{label}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{description}</p>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${color.pill}`}>
            {defaultMax} marks
          </span>
        </div>
        <button
          onClick={() => onAdd(term, comp)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 text-xs font-black hover:border-indigo-400 hover:text-indigo-500 hover:bg-white transition-all uppercase tracking-tight">
          <Plus size={13} /> Schedule This
        </button>
      </div>
    );
  }

  /* ── Filled slot ── */
  const daysLeft = Math.ceil((new Date(exam.startDate) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`rounded-2xl border-2 ${color.card} overflow-hidden group hover:shadow-sm transition-all`}>
      {/* top strip */}
      <div className={`h-1 w-full ${color.strip}`} />

      <div className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.icon}`}>
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-gray-800 leading-tight truncate">{exam.examName}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${st.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                {st.label}
              </span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${color.pill}`}>
                {exam.maxMarks} marks
              </span>
            </div>
          </div>
          <button
            onClick={() => onDelete(exam._id, exam.examName)}
            className="w-7 h-7 flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0">
            <Trash2 size={13} />
          </button>
        </div>

        {/* Date row */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold bg-white/70 rounded-xl px-3 py-2">
          <Calendar size={11} className="shrink-0" />
          <span>{fmtDate(exam.startDate)}</span>
          <span className="text-gray-300">→</span>
          <span>{fmtDate(exam.endDate)}</span>
          {exam.status === "Scheduled" && daysLeft > 0 && (
            <span className="ml-auto flex items-center gap-1 text-indigo-500">
              <Clock size={10} /> {daysLeft}d
            </span>
          )}
          {exam.status === "Scheduled" && daysLeft <= 0 && (
            <span className="ml-auto text-amber-600">Today</span>
          )}
        </div>

        {/* Action button */}
        {exam.status === "Scheduled" && (
          <button onClick={() => onStatusChange(exam._id, "Ongoing")}
            className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] rounded-xl transition-all uppercase tracking-tight">
            <Play size={12} /> Start
          </button>
        )}
        {exam.status === "Ongoing" && (
          <button onClick={() => onStatusChange(exam._id, "Completed")}
            className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-xl transition-all uppercase tracking-tight">
            <CheckCircle2 size={12} /> Complete &amp; Publish
          </button>
        )}
        {exam.status === "Completed" && (
          <div className="w-full flex items-center justify-center gap-2 py-2 bg-white text-gray-500 font-black text-[11px] rounded-xl border border-gray-200 uppercase tracking-tight">
            <ShieldCheck size={12} className="text-emerald-500" /> Published
          </div>
        )}
        {exam.status === "Cancelled" && (
          <div className="w-full flex items-center justify-center gap-2 py-2 bg-red-50 text-red-400 font-black text-[11px] rounded-xl border border-red-100 uppercase tracking-tight">
            <AlertCircle size={12} /> Cancelled
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
const ExamManagement = () => {
  const { settings }   = useSettings();
  const [exams, setExams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalState, setModalState] = useState(null);   // { term, comp } | null
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
  const [activeTerm, setActiveTerm] = useState("Term-1");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => { fetchExams(); }, [settings?.currentAcademicYear]);

  const fetchExams = async () => {
    if (!settings?.currentAcademicYear) return;
    setLoading(true);
    try {
      const res = await API.get("/admin/exams?year=" + settings.currentAcademicYear);
      setExams(res.data);
    } catch {
      setToast({ message: "Failed to load exams", type: "error" });
    } finally { setLoading(false); }
  };

  /* Pre-fill modal */
  const openAdd = (term, comp) => {
    setModalState({ term, comp });
    reset();
    setValue("examName", `${comp.label} — ${term}`);
    setValue("maxMarks", comp.defaultMax);
  };

  const onCreateExam = async (data) => {
    const { term, comp } = modalState;
    setSubmitting(true);
    try {
      await API.post("/admin/exams", {
        examName:     data.examName,
        examType:     comp.key,      // used by marks-entry page to identify component
        term,                        // "Term-1" | "Term-2"
        component:    comp.key,      // explicit — used by ResultGeneration
        startDate:    data.startDate,
        endDate:      data.endDate,
        maxMarks:     Number(data.maxMarks),
        academicYear: settings.currentAcademicYear,
      });
      setToast({ message: `${comp.label} scheduled for ${term}`, type: "success" });
      setModalState(null);
      reset();
      fetchExams();
    } catch (err) {
      setToast({ message: err.message || "Creation failed", type: "error" });
    } finally { setSubmitting(false); }
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      await API.put("/admin/exams/" + examId + "/status", { status: newStatus });
      setToast({ message: "Status updated to " + newStatus, type: "success" });
      fetchExams();
    } catch {
      setToast({ message: "Status update failed", type: "error" });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? All entered marks will be deleted too.`)) return;
    try {
      await API.delete("/admin/exams/" + id);
      setExams(prev => prev.filter(e => e._id !== id));
      setToast({ message: "Exam deleted", type: "success" });
    } catch {
      setToast({ message: "Delete failed", type: "error" });
    }
  };

  /* Build a quick lookup: term → component key → exam */
  const examIndex = {};
  exams.forEach(e => {
    const t = e.term      || "Term-1";
    const c = e.component || e.examType;
    if (!examIndex[t]) examIndex[t] = {};
    examIndex[t][c] = e;
  });

  /* Per-term progress */
  const termProgress = (term) => {
    const slot = examIndex[term] || {};
    return {
      completed: COMPONENTS.filter(c => slot[c.key]?.status === "Completed").length,
      created:   COMPONENTS.filter(c => !!slot[c.key]).length,
      total:     COMPONENTS.length,
    };
  };

  if (loading && exams.length === 0)
    return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-indigo-700 tracking-tight">Exam Scheduler</h1>
          <p className="text-sm text-gray-500 font-medium">
            {settings?.currentAcademicYear} · {exams.length} component{exams.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <button onClick={fetchExams}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs rounded-xl transition-all">
          <RotateCcw size={13} /> Refresh
        </button>
      </div>

      {/* ── Info banner ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex gap-3 items-start">
        <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-[11px] font-bold text-blue-700 leading-relaxed">
          Each component (Periodic Test · Note Books · Subject Enrichment · Final Exam) is scheduled and published{" "}
          <b>independently</b> per term. Result generation reads all <b>Completed</b> components to build the CBSE marksheet.
        </p>
      </div>

      {/* ── Term tabs ── */}
      <div className="flex gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
        {TERMS.map(term => {
          const { completed, created, total } = termProgress(term);
          const allDone = completed === total;
          return (
            <button key={term} onClick={() => setActiveTerm(term)}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-black transition-all ${
                activeTerm === term
                  ? "bg-white shadow-sm text-indigo-700"
                  : "text-gray-500 hover:text-gray-700"}`}>
              {term}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                allDone
                  ? "bg-emerald-100 text-emerald-700"
                  : created > 0
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-200 text-gray-500"}`}>
                {completed}/{total}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Active term panel ── */}
      {TERMS.filter(t => t === activeTerm).map(term => {
        const { completed, created, total } = termProgress(term);
        const pct = Math.round((completed / total) * 100);

        return (
          <div key={term} className="space-y-4">

            {/* Progress card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-black text-gray-800">{term} — Publishing Progress</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                    {created}/{total} created · {completed}/{total} published
                  </p>
                </div>
                <span className={`text-xl font-black ${pct === 100 ? "text-emerald-600" : "text-indigo-600"}`}>
                  {pct}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? "bg-emerald-500" : "bg-indigo-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Component status dots */}
              <div className="flex gap-4 flex-wrap">
                {COMPONENTS.map(comp => {
                  const e  = (examIndex[term] || {})[comp.key];
                  const st = e?.status;
                  return (
                    <div key={comp.key} className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${
                        st === "Completed" ? "bg-emerald-500" :
                        st === "Ongoing"   ? "bg-blue-400"    :
                        st === "Scheduled" ? "bg-indigo-300"  : "bg-gray-200"}`} />
                      <span className="text-[10px] font-bold text-gray-500">{comp.shortLabel}</span>
                      {st && (
                        <span className="text-[9px] text-gray-400">({st})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2×2 Component grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMPONENTS.map(comp => (
                <SlotCard
                  key={comp.key}
                  term={term}
                  comp={comp}
                  exam={(examIndex[term] || {})[comp.key]}
                  onAdd={openAdd}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Marks distribution summary */}
            {created > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs font-black text-gray-400 uppercase mb-3 tracking-tight">
                  Mark Distribution — {term}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {COMPONENTS.map(comp => {
                    const e = (examIndex[term] || {})[comp.key];
                    return (
                      <div key={comp.key}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border flex-1 min-w-[80px] ${comp.color.card}`}>
                        <comp.icon size={13} className={comp.color.icon.split(" ")[1]} />
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase leading-none">{comp.shortLabel}</p>
                          <p className="text-sm font-black text-gray-800">{e ? e.maxMarks : <span className="text-gray-300">—</span>}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 flex-1 min-w-[80px]">
                    <div>
                      <p className="text-[9px] font-black text-indigo-500 uppercase leading-none">Total</p>
                      <p className="text-sm font-black text-indigo-700">
                        {COMPONENTS.reduce((s, c) => {
                          const e = (examIndex[term] || {})[c.key];
                          return s + (e ? Number(e.maxMarks) : 0);
                        }, 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Schedule Modal ── */}
      {modalState && (
        <Modal
          isOpen
          onClose={() => { setModalState(null); reset(); }}
          title={`Schedule ${modalState.comp.label} — ${modalState.term}`}>

          <form onSubmit={handleSubmit(onCreateExam)} className="space-y-4">

            {/* Component identity badge */}
            <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${modalState.comp.color.card}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${modalState.comp.color.icon}`}>
                <modalState.comp.icon size={19} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-gray-800">{modalState.comp.label}</p>
                <p className="text-[10px] text-gray-400 font-medium">{modalState.comp.description}</p>
              </div>
              <span className={`text-[11px] font-black px-2.5 py-1 rounded-full shrink-0 ${modalState.comp.color.pill}`}>
                {modalState.term}
              </span>
            </div>

            {/* Name */}
            <Input
              label="Exam / Test Name"
              placeholder={`e.g. ${modalState.comp.label} — ${modalState.term}`}
              {...register("examName", { required: "Name is required" })}
              error={errors.examName?.message}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <Input label="Start Date" type="date"
                {...register("startDate", { required: "Required" })}
                error={errors.startDate?.message} />
              <Input label="End Date" type="date"
                {...register("endDate", { required: "Required" })}
                error={errors.endDate?.message} />
            </div>

            {/* Max marks */}
            <Input
              label={`Maximum Marks (default: ${modalState.comp.defaultMax})`}
              type="number"
              placeholder={String(modalState.comp.defaultMax)}
              {...register("maxMarks", {
                required: "Required",
                min: { value: 1, message: "Must be > 0" },
                valueAsNumber: true,
              })}
              error={errors.maxMarks?.message}
            />

            <Button type="submit" fullWidth isLoading={submitting} icon={Plus}>
              Schedule {modalState.comp.label}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExamManagement;