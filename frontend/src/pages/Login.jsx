import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getCurrentUser, login, setToken } from "../api/api.js";

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tokenData = await login(username, password);
      setToken(tokenData.access_token);
      const user = await getCurrentUser(tokenData.access_token);
      onLogin(user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lp-root">

      {/* Fondo con capas de gradiente */}
      <div className="lp-backdrop" aria-hidden="true" />

      {/* Enlace volver */}
      <Link className="lp-back" to="/">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
        Volver al inicio
      </Link>

      {/* Card central */}
      <div className="lp-card">

        {/* Franja dorada superior */}
        <div className="lp-gold-bar" aria-hidden="true" />

        {/* Header */}
        <div className="lp-header">
          <span className="lp-eyebrow">Acceso interno</span>
          <h1 className="lp-brand-name">Hostal La Torre</h1>
          <p className="lp-brand-sub">Tupiza, Bolivia</p>

          <div className="lp-separator">
            <span className="lp-sep-line" />
            <span className="lp-sep-diamond" aria-hidden="true" />
            <span className="lp-sep-line" />
          </div>

          <p className="lp-brand-hint">Sistema administrativo</p>
        </div>

        {/* Formulario */}
        <form className="lp-form" onSubmit={handleSubmit} noValidate>

          <div className="lp-field">
            <label className="lp-label" htmlFor="lp-user">Usuario</label>
            <div className="lp-input-wrap">
              <svg className="lp-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <input
                className="lp-input"
                id="lp-user"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="lp-field">
            <label className="lp-label" htmlFor="lp-pass">Contrase&ntilde;a</label>
            <div className="lp-input-wrap">
              <svg className="lp-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input
                className="lp-input"
                id="lp-pass"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="lp-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <button className="lp-btn" type="submit" disabled={loading}>
            {loading
              ? <><span className="lp-spinner" aria-hidden="true" /> Ingresando...</>
              : "Ingresar al sistema"}
          </button>

        </form>
      </div>

    </div>
  );
}

export default Login;
