import { NavLink } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

function AdminLayout({ children, onLogout, user }) {
  const roleName = user?.role?.name;
  const visibleModules = getModulesForRole(roleName);

  return (
    <div className="admin-shell row g-0">
      <aside className="admin-sidebar col-12 col-lg-3 col-xl-2 min-vh-100">
        <div className="p-3 border-bottom border-light border-opacity-10">
          <h2 className="admin-brand mb-1">Hostal La Torre</h2>
          <p className="small mb-0 text-white-50">Gestión hotelera OCR</p>
        </div>

        <nav className="nav flex-column gap-1 p-3">
          <NavLink className="nav-link rounded" to="/dashboard">
            <span className="nav-marker" aria-hidden="true" />
            Panel
          </NavLink>
          {visibleModules.map((module) => (
            <NavLink
              className={`nav-link rounded ${
                module.path === "/ocr-register" ? "nav-link-ocr" : ""
              }`}
              key={module.path}
              to={module.path}
            >
              <span className="nav-marker" aria-hidden="true" />
              {module.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="col min-vh-100">
        <header className="admin-header">
          <div className="container-fluid py-3 px-4 d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
            <div>
              <p className="section-eyebrow mb-1">HOSTAL LA TORRE</p>
              <h1 className="h4 mb-0">Panel de administración hotelera</h1>
            </div>

            <div className="session-strip">
              <div className="session-user">
                <span className="session-label">usuario</span>
                <strong>{user?.username}</strong>
              </div>
              <div className="session-user">
                <span className="session-label">rol</span>
                <strong>{roleName}</strong>
              </div>
              <button className="btn btn-outline-secondary btn-sm btn-logout" onClick={onLogout}>
                Salir
              </button>
            </div>
          </div>
        </header>

        <main className="admin-content container-fluid">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
