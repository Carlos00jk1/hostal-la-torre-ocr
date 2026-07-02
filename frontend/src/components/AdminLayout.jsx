import { NavLink } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

function AdminLayout({ children, onLogout, user }) {
  const roleName = user?.role?.name;
  const visibleModules = getModulesForRole(roleName);

  return (
    <div className="admin-shell row g-0">
      <aside className="admin-sidebar col-12 col-lg-3 col-xl-2 min-vh-100">
        <div className="p-3 border-bottom border-light border-opacity-10">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-mark bg-gold-soft text-dark">LT</span>
            <div>
              <h2 className="h6 mb-1">Hostal La Torre</h2>
              <p className="small mb-0 text-white-50">Panel administrativo</p>
            </div>
          </div>
        </div>

        <nav className="nav flex-column gap-1 p-3">
          <NavLink className="nav-link rounded" to="/dashboard">
            Dashboard
          </NavLink>
          {visibleModules.map((module) => (
            <NavLink className="nav-link rounded" key={module.path} to={module.path}>
              {module.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="col min-vh-100">
        <header className="admin-header">
          <div className="container-fluid py-3 px-4 d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
            <div>
              <p className="section-eyebrow mb-1">
                Sistema de gestión web con OCR
              </p>
              <h1 className="h4 mb-0">Menú principal administrativo</h1>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="text-md-end bg-light border rounded-2 px-3 py-2">
                <p className="mb-0 fw-semibold">{user?.username}</p>
                <p className="small text-secondary mb-0">{roleName}</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
                Cerrar sesión
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
