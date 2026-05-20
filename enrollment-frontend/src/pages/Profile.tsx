import { useEffect, useState, useCallback } from "react";
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

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { isMobile, isTablet } = useWindowSize();

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("profile/");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_picture", file);
    try {
      setUploading(true);
      await api.patch("profile/upload-picture/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={s.centerScreen}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.loaderWrap}>
          <div style={s.spinner} />
          <p style={s.loaderText}>Loading student record…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (!profile) {
    return (
      <div style={s.centerScreen}>
        <div style={s.errorBox}>
          <div style={s.errorIcon}>
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#B91C1C" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
            </svg>
          </div>
          <p style={s.errorTitle}>Record Not Found</p>
          <p style={s.errorSub}>
            No student profile is associated with this account. Please contact the Registrar's Office.
          </p>
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const unitPercent = profile.max_units
    ? Math.min(100, Math.round((profile.total_units / profile.max_units) * 100))
    : 0;
  const initials =
    `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase();

  const infoFields: { label: string; value: any; icon: React.ReactNode }[] = [
    {
      label: "Parent / Guardian",
      value: profile.parent_name,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: "Contact Number",
      value: profile.contact_number,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      label: "Home Address",
      value: profile.home_address,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: "Date of Birth",
      value: profile.birthday,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Age",
      value: profile.age,
      icon: (
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  /* ══════════════════════════════════════════════════════════════════
     SHARED BLOCKS
  ══════════════════════════════════════════════════════════════════ */

  const AvatarRing = ({ size }: { size: number }) => (
    <div style={{ ...s.avatarFrame, width: size, height: size }}>
      {profile.profile_picture ? (
        <img src={profile.profile_picture} alt="Student" style={s.avatarImg} />
      ) : (
        <div style={{ ...s.avatarInitials, fontSize: size * 0.28 }}>{initials}</div>
      )}
    </div>
  );

  const UploadButton = ({ fullWidth = false }: { fullWidth?: boolean }) => (
    <label style={fullWidth ? mob.uploadFull : s.uploadLabel}>
      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      {uploading ? "Uploading…" : fullWidth ? "Change Profile Photo" : "Change Photo"}
      <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
    </label>
  );

  const UnitCard = () => (
    <div style={s.unitCard}>
      <div style={s.unitCardHeader}>
        <div>
          <p style={s.unitLabel}>Current Unit Load</p>
          <div style={s.unitCountRow}>
            <span style={{ ...s.unitCount, fontSize: isMobile ? 26 : 32 }}>{profile.total_units}</span>
            <span style={s.unitMax}>/ {profile.max_units} units</span>
          </div>
        </div>
        <div style={s.unitIconBox}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${unitPercent}%` }} />
      </div>
      <div style={s.progressFooter}>
        <span style={s.progressPct}>{unitPercent}% of maximum load</span>
        <span style={s.progressRemaining}>
          {(profile.max_units ?? 0) - (profile.total_units ?? 0)} units remaining
        </span>
      </div>
    </div>
  );

  const InfoCard = ({ compact = false }: { compact?: boolean }) => (
    <div style={s.infoCard}>
      <div style={s.sectionHeader}>
        <p style={s.sectionTitle}>Personal Information</p>
      </div>
      {infoFields.map((field, i) => (
        <div
          key={field.label}
          style={{
            ...s.fieldRow,
            padding: compact ? "11px 16px" : "14px 20px",
            borderBottom: i < infoFields.length - 1 ? "1px solid #F1F5F9" : "none",
          }}
        >
          <div style={s.fieldIcon}>{field.icon}</div>
          <div style={s.fieldContent}>
            <p style={s.fieldLabel}>{field.label}</p>
            <p style={s.fieldValue}>
              {field.value ?? <span style={s.fieldEmpty}>Not on record</span>}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  const MetaStrip = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {[
        { label: "Program",    value: profile.course || "—" },
        { label: "Year Level", value: profile.year_level ? `Year ${profile.year_level}` : "—" },
        { label: "Semester",   value: profile.semester || "—" },
        { label: "Status",     value: "Regular", green: true },
      ].map(({ label, value, green }, i) => (
        <div
          key={label}
          style={{
            padding: "11px 14px",
            borderRight: i % 2 === 0 ? "1px solid #F1F5F9" : "none",
            borderBottom: i < 2 ? "1px solid #F1F5F9" : "none",
          }}
        >
          <p style={s.metaLabel}>{label}</p>
          <p style={{ ...s.metaValue, ...(green ? { color: "#15803D" } : {}) }}>{value}</p>
        </div>
      ))}
    </div>
  );

  const InstitutionBar = () => (
    <div style={{ ...s.institutionBar, padding: isMobile ? "10px 16px" : "10px 24px" }}>
      <div style={s.institutionInner}>
        <div style={s.institutionLogo}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
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

  const PageFooter = ({ column = false }: { column?: boolean }) => (
    <div style={{ ...s.footer, flexDirection: column ? "column" : "row" }}>
      <p style={s.footerText}>
        This record is computer-generated and is valid without signature. For corrections, visit the Registrar's Office.
      </p>
      <p style={s.footerText}>
        Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════
     MOBILE  <768px — stacked card-first layout
  ══════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{ ...s.page, background: "#F0F4FF" }}>
        <style>{`
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        `}</style>

        <InstitutionBar />

        {/* Hero identity card */}
        <div style={mob.heroCard}>
          <AvatarRing size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={mob.heroName}>{profile.first_name} {profile.last_name}</p>
            <p style={mob.heroEmail}>{profile.email}</p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginTop: 8 }}>
              <span style={mob.badge}>{profile.course || "—"}</span>
              <span style={mob.badgeGray}>Year {profile.year_level} · {profile.semester}</span>
            </div>
          </div>
          <div style={mob.enrolledDot} />
        </div>

        {/* Upload */}
        <div style={mob.section}>
          <UploadButton fullWidth />
        </div>

        {/* Unit load */}
        <div style={mob.section}>
          <UnitCard />
        </div>

        {/* Academic info */}
        <div style={mob.section}>
          <p style={mob.sectionLabel}>Academic Info</p>
          <div style={{ ...s.infoCard }}>
            <MetaStrip />
          </div>
        </div>

        {/* Personal info */}
        <div style={mob.section}>
          <p style={mob.sectionLabel}>Personal Information</p>
          <InfoCard compact />
        </div>

        <div style={{ ...mob.section, paddingBottom: 32 }}>
          <div style={{ paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
            <p style={s.footerText}>
              Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <p style={{ ...s.footerText, marginTop: 2 }}>Student Enrollment System · Office of the Registrar</p>
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     TABLET  768–1023px — single column, horizontal identity card
  ══════════════════════════════════════════════════════════════════ */
  if (isTablet) {
    return (
      <div style={s.page}>
        <style>{`
          @keyframes spin  { to { transform: rotate(360deg); } }
          @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        `}</style>

        <InstitutionBar />

        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 48px" }}>
          <div style={s.pageTitleRow}>
            <div>
              <h1 style={{ ...s.pageTitle, fontSize: 20 }}>Student Profile</h1>
              <p style={s.pageSubtitle}>Official Academic Record · View Only</p>
            </div>
            <div style={s.statusPill}>
              <span style={s.statusDot} />
              Enrolled
            </div>
          </div>

          {/* Horizontal identity card */}
          <div style={{ ...s.identityCard, display: "flex", marginBottom: 16 }}>
            <div style={{ padding: "20px 20px 20px 24px", flexShrink: 0, display: "flex", alignItems: "center" }}>
              <AvatarRing size={80} />
            </div>
            <div style={{ flex: 1, borderLeft: "1px solid #F1F5F9", padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <p style={s.idLabel}>Student Name</p>
                  <p style={{ ...s.idName, fontSize: 16 }}>{profile.first_name} {profile.last_name}</p>
                  <p style={s.idEmail}>{profile.email}</p>
                </div>
                <UploadButton />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                {[
                  profile.course,
                  profile.year_level ? `Year ${profile.year_level}` : null,
                  profile.semester,
                  "Regular",
                ].filter(Boolean).map((v) => (
                  <span key={v} style={tab.badge}>{v}</span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <UnitCard />
            <InfoCard />
          </div>

          <PageFooter column />
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     DESKTOP  ≥1024px — two-column side-by-side
  ══════════════════════════════════════════════════════════════════ */
  return (
    <div style={s.page}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
      `}</style>

      <InstitutionBar />

      <div style={s.container}>
        <div style={s.pageTitleRow}>
          <div>
            <h1 style={s.pageTitle}>Student Profile</h1>
            <p style={s.pageSubtitle}>Official Academic Record · View Only</p>
          </div>
          <div style={s.statusPill}>
            <span style={s.statusDot} />
            Enrolled
          </div>
        </div>

        <div style={s.mainGrid}>
          {/* Left identity card */}
          <div style={s.identityCard}>
            <div style={s.photoSection}>
              <AvatarRing size={96} />
              <UploadButton />
            </div>
            <div style={s.divider} />
            <div style={s.idSection}>
              <p style={s.idLabel}>Student Name</p>
              <p style={s.idName}>{profile.first_name} {profile.last_name}</p>
              <p style={s.idEmail}>{profile.email}</p>
            </div>
            <div style={s.divider} />
            <div style={s.metaGrid}>
              {[
                { label: "Program",    value: profile.course || "—" },
                { label: "Year Level", value: profile.year_level ? `Year ${profile.year_level}` : "—" },
                { label: "Semester",   value: profile.semester || "—" },
                { label: "Status",     value: "Regular", green: true },
              ].map(({ label, value, green }, i) => (
                <div key={label} style={s.metaItem}>
                  <p style={s.metaLabel}>{label}</p>
                  <p style={{ ...s.metaValue, ...(green ? { color: "#15803D", fontWeight: 600 } : {}) }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={s.rightColumn}>
            <UnitCard />
            <InfoCard />
          </div>
        </div>

        <PageFooter />
      </div>
    </div>
  );
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },
  institutionBar: { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "space-between" },
  institutionInner: { display: "flex", alignItems: "center", gap: 10 },
  institutionLogo: { width: 36, height: 36, background: "#DBEAFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  institutionName: { margin: 0, fontWeight: 600, color: "#1E3A8A", letterSpacing: "0.01em" },
  institutionSub: { margin: 0, fontSize: 11, color: "#3B82F6" },
  schoolYear: { fontSize: 12, color: "#1D4ED8", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  schoolYearDot: { width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" },
  container: { maxWidth: 960, margin: "0 auto", padding: "28px 20px 48px" },
  pageTitleRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  pageTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" },
  pageSubtitle: { margin: "3px 0 0", fontSize: 13, color: "#64748B" },
  statusPill: { display: "flex", alignItems: "center", gap: 6, background: "#DCFCE7", color: "#15803D", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 20, border: "1px solid #86EFAC", flexShrink: 0 },
  statusDot: { width: 7, height: 7, borderRadius: "50%", background: "#16A34A", animation: "pulse 2s infinite", display: "inline-block" },
  mainGrid: { display: "grid", gridTemplateColumns: "260px 1fr", gap: 20, alignItems: "start" },
  identityCard: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
  photoSection: { display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px 20px", background: "#F8FAFC" },
  avatarFrame: { borderRadius: "50%", border: "3px solid #BFDBFE", overflow: "hidden", marginBottom: 12, background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarInitials: { fontWeight: 700, color: "#1D4ED8", letterSpacing: "-0.02em" },
  uploadLabel: { display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "#1D4ED8", background: "#DBEAFE", border: "1px solid #BFDBFE", borderRadius: 6, padding: "5px 12px", cursor: "pointer" },
  divider: { height: 1, background: "#F1F5F9" },
  idSection: { padding: "16px 20px" },
  idLabel: { margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  idName: { margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0F172A" },
  idEmail: { margin: 0, fontSize: 12, color: "#64748B" },
  metaGrid: { display: "grid", gridTemplateColumns: "1fr 1fr" },
  metaItem: { padding: "12px 16px", borderRight: "1px solid #F1F5F9", borderBottom: "1px solid #F1F5F9" },
  metaLabel: { margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em" },
  metaValue: { margin: 0, fontSize: 13, fontWeight: 600, color: "#1E293B" },
  rightColumn: { display: "flex", flexDirection: "column", gap: 16 },
  unitCard: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px" },
  unitCardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  unitLabel: { margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  unitCountRow: { display: "flex", alignItems: "baseline", gap: 6 },
  unitCount: { fontWeight: 700, color: "#1E3A8A", lineHeight: 1 },
  unitMax: { fontSize: 14, color: "#94A3B8", fontWeight: 400 },
  unitIconBox: { width: 44, height: 44, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" },
  progressTrack: { height: 8, background: "#E2E8F0", borderRadius: 100, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#2563EB,#3B82F6)", borderRadius: 100, transition: "width 0.8s ease" },
  progressFooter: { display: "flex", justifyContent: "space-between" },
  progressPct: { fontSize: 12, color: "#64748B" },
  progressRemaining: { fontSize: 12, color: "#3B82F6", fontWeight: 500 },
  infoCard: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" },
  sectionHeader: { padding: "14px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" },
  sectionTitle: { margin: 0, fontSize: 12, fontWeight: 600, color: "#475569", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  fieldRow: { display: "flex", alignItems: "flex-start", gap: 14 },
  fieldIcon: { width: 32, height: 32, background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569", flexShrink: 0, marginTop: 1 },
  fieldContent: { flex: 1 },
  fieldLabel: { margin: "0 0 2px", fontSize: 11, fontWeight: 500, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  fieldValue: { margin: 0, fontSize: 14, fontWeight: 500, color: "#1E293B" },
  fieldEmpty: { color: "#CBD5E1", fontStyle: "italic", fontWeight: 400 },
  footer: { marginTop: 28, paddingTop: 20, borderTop: "1px solid #E2E8F0", display: "flex", flexWrap: "wrap" as const, justifyContent: "space-between", gap: 4 },
  footerText: { margin: 0, fontSize: 11, color: "#94A3B8" },
  centerScreen: { minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',system-ui,sans-serif" },
  loaderWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  spinner: { width: 36, height: 36, border: "3px solid #BFDBFE", borderTopColor: "#1D4ED8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loaderText: { margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500 },
  errorBox: { textAlign: "center" as const, maxWidth: 340, padding: 32, background: "#FFF", border: "1px solid #FEE2E2", borderRadius: 12 },
  errorIcon: { width: 52, height: 52, background: "#FEF2F2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" },
  errorTitle: { margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#991B1B" },
  errorSub: { margin: 0, fontSize: 13, color: "#6B7280", lineHeight: 1.6 },
};

/* ─── Mobile-only styles ─────────────────────────────────────────────────── */
const mob: Record<string, React.CSSProperties> = {
  heroCard: { background: "#FFFFFF", margin: "16px 16px 0", borderRadius: 14, border: "1px solid #E2E8F0", padding: 16, display: "flex", alignItems: "flex-start", gap: 14 },
  heroName: { margin: 0, fontSize: 15, fontWeight: 700, color: "#0F172A" },
  heroEmail: { margin: "2px 0 0", fontSize: 12, color: "#64748B" },
  badge: { fontSize: 11, fontWeight: 600, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 20, padding: "2px 10px" },
  badgeGray: { fontSize: 11, fontWeight: 500, background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", borderRadius: 20, padding: "2px 10px" },
  enrolledDot: { width: 10, height: 10, borderRadius: "50%", background: "#22C55E", flexShrink: 0, marginTop: 4, animation: "pulse 2s infinite" },
  section: { padding: "12px 16px 0" },
  sectionLabel: { margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.07em" },
  uploadFull: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 0", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, color: "#1D4ED8", fontSize: 13, fontWeight: 600, cursor: "pointer", boxSizing: "border-box" as const },
};

/* ─── Tablet-only styles ─────────────────────────────────────────────────── */
const tab: Record<string, React.CSSProperties> = {
  badge: { fontSize: 11, fontWeight: 600, padding: "3px 10px", background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 20 },
};
