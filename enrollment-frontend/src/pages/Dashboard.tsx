import { useEffect, useState } from "react";
import api from "../api/axios";

/* ─── Responsive hook (same as Profile) ─────────────────────────────────── */
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
interface Enrollment {
  id: number;
  student_name: string;
  subject_name: string;
  section_name?: string;
  status: "ENROLLED" | "WAITLISTED" | "DROPPED" | string;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function statusStyle(status: string): React.CSSProperties {
  if (status === "ENROLLED")   return { color: "#15803D", background: "#DCFCE7", border: "1px solid #86EFAC" };
  if (status === "WAITLISTED") return { color: "#92400E", background: "#FEF3C7", border: "1px solid #FCD34D" };
  return                              { color: "#991B1B", background: "#FEE2E2", border: "1px solid #FCA5A5" };
}

function statusIcon(status: string) {
  if (status === "ENROLLED") {
    return (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (status === "WAITLISTED") {
    return (
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* ─── Summary counts ─────────────────────────────────────────────────────── */
function getSummary(data: Enrollment[]) {
  return {
    total:      data.length,
    enrolled:   data.filter((e) => e.status === "ENROLLED").length,
    waitlisted: data.filter((e) => e.status === "WAITLISTED").length,
    dropped:    data.filter((e) => e.status === "DROPPED").length,
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [data, setData]       = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useWindowSize();
  const isNarrow = isMobile || isTablet;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("enrollments/");
      setData(res.data);
    } catch (err) {
      console.error("Error fetching enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const summary = getSummary(data);

  /* ── Shared blocks ─────────────────────────────────────────────────────── */

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

  /** Summary stat cards */
  const StatCards = () => {
    const stats = [
      { label: "Total Subjects",  value: summary.total,      color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
      { label: "Enrolled",        value: summary.enrolled,   color: "#15803D", bg: "#DCFCE7", border: "#86EFAC" },
      { label: "Waitlisted",      value: summary.waitlisted, color: "#92400E", bg: "#FEF3C7", border: "#FCD34D" },
      { label: "Dropped",         value: summary.dropped,    color: "#991B1B", bg: "#FEE2E2", border: "#FCA5A5" },
    ];
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
        gap: isMobile ? 10 : 14,
        marginBottom: isNarrow ? 16 : 24,
      }}>
        {stats.map(({ label, value, color, bg, border }) => (
          <div key={label} style={{ ...s.statCard, background: bg, border: `1px solid ${border}` }}>
            <p style={{ ...s.statLabel, color }}>{label}</p>
            <p style={{ ...s.statValue, color }}>{value}</p>
          </div>
        ))}
      </div>
    );
  };

  /** Status pill */
  const StatusPill = ({ status }: { status: string }) => (
    <span style={{ ...s.statusPill, ...statusStyle(status) }}>
      {statusIcon(status)}
      {status}
    </span>
  );

  /** Empty state */
  const EmptyState = () => (
    <div style={s.emptyState}>
      <div style={s.emptyIcon}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p style={s.emptyTitle}>No enrollments found</p>
      <p style={s.emptySub}>Your subject enrollments will appear here once processed.</p>
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
          <p style={s.loaderText}>Loading enrollments…</p>
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
        <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>

        <InstitutionBar />

        <div style={{ padding: "16px 16px 32px" }}>
          {/* Page title */}
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ ...s.pageTitle, fontSize: 18, margin: 0 }}>Enrollment Summary</h1>
            <p style={{ ...s.pageSubtitle, marginTop: 2 }}>Official Academic Record · View Only</p>
          </div>

          <StatCards />

          {/* Card list */}
          {data.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.map((e, i) => (
                <div key={e.id} style={mob.card}>
                  {/* Subject name as card header */}
                  <div style={mob.cardHeader}>
                    <div style={mob.subjectIcon}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <p style={mob.subjectName}>{e.subject_name}</p>
                    <StatusPill status={e.status} />
                  </div>
                  <div style={mob.cardBody}>
                    <div style={mob.cardRow}>
                      <p style={mob.cardLabel}>Student</p>
                      <p style={mob.cardValue}>{e.student_name}</p>
                    </div>
                    <div style={{ ...mob.cardRow, borderBottom: "none" }}>
                      <p style={mob.cardLabel}>Section</p>
                      <p style={mob.cardValue}>{e.section_name || "N/A"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
            <p style={s.footerText}>Student Enrollment System · Office of the Registrar</p>
            <p style={{ ...s.footerText, marginTop: 2 }}>
              Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
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
        <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>

        <InstitutionBar />

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 48px" }}>
          <div style={{ ...s.pageTitleRow, marginBottom: 20 }}>
            <div>
              <h1 style={{ ...s.pageTitle, fontSize: 20, margin: 0 }}>Enrollment Summary</h1>
              <p style={s.pageSubtitle}>Official Academic Record · View Only</p>
            </div>
            <div style={s.enrolledBadge}>
              <span style={s.schoolYearDot} />
              {summary.enrolled} Enrolled
            </div>
          </div>

          <StatCards />

          {/* Tablet: card-based list, slightly wider */}
          {data.length === 0 ? (
            <EmptyState />
          ) : (
            <div style={s.tableCard}>
              <div style={s.tableCardHeader}>
                <p style={s.tableCardTitle}>Subject Enrollments</p>
                <span style={s.recordCount}>{data.length} record{data.length !== 1 ? "s" : ""}</span>
              </div>
              <div>
                {data.map((e, i) => (
                  <div
                    key={e.id}
                    style={{
                      ...tab.row,
                      borderBottom: i < data.length - 1 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <div style={tab.subjectCol}>
                      <div style={mob.subjectIcon}>
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <p style={tab.subjectName}>{e.subject_name}</p>
                        <p style={tab.studentName}>{e.student_name}</p>
                      </div>
                    </div>
                    <p style={tab.section}>{e.section_name || "N/A"}</p>
                    <StatusPill status={e.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ ...s.footer, flexDirection: "column" as const }}>
            <p style={s.footerText}>This record is computer-generated and is valid without signature. For corrections, visit the Registrar's Office.</p>
            <p style={s.footerText}>Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     DESKTOP  ≥1024px — full data table
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={s.page}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>

      <InstitutionBar />

      <div style={s.container}>
        {/* Title row */}
        <div style={s.pageTitleRow}>
          <div>
            <h1 style={s.pageTitle}>Enrollment Summary</h1>
            <p style={s.pageSubtitle}>Official Academic Record · View Only</p>
          </div>
          <div style={s.enrolledBadge}>
            <span style={s.schoolYearDot} />
            {summary.enrolled} of {summary.total} Enrolled
          </div>
        </div>

        <StatCards />

        {/* Table card */}
        {data.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={s.tableCard}>
            <div style={s.tableCardHeader}>
              <p style={s.tableCardTitle}>Subject Enrollments</p>
              <span style={s.recordCount}>{data.length} record{data.length !== 1 ? "s" : ""}</span>
            </div>

            <table style={s.table}>
              <thead>
                <tr>
                  {["#", "Student", "Subject", "Section", "Status"].map((col) => (
                    <th key={col} style={s.th}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((e, i) => (
                  <tr
                    key={e.id}
                    style={{
                      ...s.tr,
                      background: i % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                    }}
                  >
                    <td style={{ ...s.td, color: "#94A3B8", fontSize: 12, width: 40 }}>{i + 1}</td>
                    <td style={s.td}>
                      <div style={des.studentCell}>
                        <div style={des.studentInitials}>
                          {e.student_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <span style={des.studentName}>{e.student_name}</span>
                      </div>
                    </td>
                    <td style={s.td}>
                      <div style={des.subjectCell}>
                        <div style={des.subjectDot} />
                        {e.subject_name}
                      </div>
                    </td>
                    <td style={{ ...s.td, color: "#64748B" }}>{e.section_name || "N/A"}</td>
                    <td style={s.td}>
                      <StatusPill status={e.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={s.footer}>
          <p style={s.footerText}>This record is computer-generated and is valid without signature. For corrections, visit the Registrar's Office.</p>
          <p style={s.footerText}>Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page:            { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  institutionBar:  { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "space-between" },
  institutionInner:{ display: "flex", alignItems: "center", gap: 10 },
  institutionLogo: { width: 36, height: 36, background: "#DBEAFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  institutionName: { margin: 0, fontWeight: 600, color: "#1E3A8A", letterSpacing: "0.01em" },
  institutionSub:  { margin: 0, fontSize: 11, color: "#3B82F6" },
  schoolYear:      { fontSize: 12, color: "#1D4ED8", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  schoolYearDot:   { width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" },

  container:    { maxWidth: 1060, margin: "0 auto", padding: "28px 24px 48px" },
  pageTitleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  pageTitle:    { margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" },
  pageSubtitle: { margin: "3px 0 0", fontSize: 13, color: "#64748B" },

  enrolledBadge: { display: "flex", alignItems: "center", gap: 6, background: "#DCFCE7", color: "#15803D", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, border: "1px solid #86EFAC", flexShrink: 0 },

  statCard:  { borderRadius: 10, padding: "14px 16px" },
  statLabel: { margin: "0 0 4px", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  statValue: { margin: 0, fontSize: 28, fontWeight: 700, lineHeight: 1 },

  statusPill: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20 },

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
  cardHeader:  { display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" },
  subjectIcon: { width: 28, height: 28, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  subjectName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#0F172A", flex: 1, minWidth: 0 },
  cardBody:    { padding: "0 14px" },
  cardRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F8FAFC" },
  cardLabel:   { margin: 0, fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  cardValue:   { margin: 0, fontSize: 13, fontWeight: 500, color: "#1E293B" },
};

/* ─── Tablet-only styles ─────────────────────────────────────────────────── */
const tab: Record<string, React.CSSProperties> = {
  row:         { display: "flex", alignItems: "center", padding: "12px 20px", gap: 12 },
  subjectCol:  { display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  subjectName: { margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" },
  studentName: { margin: 0, fontSize: 11, color: "#94A3B8", marginTop: 1 },
  section:     { fontSize: 13, color: "#64748B", width: 100, flexShrink: 0 },
};

/* ─── Desktop-only styles ────────────────────────────────────────────────── */
const des: Record<string, React.CSSProperties> = {
  studentCell:     { display: "flex", alignItems: "center", gap: 8 },
  studentInitials: { width: 28, height: 28, borderRadius: "50%", background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#1D4ED8", flexShrink: 0 },
  studentName:     { fontSize: 13, fontWeight: 500, color: "#1E293B" },
  subjectCell:     { display: "flex", alignItems: "center", gap: 8 },
  subjectDot:      { width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", flexShrink: 0 },
};