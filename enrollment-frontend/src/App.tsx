import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Subjects from "./pages/Subjects";
import Sections from "./pages/Sections";
import Enrollments from "./pages/Enrollments";
import Profile from "./pages/Profile";

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
    width,
    isMobile:  width < 768,
    isTablet:  width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

/* ─── Nav items ──────────────────────────────────────────────────────────── */
const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: "/students",
    label: "Students",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/subjects",
    label: "Subjects",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    to: "/sections",
    label: "Sections",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    to: "/enrollments",
    label: "Enrollments",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════════════════════
   LAYOUT
══════════════════════════════════════════════════════════════════════════ */
function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useWindowSize();

  // Close drawer when resizing to desktop
  useEffect(() => {
    if (isDesktop) setMobileOpen(false);
  }, [isDesktop]);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const current = navItems.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  /* ── MOBILE BOTTOM TAB BAR ─────────────────────────────────────────────── */
  const BottomTabBar = () => (
    <nav style={mob.tabBar}>
      {navItems.map(({ to, label, icon }) => {
        const active = isActive(to);
        return (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            style={{
              ...mob.tabItem,
              color: active ? "#1D4ED8" : "#94A3B8",
            }}
          >
            <span style={{ ...mob.tabIcon, color: active ? "#1D4ED8" : "#94A3B8" }}>
              {icon}
            </span>
            <span style={{ ...mob.tabLabel, fontWeight: active ? 600 : 400 }}>{label}</span>
            {active && <span style={mob.tabDot} />}
          </NavLink>
        );
      })}
    </nav>
  );

  /* ── MOBILE HEADER ─────────────────────────────────────────────────────── */
  const MobileHeader = () => (
    <header style={mob.header}>
      <div style={mob.headerLeft}>
        <div style={s.brandIcon}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
        </div>
        <div>
          <p style={{ ...s.brandName, fontSize: 12 }}>Enrollment System</p>
          <p style={s.brandSub}>Office of the Registrar</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ ...s.ayBadge, fontSize: 10, padding: "3px 8px" }}>
          <span style={s.ayDot} />
          A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1}
        </div>
        <button onClick={handleLogout} style={mob.logoutBtn} aria-label="Logout">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );

  /* ── TABLET HEADER ─────────────────────────────────────────────────────── */
  const TabletHeader = () => (
    <header style={s.header}>
      <div style={s.headerLeft}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={s.hamburger}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <p style={s.brandName}>Student Enrollment System</p>
            <p style={s.brandSub}>Office of the Registrar</p>
          </div>
        </div>
      </div>
      <div style={s.headerRight}>
        <div style={s.ayBadge}>
          <span style={s.ayDot} />
          A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1}
        </div>
        <button onClick={handleLogout} style={s.logoutBtn}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );

  /* ── DESKTOP HEADER ────────────────────────────────────────────────────── */
  const DesktopHeader = () => (
    <header style={s.header}>
      <div style={s.headerLeft}>
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1E40AF" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <p style={s.brandName}>Student Enrollment System</p>
            <p style={s.brandSub}>Office of the Registrar</p>
          </div>
        </div>
      </div>
      <div style={s.headerRight}>
        <div style={s.ayBadge}>
          <span style={s.ayDot} />
          A.Y. {new Date().getFullYear()}–{new Date().getFullYear() + 1}
        </div>
        <span style={s.headerDate}>
          {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
        </span>
        <button onClick={handleLogout} style={s.logoutBtn}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );

  /* ── SIDEBAR (desktop always visible, tablet slide-over) ───────────────── */
  const Sidebar = () => (
    <>
      {/* Overlay for tablet drawer */}
      {isTablet && mobileOpen && (
        <div style={s.overlay} onClick={() => setMobileOpen(false)} />
      )}
      <aside style={{
        ...s.sidebar,
        ...(isTablet ? {
          position: "fixed" as const,
          top: 58,
          left: 0,
          height: "calc(100vh - 58px)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s ease",
          boxShadow: mobileOpen ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
          zIndex: 30,
        } : {
          position: "sticky" as const,
          top: 58,
          height: "calc(100vh - 58px)",
        }),
      }}>
        <div style={s.sidebarHeader}>
          <p style={s.sidebarLabel}>Navigation</p>
        </div>
        <nav style={s.nav}>
          {navItems.map(({ to, label, icon }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                style={{
                  ...s.navLink,
                  ...(active ? s.navLinkActive : s.navLinkInactive),
                }}
              >
                <span style={{ ...s.navIcon, color: active ? "#1D4ED8" : "#94A3B8" }}>
                  {icon}
                </span>
                {label}
              </NavLink>
            );
          })}
        </nav>
        <div style={s.sidebarFooter}>
          <div style={s.sidebarFooterInner}>
            <span style={s.sidebarFooterDot} />
            <p style={s.sidebarFooterText}>Enrollment Portal · {new Date().getFullYear()}</p>
          </div>
        </div>
      </aside>
    </>
  );

  /* ── BREADCRUMB ────────────────────────────────────────────────────────── */
  const Breadcrumb = () => (
    <div style={{
      ...s.breadcrumb,
      padding: isMobile ? "8px 16px" : "10px 24px",
    }}>
      <span style={s.breadcrumbHome}>
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </span>
      <span style={s.breadcrumbSep}>/</span>
      <span style={s.breadcrumbCurrent}>{current?.label ?? "Page"}</span>
    </div>
  );

  /* ══════════════════════════════════════════════════════════════════════════
     MOBILE LAYOUT  <768px — header + bottom tab nav, no sidebar
  ══════════════════════════════════════════════════════════════════════════ */
  if (isMobile) {
    return (
      <div style={{ ...s.shell, paddingBottom: 64 }}>
        <MobileHeader />
        <Breadcrumb />
        <main style={{ flex: 1, overflowY: "auto" as const, minWidth: 0 }}>
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/students"    element={<Students />} />
            <Route path="/subjects"    element={<Subjects />} />
            <Route path="/sections"    element={<Sections />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/profile"     element={<Profile />} />
          </Routes>
        </main>
        <BottomTabBar />
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     TABLET LAYOUT  768–1023px — header + slide-over sidebar drawer
  ══════════════════════════════════════════════════════════════════════════ */
  if (isTablet) {
    return (
      <div style={s.shell}>
        <TabletHeader />
        <div style={s.body}>
          <Sidebar />
          <main style={{ flex: 1, overflowY: "auto" as const, minWidth: 0 }}>
            <Breadcrumb />
            <Routes>
              <Route path="/"            element={<Dashboard />} />
              <Route path="/students"    element={<Students />} />
              <Route path="/subjects"    element={<Subjects />} />
              <Route path="/sections"    element={<Sections />} />
              <Route path="/enrollments" element={<Enrollments />} />
              <Route path="/profile"     element={<Profile />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     DESKTOP LAYOUT  ≥1024px — header + permanent sidebar
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={s.shell}>
      <DesktopHeader />
      <div style={s.body}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: "auto" as const, minWidth: 0 }}>
          <Breadcrumb />
          <Routes>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/students"    element={<Students />} />
            <Route path="/subjects"    element={<Subjects />} />
            <Route path="/sections"    element={<Sections />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/profile"     element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*"        element={<Layout />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ─── Shared styles ──────────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#F8FAFC",
    fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
  },

  header: {
    background: "#EFF6FF",
    borderBottom: "1px solid #BFDBFE",
    padding: "0 24px",
    height: 58,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    position: "sticky" as const,
    top: 0,
    zIndex: 40,
  },
  headerLeft:  { display: "flex", alignItems: "center", gap: 14 },
  headerRight: { display: "flex", alignItems: "center", gap: 12 },

  hamburger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    background: "#DBEAFE",
    border: "1px solid #BFDBFE",
    borderRadius: 8,
    cursor: "pointer",
    color: "#1E40AF",
    flexShrink: 0,
  },

  brand:     { display: "flex", alignItems: "center", gap: 10 },
  brandIcon: { width: 34, height: 34, background: "#DBEAFE", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  brandName: { margin: 0, fontSize: 13, fontWeight: 700, color: "#1E3A8A", letterSpacing: "0.01em" },
  brandSub:  { margin: 0, fontSize: 11, color: "#3B82F6" },

  ayBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#DCFCE7",
    color: "#15803D",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid #86EFAC",
    whiteSpace: "nowrap" as const,
  },
  ayDot: { width: 6, height: 6, borderRadius: "50%", background: "#22C55E", display: "inline-block", flexShrink: 0 },

  headerDate: { fontSize: 12, color: "#64748B", fontWeight: 500, whiteSpace: "nowrap" as const },

  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#FEE2E2",
    color: "#991B1B",
    border: "1px solid #FCA5A5",
    borderRadius: 8,
    padding: "6px 13px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
  },

  body:    { display: "flex", flex: 1, position: "relative" as const, overflow: "hidden" },
  overlay: { position: "fixed" as const, inset: 0, zIndex: 20, background: "rgba(0,0,0,0.18)" },

  sidebar: {
    width: 220,
    background: "#FFFFFF",
    borderRight: "1px solid #E2E8F0",
    display: "flex",
    flexDirection: "column" as const,
    flexShrink: 0,
    overflowY: "auto" as const,
  },

  sidebarHeader: { padding: "20px 16px 8px", borderBottom: "1px solid #F1F5F9" },
  sidebarLabel:  { margin: 0, fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.1em" },

  nav:     { display: "flex", flexDirection: "column" as const, gap: 2, padding: "10px 10px" },
  navLink: { display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer" },
  navLinkActive:   { background: "#EFF6FF", color: "#1D4ED8", fontWeight: 600, border: "1px solid #BFDBFE" },
  navLinkInactive: { color: "#475569", border: "1px solid transparent" },
  navIcon: { flexShrink: 0, display: "flex", alignItems: "center" },

  sidebarFooter:      { marginTop: "auto", padding: "16px", borderTop: "1px solid #F1F5F9" },
  sidebarFooterInner: { display: "flex", alignItems: "center", gap: 8 },
  sidebarFooterDot:   { width: 8, height: 8, borderRadius: "50%", background: "#BFDBFE", flexShrink: 0 },
  sidebarFooterText:  { margin: 0, fontSize: 11, color: "#94A3B8" },

  breadcrumb:        { display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", borderBottom: "1px solid #F1F5F9" },
  breadcrumbHome:    { color: "#94A3B8", display: "flex", alignItems: "center" },
  breadcrumbSep:     { color: "#CBD5E1", fontSize: 13 },
  breadcrumbCurrent: { fontSize: 12, fontWeight: 600, color: "#1E293B" },
};

/* ─── Mobile-only styles ─────────────────────────────────────────────────── */
const mob: Record<string, React.CSSProperties> = {
  header: {
    background: "#EFF6FF",
    borderBottom: "1px solid #BFDBFE",
    padding: "0 16px",
    height: 52,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexShrink: 0,
    position: "sticky" as const,
    top: 0,
    zIndex: 40,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    background: "#FEE2E2",
    border: "1px solid #FCA5A5",
    borderRadius: 8,
    cursor: "pointer",
    color: "#991B1B",
  },

  /* Bottom tab bar */
  tabBar: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    background: "#FFFFFF",
    borderTop: "1px solid #E2E8F0",
    display: "flex",
    alignItems: "stretch",
    zIndex: 50,
  },
  tabItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    fontSize: 10,
    fontWeight: 400,
    textDecoration: "none",
    position: "relative" as const,
    paddingTop: 2,
  },
  tabIcon:  { display: "flex", alignItems: "center", justifyContent: "center" },
  tabLabel: { fontSize: 10, lineHeight: 1 },
  tabDot:   { position: "absolute" as const, top: 6, width: 4, height: 4, borderRadius: "50%", background: "#1D4ED8" },
};
