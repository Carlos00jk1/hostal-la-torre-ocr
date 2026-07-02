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
  { to: "/", label: "Inicio" },
  { to: "/login", label: "Login" },
];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const location = useLocation();
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
    <div className="min-vh-100 bg-light">
      {!isAdminRoute ? (
        <nav className="navbar navbar-expand-lg bg-white border-bottom">
          <div className="container">
            <Link className="navbar-brand fw-semibold" to="/">
              Hostal La Torre OCR
            </Link>
            <div className="navbar-nav flex-row flex-wrap gap-2">
              {links.map((link) => (
                <Link className="nav-link px-2" key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      ) : null}

      <main className={isAdminRoute ? "" : "container py-4"}>
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
