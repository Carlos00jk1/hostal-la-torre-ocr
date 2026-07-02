import { Link } from "react-router-dom";

import { getModulesForRole } from "../config/modules.js";

function Dashboard({ user }) {
  const visibleModules = getModulesForRole(user?.role?.name);

  return (
    <section>
      <div className="bg-white border rounded-2 p-4 mb-4">
        <p className="text-uppercase text-secondary small mb-2">
          Hostal La Torre
        </p>
        <h2 className="h3 mb-2">
          Sistema de gestion web integrando Reconocimiento Optico de Caracteres
          (OCR)
        </h2>
        <p className="text-secondary mb-0">
          Automatizacion del registro y administracion operativa en el Hostal La
          Torre.
        </p>
      </div>

      {user ? (
        <div className="row g-3 mb-4">
          <div className="col-md-6 col-xl-4">
            <div className="bg-white border rounded-2 p-3 h-100">
              <p className="small text-secondary mb-1">Usuario logueado</p>
              <p className="h5 mb-0">{user.username}</p>
            </div>
          </div>
          <div className="col-md-6 col-xl-4">
            <div className="bg-white border rounded-2 p-3 h-100">
              <p className="small text-secondary mb-1">Rol</p>
              <p className="h5 mb-0">{user.role.name}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="row g-3">
        {visibleModules.map((module) => (
          <div className="col-md-6 col-xl-4" key={module.path}>
            <Link className="text-decoration-none text-body" to={module.path}>
              <div className="bg-white border rounded-2 p-4 h-100">
                <h3 className="h5">{module.label}</h3>
                <p className="text-secondary mb-3">{module.description}</p>
                <span className="btn btn-sm btn-primary">Abrir modulo</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Dashboard;
