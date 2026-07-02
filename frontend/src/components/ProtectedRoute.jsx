import { Navigate } from "react-router-dom";

import { getToken } from "../api/api.js";

function ProtectedRoute({ children, user, loading }) {
  if (loading) {
    return <p className="text-secondary">Verificando sesion...</p>;
  }

  if (!user && !getToken()) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
