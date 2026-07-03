import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import { clearToken, getCurrentUser, getToken } from "./api/api.js";
import AdminLayout from "./components/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Guests from "./pages/Guests.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import OCRRegister from "./pages/OCRRegister.jsx";
import Purchases from "./pages/Purchases.jsx";
import Reports from "./pages/Reports.jsx";
import Sales from "./pages/Sales.jsx";
import Services from "./pages/Services.jsx";
import Users from "./pages/Users.jsx";

const links = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#alojamiento", label: "Alojamiento" },
  { href: "/#atencion", label: "Atención" },
  { href: "/#sistema", label: "Sistema" },
  { href: "/#ubicacion", label: "Ubicación" },
];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();
  const isHomeRoute = location.pathname === "/";
  const isLoginRoute = location.pathname === "/login";
  const isAdminRoute = [
    "/dashboard",
    "/users",
    "/guests",
    "/ocr-register",
    "/services",
    "/purchases",
    "/sales",
    "/reports",
  ].includes(location.pathname);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    getCurrentUser(token)
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setAuthLoading(false));
  }, []);

  function handleLogout() {
    clearToken();
    setUser(null);
  }

  function renderAdminPage(page) {
    return (
      <ProtectedRoute loading={authLoading} user={user}>
        <AdminLayout onLogout={handleLogout} user={user}>
          {page}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <div className="app-shell min-vh-100">
      {!isAdminRoute && !isLoginRoute ? (
        <nav className="navbar navbar-expand-lg public-navbar">
          <div className="container">
            <Link className="navbar-brand public-brand fw-semibold" to="/">
              Hostal La Torre
            </Link>
            <button
              className="navbar-toggler public-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#publicNav"
              aria-controls="publicNav"
              aria-expanded="false"
              aria-label="Abrir menú"
            >
              <span className="toggler-bar" />
              <span className="toggler-bar" />
              <span className="toggler-bar" />
            </button>
            <div className="collapse navbar-collapse" id="publicNav">
              <div className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-1">
                {links.map((link) => (
                  <a className="nav-link px-2 px-lg-3 fw-medium" href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
                <Link className="btn btn-sm btn-nav-ingresar px-4 ms-lg-2 mt-2 mt-lg-0" to="/login">
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
        </nav>
      ) : null}

      <main
        className={
          isAdminRoute
            ? ""
            : isLoginRoute
              ? "login-main"
              : isHomeRoute
                ? "public-home"
                : "container py-4"
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route
            path="/dashboard"
            element={renderAdminPage(<Dashboard user={user} />)}
          />
          <Route path="/users" element={renderAdminPage(<Users />)} />
          <Route path="/guests" element={renderAdminPage(<Guests user={user} />)} />
          <Route
            path="/ocr-register"
            element={renderAdminPage(<OCRRegister user={user} />)}
          />
          <Route path="/services" element={renderAdminPage(<Services user={user} />)} />
          <Route path="/purchases" element={renderAdminPage(<Purchases user={user} />)} />
          <Route path="/sales" element={renderAdminPage(<Sales user={user} />)} />
          <Route path="/reports" element={renderAdminPage(<Reports />)} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
