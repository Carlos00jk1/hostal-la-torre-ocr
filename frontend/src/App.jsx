import { Link, Route, Routes } from "react-router-dom";

import Dashboard from "./pages/Dashboard.jsx";
import Guests from "./pages/Guests.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import OCRRegister from "./pages/OCRRegister.jsx";
import Purchases from "./pages/Purchases.jsx";
import Sales from "./pages/Sales.jsx";
import Services from "./pages/Services.jsx";
import Users from "./pages/Users.jsx";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/login", label: "Login" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/users", label: "Usuarios" },
  { to: "/guests", label: "Huespedes" },
  { to: "/ocr", label: "OCR" },
  { to: "/services", label: "Servicios" },
  { to: "/purchases", label: "Compras" },
  { to: "/sales", label: "Ventas" },
];

function App() {
  return (
    <div className="min-vh-100 bg-light">
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

      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/ocr" element={<OCRRegister />} />
          <Route path="/services" element={<Services />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
