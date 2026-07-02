import { Link } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

const moduleInitials = {
  "/users": "UR",
  "/guests": "HU",
  "/ocr-register": "OCR",
  "/services": "SV",
  "/purchases": "CO",
  "/sales": "VE",
  "/reports": "RE",
};

function Dashboard({ user }) {
  const visibleModules = getModulesForRole(user?.role?.name);

  return (
    <section>
      <div className="page-title-block p-4 p-lg-5 mb-4">
        <div className="row g-4 align-items-center">
          <div className="col-lg-8">
            <p className="section-eyebrow mb-2">Hostal La Torre</p>
            <h2 className="h2 mb-3">
              Sistema de gestión web integrando Reconocimiento Óptico de
              Caracteres
            </h2>
            <p className="text-secondary mb-0">
              Automatización del registro y administración operativa del hostal,
              con módulos organizados por rol y apoyo OCR para recepción.
            </p>
          </div>
          {user ? (
            <div className="col-lg-4">
              <div className="bg-white border rounded-2 p-3">
                <p className="small text-secondary mb-1">Sesión activa</p>
                <p className="h5 mb-1">{user.username}</p>
                <span className="badge text-bg-primary">{user.role.name}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="row g-3">
        {visibleModules.map((module) => (
          <div className="col-md-6 col-xl-4" key={module.path}>
            <Link className="text-decoration-none text-body" to={module.path}>
              <div className="module-card">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                  <span className="icon-tile">{moduleInitials[module.path]}</span>
                  <span className="badge bg-gold-soft text-dark">Módulo</span>
                </div>
                <h3 className="h5 mb-2">{module.label}</h3>
                <p className="text-secondary mb-4">{module.description}</p>
                <span className="btn btn-sm btn-primary">Abrir módulo</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
