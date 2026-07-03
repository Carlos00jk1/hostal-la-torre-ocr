import { Link } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

const moduleLabels = {
  "/users": "Usuarios y roles",
  "/guests": "Huéspedes",
  "/ocr-register": "Registro OCR",
  "/services": "Servicios y consumos",
  "/purchases": "Compras de insumos",
  "/sales": "Cobros / Ventas",
  "/reports": "Reportes operativos",
};

function Dashboard({ user }) {
  const visibleModules = getModulesForRole(user?.role?.name);

  return (
    <section>
      <div className="admin-hero p-4 p-lg-5 mb-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            <p className="section-eyebrow mb-2">Panel administrativo</p>
            <h2 className="display-6 fw-bold mb-3">
              Gestión operativa del Hostal La Torre
            </h2>
            <p className="text-secondary mb-0">
              Acceso centralizado para recepción, administración, cobros,
              compras, reportes y registro OCR de huéspedes.
            </p>
          </div>
          {user ? (
            <div className="col-lg-4">
              <div className="session-card p-3">
                <p className="small text-secondary mb-1">Sesión activa</p>
                <p className="h5 mb-2">{user.username}</p>
                <span className="badge badge-role">{user.role.name}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {visibleModules.some((module) => module.path === "/ocr-register") ? (
        <Link className="text-decoration-none text-body" to="/ocr-register">
          <div className="ocr-feature p-4 mb-4">
            <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center">
              <div>
                <span className="badge bg-gold-soft text-dark mb-2">Innovación</span>
                <h3 className="h4 mb-2">Registro OCR de huéspedes</h3>
                <p className="text-secondary mb-0">
                  Carga imágenes del documento, detecta datos y agiliza el
                  registro en recepción.
                </p>
              </div>
              <span className="btn btn-primary">Abrir</span>
            </div>
          </div>
        </Link>
      ) : null}

      <div className="row g-3">
        {visibleModules.map((module) => (
          <div className="col-md-6 col-xl-4" key={module.path}>
            <Link className="text-decoration-none text-body" to={module.path}>
              <div
                className={`module-card ${
                  module.path === "/ocr-register" ? "module-card-ocr" : ""
                }`}
              >
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                  <span className="module-marker" aria-hidden="true" />
                  <span className="badge bg-gold-soft text-dark">
                    {module.path === "/ocr-register" ? "Innovación" : "Módulo"}
                  </span>
                </div>
                <h3 className="h5 mb-2">{moduleLabels[module.path] ?? module.label}</h3>
                <p className="text-secondary mb-4">{module.description}</p>
                <span className="btn btn-sm btn-primary">Abrir</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
