import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, login, setToken } from "../api/api.js";

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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
    <section>
      <h1 className="h3">Login</h1>
      <p className="text-secondary">Acceso para usuarios registrados.</p>

      <form className="mt-3" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="username">
            Usuario
          </label>
          <input
            className="form-control"
            id="username"
            onChange={(event) => setUsername(event.target.value)}
            type="text"
            value={username}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="password">
            Contraseña
          </label>
          <input
            className="form-control"
            id="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </section>
  );
}

export default Login;
