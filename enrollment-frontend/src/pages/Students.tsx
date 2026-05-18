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
interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  total_units: number;
  max_units: number;
}

/* ─── Units bar helpers ──────────────────────────────────────────────────── */
function unitsColor(total: number, max: number): React.CSSProperties {
  const pct = max > 0 ? total / max : 0;
  if (pct >= 1)   return { color: "#991B1B", background: "#FEE2E2", border: "1px solid #FCA5A5" };
  if (pct >= 0.8) return { color: "#92400E", background: "#FEF3C7", border: "1px solid #FCD34D" };
  return               { color: "#15803D",  background: "#DCFCE7",  border: "1px solid #86EFAC"  };
}

function UnitsBar({ total, max }: { total: number; max: number }) {
  const pct = max > 0 ? Math.min(total / max, 1) : 0;
  const barColor = pct >= 1 ? "#EF4444" : pct >= 0.8 ? "#F59E0B" : "#22C55E";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "#E2E8F0", borderRadius: 99 }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: barColor, borderRadius: 99, transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", whiteSpace: "nowrap" as const }}>
        {total}/{max}
      </span>
    </div>
  );
}

function getInitials(first: string, last: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function Students() {
  const [students, setStudents]   = useState<Student[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [maxUnits, setMaxUnits]   = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(true);

  const { isMobile, isTablet } = useWindowSize();
  const isNarrow = isMobile || isTablet;

  const isAdmin = localStorage.getItem("is_staff") === "true";

  /* ── Data ────────────────────────────────────────────────────────────── */
  const fetchStudents = async () => {
    try {
      const res = await api.get("students/");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ── Form actions ────────────────────────────────────────────────────── */
  const handleSubmit = async () => {
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !maxUnits.trim()) {
      setError("Please fill in all fields including max units.");
      return;
    }

    const isDuplicate = students.some(
      (s) =>
        s.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        s.id !== editingId
    );

    if (isDuplicate) {
      setError("Email already exists.");
      return;
    }

    try {
      if (editingId) {
        await api.put(`students/${editingId}/`, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          max_units: Number(maxUnits),
        });
      } else {
        await api.post("students/", {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          max_units: Number(maxUnits),
        });
      }

      setFirstName("");
      setLastName("");
      setEmail("");
      setMaxUnits("");
      setEditingId(null);
      setError("");
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("You are not allowed to modify students.");
      } else if (err.response?.data?.email) {
        setError(err.response.data.email[0]);
      } else {
        setError("Something went wrong.");
      }
    }
  };

  const handleEdit = (student: Student) => {
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setEmail(student.email);
    setMaxUnits(String(student.max_units));
    setEditingId(student.id);
    setError("");

    if (isMobile) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await api.delete(`students/${id}/`);
      fetchStudents();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("You are not allowed to delete students.");
      } else {
        setError("Failed to delete student.");
      }
    }
  };

  const handleCancel = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setMaxUnits("");
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
            {editingId ? "Edit student" : "Add new student"}
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
            : "1fr 1fr 2fr 80px auto",
          gap: isMobile ? 10 : 12,
          alignItems: "end",
        }}>
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>First name</label>
            <input
              type="text"
              placeholder="e.g. Maria"
              style={s.input}
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); setError(""); }}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Last name</label>
            <input
              type="text"
              placeholder="e.g. Santos"
              style={s.input}
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); setError(""); }}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Email address</label>
            <input
              type="email"
              placeholder="e.g. m.santos@school.edu.ph"
              style={s.input}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
          </div>

          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Max units</label>
            <input
              type="number"
              placeholder="24"
              style={s.input}
              value={maxUnits}
              onChange={(e) => { setMaxUnits(e.target.value); setError(""); }}
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
                  Add student
                </>
              )}
            </button>
            {editingId && (
              <button onClick={handleCancel} style={s.btnSecondary}>Cancel</button>
            )}
          </div>
        </div>
      </div>
    ) : null;

  const EmptyState = () => (
    <div style={s.emptyState}>
      <div style={s.emptyIcon}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p style={s.emptyTitle}>No students found</p>
      <p style={s.emptySub}>
        {isAdmin ? "Add a student using the form above to get started." : "No students have been registered yet."}
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
          <p style={s.loaderText}>Loading students…</p>
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <InstitutionBar />

        <div style={{ padding: "16px 16px 32px" }}>
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ ...s.pageTitle, fontSize: 18, margin: 0 }}>Student Records</h1>
            <p style={{ ...s.pageSubtitle, marginTop: 2 }}>
              {students.length} student{students.length !== 1 ? "s" : ""} registered
            </p>
          </div>

          <ErrorBanner />
          <AdminForm />

          {students.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {students.map((st) => {
                const pill = unitsColor(st.total_units, st.max_units);
                return (
                  <div key={st.id} style={mob.card}>
                    <div style={mob.cardHeader}>
                      <div style={mob.avatar}>
                        {getInitials(st.first_name, st.last_name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={mob.studentName}>{st.first_name} {st.last_name}</p>
                        <p style={mob.emailLabel}>{st.email}</p>
                      </div>
                      <span style={{ ...mob.unitsBadge, ...pill }}>
                        {st.total_units}/{st.max_units} units
                      </span>
                    </div>

                    <div style={{ padding: "10px 14px" }}>
                      <UnitsBar total={st.total_units} max={st.max_units} />
                    </div>

                    {isAdmin && (
                      <div style={mob.cardActions}>
                        <button onClick={() => handleEdit(st)} style={mob.btnEdit}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(st.id)} style={mob.btnDelete}>
                          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
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
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <InstitutionBar />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>
          <div style={{ ...s.pageTitleRow, marginBottom: 20 }}>
            <div>
              <h1 style={{ ...s.pageTitle, fontSize: 20, margin: 0 }}>Student Records</h1>
              <p style={s.pageSubtitle}>
                {students.length} student{students.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <div style={s.countBadge}>
              <span style={s.schoolYearDot} />
              {students.length} Total
            </div>
          </div>

          <ErrorBanner />
          <AdminForm />

          {students.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={s.tableCard}>
              <div style={s.tableCardHeader}>
                <p style={s.tableCardTitle}>Student list</p>
                <span style={s.recordCount}>{students.length} record{students.length !== 1 ? "s" : ""}</span>
              </div>
              <div>
                {students.map((st, i) => (
                  <div
                    key={st.id}
                    style={{
                      ...tab.row,
                      borderBottom: i < students.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <div style={tab.studentCol}>
                      <div style={tab.avatar}>{getInitials(st.first_name, st.last_name)}</div>
                      <div>
                        <p style={tab.studentName}>{st.first_name} {st.last_name}</p>
                        <p style={tab.emailLabel}>{st.email}</p>
                      </div>
                    </div>
                    <div style={{ width: 150 }}>
                      <UnitsBar total={st.total_units} max={st.max_units} />
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleEdit(st)} style={des.btnEdit}>Edit</button>
                        <button onClick={() => handleDelete(st.id)} style={des.btnDelete}>Delete</button>
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
            <h1 style={s.pageTitle}>Student Records</h1>
            <p style={s.pageSubtitle}>Registered students · Office of the Registrar</p>
          </div>
          <div style={s.countBadge}>
            <span style={s.schoolYearDot} />
            {students.length} Student{students.length !== 1 ? "s" : ""}
          </div>
        </div>

        <ErrorBanner />
        <AdminForm />

        {students.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={s.tableCard}>
            <div style={s.tableCardHeader}>
              <p style={s.tableCardTitle}>Student list</p>
              <span style={s.recordCount}>{students.length} record{students.length !== 1 ? "s" : ""}</span>
            </div>

            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Student", "Email", "Units", ...(isAdmin ? ["Actions"] : [])].map((col) => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => {
                  const pill = unitsColor(st.total_units, st.max_units);
                  return (
                    <tr
                      key={st.id}
                      style={{
                        ...s.tr,
                        background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                      }}
                    >
                      <td style={{ ...s.td, color: "#94A3B8", fontSize: 12, width: 40 }}>{i + 1}</td>

                      <td style={s.td}>
                        <div style={des.studentCell}>
                          <div style={des.avatar}>
                            {getInitials(st.first_name, st.last_name)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>
                            {st.first_name} {st.last_name}
                          </span>
                        </div>
                      </td>

                      <td style={{ ...s.td, color: "#64748B", fontSize: 13 }}>
                        {st.email}
                      </td>

                      <td style={{ ...s.td, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1 }}>
                            <UnitsBar total={st.total_units} max={st.max_units} />
                          </div>
                          <span style={{ ...des.unitsPill, ...pill }}>
                            {st.total_units >= st.max_units ? "Maxed" : `${st.max_units - st.total_units} left`}
                          </span>
                        </div>
                      </td>

                      {isAdmin && (
                        <td style={s.td}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => handleEdit(st)} style={des.btnEdit}>
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(st.id)} style={des.btnDelete}>
                              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
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
  avatar:      { width: 36, height: 36, borderRadius: "50%", background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1D4ED8", flexShrink: 0 },
  studentName: { margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" },
  emailLabel:  { margin: 0, fontSize: 11, color: "#64748B", marginTop: 1 },
  unitsBadge:  { fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, flexShrink: 0 },
  cardActions: { display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid #F1F5F9", background: "#F8FAFC" },
  btnEdit:     { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnDelete:   { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 7, padding: "8px", fontSize: 12, fontWeight: 600, cursor: "pointer" },
};

/* ─── Tablet-only styles ─────────────────────────────────────────────────── */
const tab: Record<string, React.CSSProperties> = {
  row:         { display: "flex", alignItems: "center", padding: "12px 20px", gap: 12 },
  studentCol:  { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  avatar:      { width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#1D4ED8", flexShrink: 0 },
  studentName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" },
  emailLabel:  { margin: 0, fontSize: 11, color: "#94A3B8", marginTop: 1 },
};

/* ─── Desktop-only styles ────────────────────────────────────────────────── */
const des: Record<string, React.CSSProperties> = {
  studentCell: { display: "flex", alignItems: "center", gap: 8 },
  avatar:      { width: 30, height: 30, borderRadius: "50%", background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#1D4ED8", flexShrink: 0 },
  unitsPill:   { fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, flexShrink: 0 },
  btnEdit:     { display: "inline-flex", alignItems: "center", gap: 5, background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
  btnDelete:   { display: "inline-flex", alignItems: "center", gap: 5, background: "#FEE2E2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const },
};