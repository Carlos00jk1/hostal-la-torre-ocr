import { NavLink } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

function AdminLayout({ children, onLogout, user }) {
  const roleName = user?.role?.name;
  const visibleModules = getModulesForRole(roleName);

  return (
    <div className="row g-0">
      <aside className="col-12 col-lg-3 col-xl-2 bg-white border-end min-vh-100">
        <div className="p-3 border-bottom">
          <h2 className="h6 mb-1">Hostal La Torre OCR</h2>
          <p className="small text-secondary mb-0">Menu administrativo</p>
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

      <div className="col bg-light min-vh-100">
        <header className="bg-white border-bottom">
          <div className="container-fluid py-3 px-4 d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
            <div>
              <p className="text-uppercase text-secondary small mb-1">
                Sistema de gestion web con OCR
              </p>
              <h1 className="h4 mb-0">Menu Principal Administrativo</h1>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="text-md-end">
                <p className="mb-0 fw-semibold">{user?.username}</p>
                <p className="small text-secondary mb-0">{roleName}</p>
              </div>
              <button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>
                Cerrar sesion
              </button>
            </div>
          </div>
        </header>

        <main className="container-fluid p-4">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
