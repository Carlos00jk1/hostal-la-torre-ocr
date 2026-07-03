import { NavLink } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

/* Iconos SVG inline por módulo – sin CDN */
const moduleIcons = {
  "/dashboard":   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  "/users":       <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  "/guests":      <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  "/ocr-register":<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
  "/services":    <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
  "/purchases":   <><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></>,
  "/sales":       <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  "/reports":     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
};

function SvgIcon({ path }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {path}
    </svg>
  );
}

function AdminLayout({ children, onLogout, user }) {
  const roleName = user?.role?.name;
  const visibleModules = getModulesForRole(roleName);

  return (
    <div className="al-shell">

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className="al-sidebar">

        {/* Brand */}
        <div className="al-brand">
          <span className="al-brand-name">Hostal La Torre</span>
          <span className="al-brand-sub">Gestión hotelera</span>
        </div>

        {/* Separador */}
        <div className="al-sidebar-sep" aria-hidden="true" />

        {/* Navegación */}
        <nav className="al-nav" aria-label="Navegación del sistema">
          <NavLink className={({isActive}) => `al-navlink${isActive ? " al-navlink--active" : ""}`} to="/dashboard">
            <SvgIcon path={moduleIcons["/dashboard"]} />
            <span>Panel</span>
          </NavLink>

          {visibleModules.map((mod) => (
            <NavLink
              className={({isActive}) =>
                `al-navlink${isActive ? " al-navlink--active" : ""}${mod.path === "/ocr-register" ? " al-navlink--ocr" : ""}`
              }
              key={mod.path}
              to={mod.path}
            >
              <SvgIcon path={moduleIcons[mod.path]} />
              <span>{mod.label}</span>
            </NavLink>
          ))}

          {/* Separador antes del botón de salir */}
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0.5rem 0" }} />

          <button className="al-navlink al-navlink--logout" onClick={onLogout} title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Cerrar sesión</span>
          </button>
        </nav>
      </aside>

      {/* ── Contenido principal ───────────────────────────────────── */}
      <div className="al-main">
        <main className="al-content">
          {children}
        </main>
      </div>

    </div>
  );
}

export default AdminLayout;
