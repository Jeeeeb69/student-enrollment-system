import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
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

/* ─── InstitutionBar ─────────────────────────────────────────────────────── */
const InstitutionBar = ({ isMobile }: { isMobile: boolean }) => (
  <div style={s.institutionBar}>
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

/* ─── ErrorBanner ────────────────────────────────────────────────────────── */
const ErrorBanner = ({ errorMsg }: { errorMsg: string }) =>
  errorMsg ? (
    <div style={s.errorBanner}>
      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#991B1B" strokeWidth={2} style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
      </svg>
      <span style={s.errorBannerText}>{errorMsg}</span>
    </div>
  ) : null;

/* ─── FormCard ───────────────────────────────────────────────────────────── */
interface FormCardProps {
  compact?: boolean;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: (prev: boolean) => boolean) => void;
  emailFocused: boolean;
  setEmailFocused: (v: boolean) => void;
  passwordFocused: boolean;
  setPasswordFocused: (v: boolean) => void;
  loading: boolean;
  errorMsg: string;
  handleLogin: (e: FormEvent) => void;
}

const FormCard = ({
  compact = false,
  email, setEmail,
  password, setPassword,
  showPassword, setShowPassword,
  emailFocused, setEmailFocused,
  passwordFocused, setPasswordFocused,
  loading,
  errorMsg,
  handleLogin,
}: FormCardProps) => (
  <div style={{ ...s.card, padding: compact ? "28px 20px" : "40px 36px" }}>
    <div style={s.cardHeader}>
      <div style={s.cardIconWrap}>
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#1D4ED8" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div>
        <h1 style={{ ...s.cardTitle, fontSize: compact ? 17 : 19 }}>Student Sign In</h1>
        <p style={s.cardSub}>Access your enrollment records</p>
      </div>
    </div>

    <div style={s.divider} />

    <ErrorBanner errorMsg={errorMsg} />

    <form onSubmit={handleLogin} style={s.form}>
      {/* Email */}
      <div style={s.fieldGroup}>
        <label style={s.fieldLabel} htmlFor="email">Email address</label>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <input
            id="email"
            type="email"
            placeholder="you@university.edu.ph"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ ...s.input, ...(emailFocused ? s.inputFocus : {}) }}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </div>
      </div>

      {/* Password */}
      <div style={s.fieldGroup}>
        <label style={s.fieldLabel} htmlFor="password">Password</label>
        <div style={s.inputWrap}>
          <span style={s.inputIcon}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...s.input, ...(passwordFocused ? s.inputFocus : {}) }}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            style={s.eyeBtn}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
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
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        style={{ ...s.submitBtn, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? (
          <>
            <span style={s.btnSpinner} />
            Signing in…
          </>
        ) : (
          <>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </>
        )}
      </button>
    </form>

    <p style={s.registerText}>
      Don&apos;t have an account?{" "}
      <Link to="/register" style={s.registerLink}>Create account</Link>
    </p>

    <div style={s.cardFooter}>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span style={s.cardFooterText}>Secured by the Office of the Registrar</span>
    </div>
  </div>
);

