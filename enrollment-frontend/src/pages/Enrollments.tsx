import { useEffect, useState } from "react";
import api from "../api/axios";

/* ─── Responsive hook ────────────────────────────────────────────────────── */
function useWindowSize() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handle = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  return {
    isMobile:  width < 768,
    isTablet:  width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Subject {
  id: number;
  subject_name: string;
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function Enrollments() {
  const [subjects,   setSubjects]   = useState<Subject[]>([]);
  const [subjectId,  setSubjectId]  = useState<number | "">("");
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const { isMobile, isTablet } = useWindowSize();
  const isNarrow = isMobile || isTablet;

  /* ── Toast ─────────────────────────────────────────────────────────────── */
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Auth + load subjects ──────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    const fetchSubjects = async () => {
      try {
        const res = await api.get("subjects/");
        setSubjects(res.data);
      } catch (err) {
        console.error("LOAD ERROR:", err);
        showToast("Failed to load subjects. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  /* ── Enroll ────────────────────────────────────────────────────────────── */
  const enroll = async () => {
    if (!subjectId) { showToast("Please select a subject first.", "error"); return; }
    try {
      setSubmitting(true);
      const res = await api.post("enrollments/", { subject: Number(subjectId) });
      showToast(`Successfully processed — Status: ${res.data.status}`, "success");
      setSubjectId("");
    } catch (err: any) {
      console.error("ENROLL ERROR:", err?.response?.data || err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        "Enrollment failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Toast UI ──────────────────────────────────────────────────────────── */
  const Toast = () => {
    if (!toast) return null;
    const ok = toast.type === "success";
    return (
      <div style={{
        position: "fixed", top: 20, right: 20, zIndex: 1000,
        display: "flex", alignItems: "center", gap: 10,
        background: ok ? "#DCFCE7" : "#FEE2E2",
        border: `1px solid ${ok ? "#86EFAC" : "#FCA5A5"}`,
        color: ok ? "#15803D" : "#991B1B",
        padding: "12px 16px", borderRadius: 10,
        fontSize: 13, fontWeight: 500,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        maxWidth: 340,
      }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {ok
            ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />}
        </svg>
        {toast.msg}
      </div>
    );
  };

  /* ── Loading ───────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={s.centerScreen}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.loaderWrap}>
          <div style={s.spinner} />
          <p style={s.loaderText}>Loading subjects…</p>
        </div>
      </div>
    );
  }

  /* ── Institution bar (mobile only) ────────────────────────────────────── */
  const InstitutionBar = () => (
    <div style={{ ...s.institutionBar, padding: isMobile ? "10px 16px" : "10px 24px" }}>
      <div style={s.institutionInner}>
        <div style={s.institutionLogo}>
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div>
          <p style={{ ...s.institutionName, fontSize: isMobile ? 12 : 13 }}>
            {isMobile ? "Enrollment System" : "Student Enrollment System"}
          </p>
          <p style={s.institutionSub}>Office of the Registrar</p>
        </div>
      </div>
      {!isMobile && (
        <div style={s.schoolYear}>
          <span style={s.schoolYearDot} />
          A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1}
        </div>
      )}
    </div>
  );

  /* ── Enroll form card ──────────────────────────────────────────────────── */
  const EnrollForm = () => (
    <div style={s.formCard}>
      <div style={s.formCardHeader}>
        <div style={s.formHeaderLeft}>
          <div style={s.formIconWrap}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <p style={s.formCardTitle}>New enrollment</p>
            <p style={s.formCardSub}>Select a subject to enroll in for this academic year</p>
          </div>
        </div>
      </div>

      <div style={{ padding: isMobile ? "16px 14px" : "20px 24px" }}>
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 10,
          alignItems: isMobile ? "stretch" : "flex-end",
        }}>
          <div style={{ flex: 1 }}>
            <label style={s.selectLabel}>Subject</label>
            <div style={s.selectWrap}>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(Number(e.target.value))}
                style={s.select}
              >
                <option value="">— Select a subject —</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                ))}
              </select>
              <div style={s.selectArrow}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#64748B" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={enroll}
            disabled={submitting || !subjectId}
            style={{
              ...s.enrollBtn,
              ...(submitting || !subjectId ? s.enrollBtnDisabled : s.enrollBtnActive),
              width: isMobile ? "100%" : "auto",
            }}
          >
            {submitting ? (
              <>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={s.btnSpinner} />
                Enrolling…
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Enroll
              </>
            )}
          </button>
        </div>

        <p style={s.formHint}>
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2} style={{ flexShrink: 0 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Subject availability is subject to section capacity. You may be placed on the waitlist if the section is full.
        </p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     MOBILE  <768px
  ══════════════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{ ...s.page, background: "#F0F4FF" }}>
        <Toast />
        <InstitutionBar />
        <div style={{ padding: "16px 16px 40px" }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ ...s.pageTitle, fontSize: 18, margin: 0 }}>Enroll in Subject</h1>
            <p style={{ ...s.pageSubtitle, marginTop: 2 }}>
              A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1}
            </p>
          </div>
          <EnrollForm />
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
            <p style={s.footerText}>Student Enrollment System · Office of the Registrar</p>
            <p style={{ ...s.footerText, marginTop: 2 }}>
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TABLET  768–1023px
  ══════════════════════════════════════════════════════════════════════════ */
  if (isTablet) {
    return (
      <div style={s.page}>
        <Toast />
        <InstitutionBar />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>
          <div style={{ ...s.pageTitleRow, marginBottom: 20 }}>
            <div>
              <h1 style={{ ...s.pageTitle, fontSize: 20, margin: 0 }}>Enroll in Subject</h1>
              <p style={s.pageSubtitle}>
                A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1}
              </p>
            </div>
            <div style={s.enrolledBadge}>
              <span style={s.schoolYearDot} />
              {subjects.length} Subject{subjects.length !== 1 ? "s" : ""} Available
            </div>
          </div>
          <EnrollForm />
          <div style={{ ...s.footer, flexDirection: "column" as const }}>
            <p style={s.footerText}>This record is computer-generated and is valid without signature.</p>
            <p style={s.footerText}>
              {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     DESKTOP  ≥1024px
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={s.page}>
      <Toast />
      <InstitutionBar />
      <div style={s.container}>
        <div style={s.pageTitleRow}>
          <div>
            <h1 style={s.pageTitle}>Enroll in Subject</h1>
            <p style={s.pageSubtitle}>
              A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1} · Select a subject below to enroll
            </p>
          </div>
          <div style={s.enrolledBadge}>
            <span style={s.schoolYearDot} />
            {subjects.length} Subject{subjects.length !== 1 ? "s" : ""} Available
          </div>
        </div>

        <EnrollForm />

        <div style={s.footer}>
          <p style={s.footerText}>
            This record is computer-generated and is valid without signature. For corrections, visit the Registrar's Office.
          </p>
          <p style={s.footerText}>
            Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page:             { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  institutionBar:   { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "space-between" },
  institutionInner: { display: "flex", alignItems: "center", gap: 10 },
  institutionLogo:  { width: 34, height: 34, background: "#DBEAFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  institutionName:  { margin: 0, fontWeight: 600, color: "#1E3A8A", letterSpacing: "0.01em" },
  institutionSub:   { margin: 0, fontSize: 11, color: "#3B82F6" },
  schoolYear:       { fontSize: 12, color: "#1D4ED8", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  schoolYearDot:    { width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" },

  container:    { maxWidth: 860, margin: "0 auto", padding: "28px 24px 48px" },
  pageTitleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  pageTitle:    { margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" },
  pageSubtitle: { margin: "3px 0 0", fontSize: 13, color: "#64748B" },

  enrolledBadge: { display: "flex", alignItems: "center", gap: 6, background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, border: "1px solid #BFDBFE", flexShrink: 0 },

  formCard:       { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
  formCardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
  formHeaderLeft: { display: "flex", alignItems: "center", gap: 12 },
  formIconWrap:   { width: 34, height: 34, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  formCardTitle:  { margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" },
  formCardSub:    { margin: "2px 0 0", fontSize: 12, color: "#94A3B8" },

  selectLabel: { display: "block", fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  selectWrap:  { position: "relative" as const },
  select:      { width: "100%", appearance: "none" as const, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 36px 10px 12px", fontSize: 13, color: "#1E293B", outline: "none", cursor: "pointer", fontFamily: "inherit" },
  selectArrow: { position: "absolute" as const, right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" as const },

  enrollBtn:         { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" as const },
  enrollBtnActive:   { background: "#1D4ED8", color: "#FFFFFF" },
  enrollBtnDisabled: { background: "#CBD5E1", color: "#94A3B8", cursor: "not-allowed" },
  btnSpinner:        { width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#FFFFFF", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 },

  formHint: { display: "flex", alignItems: "flex-start", gap: 6, marginTop: 10, fontSize: 12, color: "#94A3B8", lineHeight: 1.5 },

  footer:     { marginTop: 28, paddingTop: 20, borderTop: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap" as const, justifyContent: "space-between", gap: 4 },
  footerText: { margin: 0, fontSize: 11, color: "#94A3B8" },

  centerScreen: { minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',system-ui,sans-serif" },
  loaderWrap:   { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 12 },
  spinner:      { width: 36, height: 36, border: "3px solid #BFDBFE", borderTopColor: "#1D4ED8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loaderText:   { margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500 },
};