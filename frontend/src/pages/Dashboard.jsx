import { Link } from "react-router-dom";
import { getModulesForRole } from "../config/modules.js";

const moduleLabels = {
  "/users":        "Usuarios y roles",
  "/guests":       "Huéspedes",
  "/ocr-register": "Registro OCR",
  "/services":     "Servicios y consumos",
  "/purchases":    "Compras de insumos",
  "/sales":        "Cobros / Ventas",
  "/reports":      "Reportes operativos",
};

/* SVG paths para cada módulo */
const moduleIconPaths = {
  "/users":        [<path key="a" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>,<circle key="b" cx="9" cy="7" r="4"/>,<path key="c" d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>],
  "/guests":       [<path key="a" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>,<circle key="b" cx="12" cy="7" r="4"/>],
  "/ocr-register": [<rect key="a" x="3" y="3" width="18" height="18" rx="2"/>,<path key="b" d="M3 9h18M9 21V9"/>],
  "/services":     [<path key="a" d="M18 8h1a4 4 0 0 1 0 8h-1"/>,<path key="b" d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>,<line key="c" x1="6" y1="1" x2="6" y2="4"/>,<line key="d" x1="10" y1="1" x2="10" y2="4"/>,<line key="e" x1="14" y1="1" x2="14" y2="4"/>],
  "/purchases":    [<circle key="a" cx="9" cy="21" r="1"/>,<circle key="b" cx="20" cy="21" r="1"/>,<path key="c" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>],
  "/sales":        [<line key="a" x1="12" y1="1" x2="12" y2="23"/>,<path key="b" d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>],
  "/reports":      [<line key="a" x1="18" y1="20" x2="18" y2="10"/>,<line key="b" x1="12" y1="20" x2="12" y2="4"/>,<line key="c" x1="6" y1="20" x2="6" y2="14"/>],
};

function ModuleIcon({ path }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
      strokeLinejoin="round" aria-hidden="true">
      {moduleIconPaths[path]}
    </svg>
  );
}

function Dashboard({ user }) {
  const visibleModules = getModulesForRole(user?.role?.name);

  return (
    <div className="db-root">

      {/* Encabezado del panel */}
      <div className="db-header">
        <div>
          <span className="db-eyebrow">Panel administrativo</span>
          <h1 className="db-title">Bienvenido, {user?.username ?? "usuario"}</h1>
        </div>
        <div className="db-role-pill">
          {user?.role?.name}
        </div>
      </div>

      {/* Grid de módulos en tarjetas */}
      <div className="db-grid">
        {visibleModules.map((mod) => (
          <Link className={`db-card${mod.path === "/ocr-register" ? " db-card--ocr" : ""}`}
            key={mod.path} to={mod.path}>
            <div className="db-card-top">
              <div className="db-card-icon">
                <ModuleIcon path={mod.path} />
              </div>
              {mod.path === "/ocr-register" && (
                <span className="db-card-tag">OCR</span>
              )}
            </div>
            <h2 className="db-card-title">{moduleLabels[mod.path] ?? mod.label}</h2>
            <p className="db-card-desc">{mod.description}</p>
            <span className="db-card-cta">
              Abrir
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        ))}
      </div>

    </div>
  );
}

export default Dashboard;
