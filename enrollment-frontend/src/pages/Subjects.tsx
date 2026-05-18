import { useEffect, useState } from "react";
import api from "../api/axios";

/* ─── Responsive hook ────────────────────────────────────────────────────── */
function useWindowSize() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Subject {
  id: number;
  subject_code: string;
  subject_name: string;
  units: number;
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function Subjects() {
  const [subjects, setSubjects]         = useState<Subject[]>([]);
  const [subjectCode, setSubjectCode]   = useState("");
  const [subjectName, setSubjectName]   = useState("");
  const [units, setUnits]               = useState("");
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(true);

  const { isMobile, isTablet } = useWindowSize();
  const isNarrow = isMobile || isTablet;

  const isAdmin = localStorage.getItem("is_staff") === "true";

  /* ── Data ────────────────────────────────────────────────────────────── */
  const fetchSubjects = async () => {
    try {
      const res = await api.get("subjects/");
      setSubjects(res.data);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  /* ── Form actions ────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setError("");

    if (!subjectCode.trim() || !subjectName.trim() || !units.trim()) {
      setError("Please fill in subject code, name, and units.");
      return;
    }

    if (isNaN(Number(units))) {
      setError("Units must be a valid number.");
      return;
    }

    const isDuplicate = subjects.some(
      (s) =>
        s.subject_code.toLowerCase().trim() === subjectCode.toLowerCase().trim() &&
        s.id !== editingId
    );

    if (isDuplicate) {
      setError("Subject code already exists.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`subjects/${editingId}/`, {
          subject_code: subjectCode.trim(),
          subject_name: subjectName.trim(),
          units: Number(units),
        });
      } else {
        await api.post("subjects/", {
          subject_code: subjectCode.trim(),
          subject_name: subjectName.trim(),
          units: Number(units),
        });
      }

      setSubjectCode("");
      setSubjectName("");
      setUnits("");
      setEditingId(null);
      setError("");
      fetchSubjects();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You are not allowed to modify subjects.");
      } else if (err.response?.data?.subject_code) {
        setError(err.response.data.subject_code[0]);
      } else {
        setError("Error saving subject.");
      }
    }
  };

  const handleEdit = (subject: Subject) => {
    setSubjectCode(subject.subject_code);
    setSubjectName(subject.subject_name);
    setUnits(String(subject.units));
    setEditingId(subject.id);
    setError("");

    /* Scroll to form on mobile */
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await api.delete(`subjects/${id}/`);
      fetchSubjects();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You are not allowed to delete subjects.");
      } else {
        setError("Failed to delete subject.");
      }
    }
  };

  const handleCancel = () => {
    setSubjectCode("");
    setSubjectName("");
    setUnits("");
    setEditingId(null);
    setError("");
  };

  /* ── Shared blocks ───────────────────────────────────────────────────── */

  const InstitutionBar = () => (
    <div style={{ ...s.institutionBar, padding: isMobile ? "10px 16px" : "10px 24px" }}>
      <div style={s.institutionInner}>
        <div style={s.institutionLogo}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth={2}>
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

  const ErrorBanner = () =>
    error ? (
      <div style={s.errorBanner}>
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        {error}
      </div>
    ) : null;

  const AdminForm = () =>
    isAdmin ? (
      <div style={{ ...s.formCard, marginBottom: isNarrow ? 16 : 24 }}>
        <div style={s.formCardHeader}>
          <p style={s.formCardTitle}>
            {editingId ? "Edit subject" : "Add new subject"}
          </p>
          {editingId && (
            <span style={s.editingBadge}>Editing record #{editingId}</span>
          )}
        </div>
        <div style={{
          padding: "16px 20px",
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr"
            : isTablet
            ? "1fr 1fr"
            : "1fr 2fr 80px auto",
          gap: isMobile ? 10 : 12,
          alignItems: "end",
        }}>
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Subject code</label>
            <input
              type="text"
              placeholder="e.g. CS101"
              style={s.input}
              value={subjectCode}
              onChange={(e) => { setSubjectCode(e.target.value); setError(""); }}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Subject name</label>
            <input
              type="text"
              placeholder="e.g. Introduction to Computing"
              style={s.input}
              value={subjectName}
              onChange={(e) => { setSubjectName(e.target.value); setError(""); }}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Units</label>
            <input
              type="number"
              placeholder="3"
              style={s.input}
              value={units}
              onChange={(e) => { setUnits(e.target.value); setError(""); }}
            />
          </div>

          <div style={{
            display: "flex",
            gap: 8,
            ...(isMobile || isTablet ? { gridColumn: "1 / -1" } : {}),
          }}>
            <button onClick={handleSubmit} style={s.btnPrimary}>
              {editingId ? (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Update
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add subject
                </>
              )}
            </button>

            {editingId && (
              <button onClick={handleCancel} style={s.btnSecondary}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    ) : null;

  const EmptyState = () => (
    <div style={s.emptyState}>
      <div style={s.emptyIcon}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p style={s.emptyTitle}>No subjects found</p>
      <p style={s.emptySub}>
        {isAdmin ? "Add a subject using the form above to get started." : "No subjects have been added yet."}
      </p>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     LOADING
  ══════════════════════════════════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════════════════════════════════
     MOBILE  <768px
  ══════════════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{ ...s.page, background: "#F0F4FF" }}>
        <InstitutionBar />

        <div style={{ padding: "16px 16px 32px" }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ ...s.pageTitle, fontSize: 18, margin: 0 }}>Subject Management</h1>
            <p style={{ ...s.pageSubtitle, marginTop: 2 }}>
              {subjects.length} subject{subjects.length !== 1 ? "s" : ""} on record
            </p>
          </div>

          <ErrorBanner />
          <AdminForm />

          {subjects.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {subjects.map((s_) => (
                <div key={s_.id} style={mob.card}>
                  <div style={mob.cardHeader}>
                    <div style={mob.subjectIcon}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={mob.subjectCode}>{s_.subject_code}</p>
                      <p style={mob.subjectName}>{s_.subject_name}</p>
                    </div>
                    <span style={mob.unitsBadge}>{s_.units} {s_.units === 1 ? "unit" : "units"}</span>
                  </div>

                  {isAdmin && (
                    <div style={mob.cardActions}>
                      <button onClick={() => handleEdit(s_)} style={mob.btnEdit}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s_.id)} style={mob.btnDelete}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
            <p style={s.footerText}>Student Enrollment System · Office of the Registrar</p>
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
        <InstitutionBar />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>
          <div style={{ ...s.pageTitleRow, marginBottom: 20 }}>
            <div>
              <h1 style={{ ...s.pageTitle, fontSize: 20, margin: 0 }}>Subject Management</h1>
              <p style={s.pageSubtitle}>
                {subjects.length} subject{subjects.length !== 1 ? "s" : ""} on record
              </p>
            </div>
            <div style={s.countBadge}>
              <span style={s.schoolYearDot} />
              {subjects.length} Total
            </div>
          </div>

          <ErrorBanner />
          <AdminForm />

          {subjects.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={s.tableCard}>
              <div style={s.tableCardHeader}>
                <p style={s.tableCardTitle}>Subject list</p>
                <span style={s.recordCount}>{subjects.length} record{subjects.length !== 1 ? "s" : ""}</span>
              </div>
              <div>
                {subjects.map((s_, i) => (
                  <div
                    key={s_.id}
                    style={{
                      ...tab.row,
                      borderBottom: i < subjects.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <div style={tab.subjectCol}>
                      <div style={mob.subjectIcon}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p style={tab.subjectCode}>{s_.subject_code}</p>
                        <p style={tab.subjectName}>{s_.subject_name}</p>
                      </div>
                    </div>
                    <span style={tab.unitsPill}>{s_.units} {s_.units === 1 ? "unit" : "units"}</span>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleEdit(s_)} style={des.btnEdit}>Edit</button>
                        <button onClick={() => handleDelete(s_.id)} style={des.btnDelete}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ ...s.footer, flexDirection: "column" as const }}>
            <p style={s.footerText}>This record is computer-generated and is valid without signature.</p>
            <p style={s.footerText}>
              Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
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
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <InstitutionBar />

      <div style={s.container}>
        <div style={s.pageTitleRow}>
          <div>
            <h1 style={s.pageTitle}>Subject Management</h1>
            <p style={s.pageSubtitle}>Manage academic subjects · Office of the Registrar</p>
          </div>
          <div style={s.countBadge}>
            <span style={s.schoolYearDot} />
            {subjects.length} Subject{subjects.length !== 1 ? "s" : ""}
          </div>
        </div>

        <ErrorBanner />
        <AdminForm />

        {subjects.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={s.tableCard}>
            <div style={s.tableCardHeader}>
              <p style={s.tableCardTitle}>Subject list</p>
              <span style={s.recordCount}>{subjects.length} record{subjects.length !== 1 ? "s" : ""}</span>
            </div>

            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Code", "Subject name", "Units", ...(isAdmin ? ["Actions"] : [])].map((col) => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((s_, i) => (
                  <tr
                    key={s_.id}
                    style={{
                      ...s.tr,
                      background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                    }}
                  >
                    <td style={{ ...s.td, color: "#94A3B8", fontSize: 12, width: 40 }}>{i + 1}</td>

                    <td style={s.td}>
                      <span style={des.codeTag}>{s_.subject_code}</span>
                    </td>

                    <td style={s.td}>
                      <div style={des.subjectCell}>
                        <div style={des.subjectDot} />
                        {s_.subject_name}
                      </div>
                    </td>

                    <td style={{ ...s.td, color: "#64748B" }}>
                      <span style={des.unitsPill}>{s_.units} {s_.units === 1 ? "unit" : "units"}</span>
                    </td>

                    {isAdmin && (
                      <td style={{ ...s.td }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleEdit(s_)} style={des.btnEdit}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(s_.id)} style={des.btnDelete}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={s.footer}>
          <p style={s.footerText}>This record is computer-generated and is valid without signature. For corrections, visit the Registrar's Office.</p>
          <p style={s.footerText}>
            Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page:             { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  institutionBar:   { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "space-between" },
  institutionInner: { display: "flex", alignItems: "center", gap: 10 },
  institutionLogo:  { width: 36, height: 36, background: "#DBEAFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  institutionName:  { margin: 0, fontWeight: 600, color: "#1E3A8A", letterSpacing: "0.01em" },
  institutionSub:   { margin: 0, fontSize: 11, color: "#3B82F6" },
  schoolYear:       { fontSize: 12, color: "#1D4ED8", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  schoolYearDot:    { width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" },

  container:    { maxWidth: 1060, margin: "0 auto", padding: "28px 24px 48px" },
  pageTitleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  pageTitle:    { margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" },
  pageSubtitle: { margin: "3px 0 0", fontSize: 13, color: "#64748B" },

  countBadge: { display: "flex", alignItems: "center", gap: 6, background: "#EFF6FF", color: "#1D4ED8", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, border: "1px solid #BFDBFE", flexShrink: 0 },

  formCard:       { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
  formCardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
  formCardTitle:  { margin: 0, fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  editingBadge:   { fontSize: 11, color: "#92400E", background: "#FEF3C7", border: "1px solid #FCD34D", padding: "2px 10px", borderRadius: 20, fontWeight: 500 },

  fieldGroup: { display: "flex", flexDirection: "column" as const, gap: 5 },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  input:      { border: "1px solid #CBD5E1", borderRadius: 8, padding: "9px 12px", fontSize: 13, color: "#0F172A", outline: "none", background: "#FFFFFF", width: "100%" },

  btnPrimary:   { display: "inline-flex", alignItems: "center", gap: 6, background: "#1D4ED8", color: "#FFFFFF", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
  btnSecondary: { display: "inline-flex", alignItems: "center", gap: 6, background: "#F1F5F9", color: "#475569", border: "1px solid #CBD5E1", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" },

  errorBanner: { display: "flex", alignItems: "center", gap: 8, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 16 },

  tableCard:       { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
  tableCardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
  tableCardTitle:  { margin: 0, fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  recordCount:     { fontSize: 12, color: "#94A3B8", fontWeight: 500 },

  table: { width: "100%", borderCollapse: "collapse" as const },
  th:    { padding: "11px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" },
  tr:    { transition: "background 0.1s" },
  td:    { padding: "13px 16px", fontSize: 13, fontWeight: 500, color: "#1E293B", borderBottom: "1px solid #F1F5F9" },

  emptyState: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "48px 24px", textAlign: "center" as const },
  emptyIcon:  { width: 60, height: 60, background: "#F1F5F9", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  emptyTitle: { margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#475569" },
  emptySub:   { margin: 0, fontSize: 13, color: "#94A3B8" },

  footer:     { marginTop: 28, paddingTop: 20, borderTop: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap" as const, justifyContent: "space-between", gap: 4 },
  footerText: { margin: 0, fontSize: 11, color: "#94A3B8" },

  centerScreen: { minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',system-ui,sans-serif" },
  loaderWrap:   { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  spinner:      { width: 36, height: 36, border: "3px solid #BFDBFE", borderTopColor: "#1D4ED8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loaderText:   { margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500 },
};

/* ─── Mobile-only styles ─────────────────────────────────────────────────── */
const mob: Record<string, React.CSSProperties> = {
  card:        { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
  cardHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" },
  subjectIcon: { width: 28, height: 28, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  subjectCode: { margin: 0, fontSize: 12, fontWeight: 700, color: "#1D4ED8", letterSpacing: "0.03em" },
  subjectName: { margin: 0, fontSize: 13, fontWeight: 500, color: "#0F172A" },
  unitsBadge:  { fontSize: 11, fontWeight: 600, color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 9px", borderRadius: 20, flexShrink: 0 },
  cardActions: { display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid #F1F5F9", background: "#F8FAFC" },
  btnEdit:     { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnDelete:   { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};

/* ─── Tablet-only styles ─────────────────────────────────────────────────── */
const tab: Record<string, React.CSSProperties> = {
  row:         { display: "flex", alignItems: "center", padding: "12px 20px", gap: 12 },
  subjectCol:  { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  subjectCode: { margin: 0, fontSize: 12, fontWeight: 700, color: "#1D4ED8", letterSpacing: "0.03em" },
  subjectName: { margin: 0, fontSize: 13, fontWeight: 500, color: "#1E293B" },
  unitsPill:   { fontSize: 11, fontWeight: 600, color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "3px 10px", borderRadius: 20, flexShrink: 0, marginRight: 8 },
};

/* ─── Desktop-only styles ────────────────────────────────────────────────── */
const des: Record<string, React.CSSProperties> = {
  codeTag:     { fontFamily: "'JetBrains Mono','Fira Code','Consolas',monospace", fontSize: 12, fontWeight: 600, color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "2px 8px", borderRadius: 5 },
  subjectCell: { display: "flex", alignItems: "center", gap: 8 },
  subjectDot:  { width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 },
  unitsPill:   { fontSize: 11, fontWeight: 600, color: "#475569", background: "#F1F5F9", border: "1px solid #CBD5E1", padding: "3px 10px", borderRadius: 20 },
  btnEdit:     { display: "inline-flex", alignItems: "center", gap: 5, background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
  btnDelete:   { display: "inline-flex", alignItems: "center", gap: 5, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
};