/* ─── Login (main) ───────────────────────────────────────────────────────── */
const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [emailFocused, setEmailFocused] = useState<boolean>(false);
  const [passwordFocused, setPasswordFocused] = useState<boolean>(false);
  const { isMobile } = useWindowSize();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await api.post("auth/jwt/create/", {
        email,
        password,
      });
      if (res.data?.access) {
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
        window.location.href = "/profile";
      } else {
        setErrorMsg("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formCardProps = {
    email, setEmail,
    password, setPassword,
    showPassword, setShowPassword,
    emailFocused, setEmailFocused,
    passwordFocused, setPasswordFocused,
    loading,
    errorMsg,
    handleLogin,
  };

  if (isMobile) {
    return (
      <div style={{ ...s.page, background: "#F0F4FF" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <InstitutionBar isMobile={isMobile} />
        <div style={{ padding: "24px 16px 40px" }}>
          <FormCard compact {...formCardProps} />
          <p style={s.pageFooterText}>Student Enrollment System · Office of the Registrar</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <InstitutionBar isMobile={isMobile} />

      <div style={s.splitWrapper}>
        <div style={s.leftPanel}>
          <div style={s.leftContent}>
            <div style={s.leftIconWrap}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#BFDBFE" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h2 style={s.leftTitle}>Student Enrollment System</h2>
            <p style={s.leftSub}>
              Access your academic records, enrollment status, and unit load through the official student portal.
            </p>
            <div style={s.leftFeatures}>
              {[
                "View your enrolled subjects",
                "Track unit load progress",
                "Check enrollment status",
                "Access official academic records",
              ].map((item) => (
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
          <p style={s.leftFooter}>
            A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1} · Office of the Registrar
          </p>
        </div>

        <div style={s.rightPanel}>
          <FormCard {...formCardProps} />
        </div>
      </div>
    </div>
  );
};

export default Login;

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#F8FAFC",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
  },
  institutionBar: {
    background: "#EFF6FF",
    borderBottom: "1px solid #BFDBFE",
    padding: "10px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  institutionInner: { display: "flex", alignItems: "center", gap: 10 },
  institutionLogo: {
    width: 36, height: 36, background: "#DBEAFE", borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  institutionName: { margin: 0, fontWeight: 600, color: "#1E3A8A", letterSpacing: "0.01em" },
  institutionSub: { margin: 0, fontSize: 11, color: "#3B82F6" },
  schoolYear: {
    fontSize: 12, color: "#1D4ED8", fontWeight: 500,
    display: "flex", alignItems: "center", gap: 6,
  },
  schoolYearDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#22C55E", display: "inline-block",
  },
  splitWrapper: { flex: 1, display: "flex", minHeight: "calc(100vh - 57px)" },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(160deg, #1E3A8A 0%, #1D4ED8 60%, #2563EB 100%)",
    display: "flex", flexDirection: "column", justifyContent: "space-between",
    padding: "52px 48px",
  },
  leftContent: { maxWidth: 380 },
  leftIconWrap: {
    width: 64, height: 64, background: "rgba(255,255,255,0.12)", borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24,
  },
  leftTitle: {
    margin: "0 0 12px", fontSize: 26, fontWeight: 700,
    color: "#FFFFFF", lineHeight: 1.25, letterSpacing: "-0.01em",
  },
  leftSub: { margin: "0 0 32px", fontSize: 14, color: "#BFDBFE", lineHeight: 1.65 },
  leftFeatures: { display: "flex", flexDirection: "column", gap: 14 },
  leftFeatureItem: { display: "flex", alignItems: "center", gap: 12 },
  leftFeatureCheck: {
    width: 22, height: 22, background: "#DBEAFE", borderRadius: 6,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  leftFeatureText: { fontSize: 13, color: "#EFF6FF", fontWeight: 400 },
  leftFooter: { margin: 0, fontSize: 12, color: "#93C5FD" },
  rightPanel: {
    width: 480, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px", background: "#F8FAFC",
  },
  card: {
    background: "#FFFFFF", border: "1px solid #E2E8F0",
    borderRadius: 14, width: "100%", maxWidth: 400,
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 20 },
  cardIconWrap: {
    width: 44, height: 44, background: "#EFF6FF",
    border: "1px solid #BFDBFE", borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  cardTitle: { margin: "0 0 2px", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.01em" },
  cardSub: { margin: 0, fontSize: 12, color: "#64748B" },
  divider: { height: 1, background: "#F1F5F9", margin: "0 0 20px" },
  errorBanner: {
    display: "flex", alignItems: "flex-start", gap: 8,
    background: "#FEF2F2", border: "1px solid #FECACA",
    borderRadius: 8, padding: "10px 14px", marginBottom: 16,
  },
  errorBannerText: { fontSize: 13, color: "#991B1B", lineHeight: 1.5 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#374151", letterSpacing: "0.01em" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute", left: 12, color: "#94A3B8",
    display: "flex", alignItems: "center", pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 40px 10px 38px",
    fontSize: 13,
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    background: "#F8FAFC",
    color: "#0F172A",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box" as const,
  },
  inputFocus: {
    borderColor: "#2563EB",
    boxShadow: "0 0 0 3px rgba(37,99,235,0.12)",
    background: "#FFFFFF",
  },
  eyeBtn: {
    position: "absolute", right: 10,
    background: "none", border: "none", cursor: "pointer",
    color: "#94A3B8", display: "flex", alignItems: "center", padding: 4,
  },
  submitBtn: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 4, padding: "11px 20px",
    background: "#1D4ED8", color: "#FFFFFF",
    border: "none", borderRadius: 8,
    fontSize: 14, fontWeight: 600, width: "100%",
    transition: "background 0.15s", letterSpacing: "0.01em",
  },
  btnSpinner: {
    width: 15, height: 15,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#FFFFFF", borderRadius: "50%",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  registerText: { marginTop: 18, textAlign: "center" as const, fontSize: 13, color: "#64748B" },
  registerLink: { color: "#1D4ED8", fontWeight: 600, textDecoration: "none" },
  cardFooter: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
    marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F5F9",
  },
  cardFooterText: { fontSize: 11, color: "#94A3B8" },
  pageFooterText: { marginTop: 20, textAlign: "center" as const, fontSize: 11, color: "#94A3B8" },
};
