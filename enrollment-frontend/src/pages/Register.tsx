import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  return { isMobile: width < 768 };
}

/* ─── Field components — defined OUTSIDE Register so they never remount ─── */
const Field = ({
  label, id, type = "text", placeholder, value, onChange, required = false, suffix,
}: {
  label: string; id: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; required?: boolean;
  suffix?: React.ReactNode;
}) => (
  <div style={s.fieldGroup}>
    <label style={s.fieldLabel} htmlFor={id}>
      {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
    </label>
    <div style={s.inputWrap}>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...s.input, paddingRight: suffix ? 40 : 12 }}
        onFocus={(e) => Object.assign(e.currentTarget.style, s.inputFocus)}
        onBlur={(e) =>
          Object.assign(e.currentTarget.style, {
            outline: "none", borderColor: "#E2E8F0", boxShadow: "none", background: "#F8FAFC",
          })
        }
      />
      {suffix && <span style={s.inputSuffix}>{suffix}</span>}
    </div>
  </div>
);

const SelectField = ({
  label, id, value, onChange, options, required = false,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) => (
  <div style={s.fieldGroup}>
    <label style={s.fieldLabel} htmlFor={id}>
      {label}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}
    </label>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={s.select}
      onFocus={(e) => Object.assign(e.currentTarget.style, s.inputFocus)}
      onBlur={(e) =>
        Object.assign(e.currentTarget.style, {
          outline: "none", borderColor: "#E2E8F0", boxShadow: "none", background: "#F8FAFC",
        })
      }
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const EyeToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
  <button type="button" onClick={toggle} style={s.eyeBtn} aria-label={show ? "Hide password" : "Show password"}>
    {show ? (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ) : (
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>
);

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  // ── Auth states ──
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  // ── Student states ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [parentName, setParentName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [birthday, setBirthday] = useState("");
  const [course, setCourse] = useState("");
  const [yearLevel, setYearLevel] = useState("");
  const [semester, setSemester] = useState("");

  // ── UI states ──
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleRegister = async () => {
    setError("");
    if (!email || !password || !rePassword) { setError("All fields are required."); return; }
    if (password !== rePassword) { setError("Passwords do not match."); return; }
    try {
      setLoading(true);
      await api.post("/auth/users/", { email, password, re_password: rePassword, first_name: firstName, last_name: lastName });
      const loginRes = await api.post("/auth/jwt/create/", { email, password });
      const access = loginRes.data.access;
      localStorage.setItem("access", access);
      await api.patch("/profile/update/", {
        first_name: firstName, last_name: lastName, parent_name: parentName,
        contact_number: contactNumber, home_address: homeAddress,
        birthday, course, year_level: yearLevel, semester,
      }, { headers: { Authorization: `Bearer ${access}` } });
      navigate("/login");
    } catch (err: any) {
      if (err.response?.data?.email) setError(err.response.data.email[0]);
      else if (err.response?.data?.password) setError(err.response.data.password[0]);
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!firstName || !lastName) { setError("First and last name are required."); return; }
    setError(""); setStep(2);
  };

  /* ── Shared small components (don't take state, safe inside) ── */
  const institutionBar = (
    <div style={s.institutionBar}>
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

  const errorBanner = error ? (
    <div style={s.errorBanner}>
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#991B1B" strokeWidth={2} style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
      </svg>
      <span style={s.errorBannerText}>{error}</span>
    </div>
  ) : null;

  const stepIndicator = (
    <div style={s.stepRow}>
      {[{ num: 1, label: "Personal info" }, { num: 2, label: "Account setup" }].map(({ num, label }, i) => (
        <div key={num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ ...s.stepCircle, background: step >= num ? "#1D4ED8" : "#E2E8F0", color: step >= num ? "#fff" : "#94A3B8", border: step === num ? "2px solid #1D4ED8" : "2px solid transparent" }}>
              {step > num ? (
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : num}
            </div>
            <span style={{ ...s.stepLabel, color: step >= num ? "#1D4ED8" : "#94A3B8", fontWeight: step === num ? 600 : 400 }}>{label}</span>
          </div>
          {i === 0 && <div style={{ width: isMobile ? 32 : 48, height: 1, background: step > 1 ? "#1D4ED8" : "#E2E8F0", margin: "0 4px" }} />}
        </div>
      ))}
    </div>
  );

  const step1Fields = (twoCol: boolean) => (
    <>
      <p style={s.sectionHeading}>Personal information</p>
      {twoCol ? (
        <div style={s.colTwo}>
          <Field label="First name" id="firstName" placeholder="Maria" value={firstName} onChange={setFirstName} required />
          <Field label="Last name" id="lastName" placeholder="Reyes" value={lastName} onChange={setLastName} required />
        </div>
      ) : (
        <>
          <Field label="First name" id="firstName" placeholder="Maria" value={firstName} onChange={setFirstName} required />
          <Field label="Last name" id="lastName" placeholder="Reyes" value={lastName} onChange={setLastName} required />
        </>
      )}
      <Field label="Parent / Guardian name" id="parentName" placeholder="Ana Reyes" value={parentName} onChange={setParentName} />
      <Field label="Contact number" id="contactNumber" placeholder="+63 917 555 0192" value={contactNumber} onChange={setContactNumber} />
      <Field label="Home address" id="homeAddress" placeholder="123 Mabini St., Quezon City" value={homeAddress} onChange={setHomeAddress} />
      <Field label="Date of birth" id="birthday" type="date" value={birthday} onChange={setBirthday} />
      <div style={{ ...s.divider, margin: "4px 0 16px" }} />
      <p style={s.sectionHeading}>Academic information</p>
      <SelectField label="Program / Course" id="course" value={course} onChange={setCourse} options={[
        { value: "", label: "Select course" },
        { value: "Information Technology", label: "Information Technology" },
        { value: "Computer Science", label: "Computer Science" },
        { value: "Technology Communication Management", label: "Technology Communication Management" },
      ]} />
      {twoCol ? (
        <div style={s.colTwo}>
          <SelectField label="Year level" id="yearLevel" value={yearLevel} onChange={setYearLevel} options={[
            { value: "", label: "Select year" },
            { value: "1st Year", label: "1st Year" }, { value: "2nd Year", label: "2nd Year" },
            { value: "3rd Year", label: "3rd Year" }, { value: "4th Year", label: "4th Year" },
          ]} />
          <SelectField label="Semester" id="semester" value={semester} onChange={setSemester} options={[
            { value: "", label: "Select semester" },
            { value: "1st Sem", label: "1st Semester" }, { value: "2nd Sem", label: "2nd Semester" },
          ]} />
        </div>
      ) : (
        <>
          <SelectField label="Year level" id="yearLevel" value={yearLevel} onChange={setYearLevel} options={[
            { value: "", label: "Select year" },
            { value: "1st Year", label: "1st Year" }, { value: "2nd Year", label: "2nd Year" },
            { value: "3rd Year", label: "3rd Year" }, { value: "4th Year", label: "4th Year" },
          ]} />
          <SelectField label="Semester" id="semester" value={semester} onChange={setSemester} options={[
            { value: "", label: "Select semester" },
            { value: "1st Sem", label: "1st Semester" }, { value: "2nd Sem", label: "2nd Semester" },
          ]} />
        </>
      )}
      <button type="button" onClick={handleNextStep} style={s.submitBtn}>
        Continue
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );

  const step2Fields = (
    <>
      <p style={s.sectionHeading}>Account credentials</p>
      <Field label="Email address" id="email" type="email" placeholder="you@university.edu.ph" value={email} onChange={setEmail} required />
      <Field
        label="Password" id="password" type={showPassword ? "text" : "password"}
        placeholder="Create a password" value={password} onChange={setPassword} required
        suffix={<EyeToggle show={showPassword} toggle={() => setShowPassword((v) => !v)} />}
      />
      <Field
        label="Confirm password" id="rePassword" type={showRePassword ? "text" : "password"}
        placeholder="Re-enter your password" value={rePassword} onChange={setRePassword} required
        suffix={<EyeToggle show={showRePassword} toggle={() => setShowRePassword((v) => !v)} />}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button type="button" onClick={() => { setError(""); setStep(1); }} style={s.backBtn}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <button type="button" onClick={handleRegister} disabled={loading}
          style={{ ...s.submitBtn, flex: 1, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading
            ? <><span style={s.btnSpinner} /> Creating account…</>
            : <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create account
              </>}
        </button>
      </div>
    </>
  );

  const cardFooter = (
    <>
      <p style={s.registerText}>
        Already have an account?{" "}
        <Link to="/login" style={s.registerLink}>Sign in</Link>
      </p>
      <div style={s.cardFooter}>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span style={s.cardFooterText}>Secured by the Office of the Registrar</span>
      </div>
    </>
  );

  const cardHeader = (fontSize: number) => (
    <div style={s.cardHeader}>
      <div style={s.cardIconWrap}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
      <div>
        <h1 style={{ ...s.cardTitle, fontSize }}>Student Registration</h1>
        <p style={s.cardSub}>Create your enrollment system account</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════
     MOBILE
  ══════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{ ...s.page, background: "#F0F4FF" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        {institutionBar}
        <div style={{ padding: "20px 16px 48px" }}>
          <div style={{ ...s.card, padding: "24px 18px" }}>
            {cardHeader(16)}
            {stepIndicator}
            <div style={{ ...s.divider, margin: "16px 0" }} />
            {errorBanner}
            {step === 1 ? step1Fields(false) : step2Fields}
            {cardFooter}
          </div>
          <p style={s.pageFooterText}>Student Enrollment System · Office of the Registrar</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════
     DESKTOP
  ══════════════════════════════════════ */
  return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {institutionBar}
      <div style={s.splitWrapper}>
        {/* Left branding */}
        <div style={s.leftPanel}>
          <div style={s.leftContent}>
            <div style={s.leftIconWrap}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#BFDBFE" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 style={s.leftTitle}>Create your student account</h2>
            <p style={s.leftSub}>Register to access the official enrollment portal, manage your academic records, and track your unit load.</p>
            <div style={s.leftFeatures}>
              {["Enroll in subjects online", "View and print your academic records", "Monitor unit load progress", "Receive enrollment announcements"].map((item) => (
                <div key={item} style={s.leftFeatureItem}>
                  <div style={s.leftFeatureCheck}>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={s.leftFeatureText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={s.leftFooter}>A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1} · Office of the Registrar</p>
        </div>

        {/* Right form */}
        <div style={s.rightPanel}>
          <div style={{ ...s.card, padding: "36px 32px" }}>
            {cardHeader(18)}
            {stepIndicator}
            <div style={{ ...s.divider, margin: "16px 0" }} />
            {errorBanner}
            {step === 1 ? step1Fields(true) : step2Fields}
            {cardFooter}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" },

  institutionBar: { background: "#EFF6FF", borderBottom: "1px solid #BFDBFE", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  institutionInner: { display: "flex", alignItems: "center", gap: 10 },
  institutionLogo: { width: 36, height: 36, background: "#DBEAFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
  institutionName: { margin: 0, fontWeight: 600, color: "#1E3A8A", letterSpacing: "0.01em" },
  institutionSub: { margin: 0, fontSize: 11, color: "#3B82F6" },
  schoolYear: { fontSize: 12, color: "#1D4ED8", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
  schoolYearDot: { width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block" },

  splitWrapper: { flex: 1, display: "flex", minHeight: "calc(100vh - 57px)" },
  leftPanel: { flex: 1, background: "linear-gradient(160deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 48px" },
  leftContent: { maxWidth: 380 },
  leftIconWrap: { width: 64, height: 64, background: "rgba(255,255,255,0.12)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  leftTitle: { margin: "0 0 12px", fontSize: 26, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.25, letterSpacing: "-0.01em" },
  leftSub: { margin: "0 0 32px", fontSize: 14, color: "#BFDBFE", lineHeight: 1.65 },
  leftFeatures: { display: "flex", flexDirection: "column", gap: 14 },
  leftFeatureItem: { display: "flex", alignItems: "center", gap: 12 },
  leftFeatureCheck: { width: 22, height: 22, background: "#DBEAFE", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  leftFeatureText: { fontSize: 13, color: "#EFF6FF" },
  leftFooter: { margin: 0, fontSize: 12, color: "#93C5FD" },

  rightPanel: { width: 520, flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "36px 28px", background: "#F8FAFC", overflowY: "auto" as const },

  card: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, width: "100%", maxWidth: 460 },
  cardHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  cardIconWrap: { width: 44, height: 44, background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { margin: "0 0 2px", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" },
  cardSub: { margin: 0, fontSize: 12, color: "#64748B" },

  stepRow: { display: "flex", alignItems: "center", gap: 4 },
  stepCircle: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0, transition: "all 0.2s" },
  stepLabel: { fontSize: 12, transition: "color 0.2s" },

  divider: { height: 1, background: "#F1F5F9" },

  errorBanner: { display: "flex", alignItems: "flex-start", gap: 8, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 14 },
  errorBannerText: { fontSize: 13, color: "#991B1B", lineHeight: 1.5 },

  sectionHeading: { fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.07em", margin: "0 0 12px" },
  colTwo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  fieldGroup: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.01em" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  input: { width: "100%", padding: "9px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, background: "#F8FAFC", color: "#0F172A", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", boxSizing: "border-box" as const },
  inputFocus: { borderColor: "#2563EB", boxShadow: "0 0 0 3px rgba(37,99,235,0.12)", background: "#FFFFFF", outline: "none" },
  inputSuffix: { position: "absolute", right: 10, display: "flex", alignItems: "center" },
  select: { width: "100%", padding: "9px 12px", fontSize: 13, border: "1px solid #E2E8F0", borderRadius: 8, background: "#F8FAFC", color: "#0F172A", outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", appearance: "auto" as const, boxSizing: "border-box" as const },
  eyeBtn: { background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center", padding: 4 },

  submitBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", background: "#1D4ED8", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, width: "100%", cursor: "pointer", letterSpacing: "0.01em", marginTop: 4 },
  backBtn: { display: "flex", alignItems: "center", gap: 6, padding: "11px 16px", background: "#F1F5F9", color: "#475569", border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", flexShrink: 0 },
  btnSpinner: { width: 15, height: 15, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "#FFFFFF", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },

  registerText: { marginTop: 18, textAlign: "center" as const, fontSize: 13, color: "#64748B" },
  registerLink: { color: "#1D4ED8", fontWeight: 600, textDecoration: "none" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 18, paddingTop: 14, borderTop: "1px solid #F1F5F9" },
  cardFooterText: { fontSize: 11, color: "#94A3B8" },
  pageFooterText: { marginTop: 16, textAlign: "center" as const, fontSize: 11, color: "#94A3B8" },
};