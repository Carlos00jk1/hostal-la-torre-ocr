import { useEffect, useState } from "react";

import {
  createUser,
  deactivateUser,
  getRoles,
  getUsers,
  updateUser,
} from "../api/api.js";

const emptyForm = {
  username: "",
  password: "",
  role_id: "",
  is_active: true,
};

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      if (!form.role_id && rolesData.length > 0) {
        setForm((current) => ({ ...current, role_id: String(rolesData[0].id) }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      role_id: roles.length > 0 ? String(roles[0].id) : "",
    });
    setEditingId(null);
  }

  function startEdit(user) {
    setEditingId(user.id);
    setForm({
      username: user.username,
      password: "",
      role_id: String(user.role.id),
      is_active: user.is_active,
    });
    setMessage("");
    setError("");
  }

  function buildPayload() {
    const payload = {
      username: form.username,
      role_id: Number(form.role_id),
      is_active: form.is_active,
    };

    if (!editingId || form.password) {
      payload.password = form.password;
    }

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updateUser(editingId, buildPayload());
        setMessage("Usuario actualizado correctamente.");
      } else {
        await createUser(buildPayload());
        setMessage("Usuario creado correctamente.");
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(userId) {
    setMessage("");
    setError("");
    try {
      await deactivateUser(userId);
      setMessage("Usuario desactivado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Usuarios y roles</h2>
          <p className="text-secondary mb-0">
            Administra las cuentas de acceso y los permisos por rol.
          </p>
        </div>
        <span className="al-badge al-badge-primary align-self-start">
          {users.length} usuarios
        </span>
      </div>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        <div className="col-xl-4">
          <form className="al-card p-4" onSubmit={handleSubmit}>
            <h3 className="h5 mb-3">
              {editingId ? "Editar usuario" : "Nuevo usuario"}
            </h3>

            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                Usuario
              </label>
              <input
                className="al-input"
                id="username"
                name="username"
                onChange={handleChange}
                required
                type="text"
                value={form.username}
              />
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <input
                className="al-input"
                id="password"
                name="password"
                onChange={handleChange}
                required={!editingId}
                type="password"
                value={form.password}
              />
              {editingId ? (
                <div className="form-text">
                  Deja este campo vacío para conservar la contraseña actual.
                </div>
              ) : null}
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="role_id">
                Rol
              </label>
              <select
                className="al-input"
                id="role_id"
                name="role_id"
                onChange={handleChange}
                required
                value={form.role_id}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-check form-switch mb-3">
              <input
                checked={form.is_active}
                className="form-check-input"
                id="is_active"
                name="is_active"
                onChange={handleChange}
                type="checkbox"
              />
              <label className="form-check-label" htmlFor="is_active">
                Usuario activo
              </label>
            </div>

            <div className="d-flex gap-2">
              <button className="al-btn al-btn-primary" disabled={saving} type="submit">
                {saving ? "Guardando..." : "Guardar"}
              </button>
              {editingId ? (
                <button className="al-btn al-btn-outline" onClick={resetForm} type="button">
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="col-xl-8">
          <div className="al-card">
            <div className="al-table-responsive">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-secondary" colSpan="4">
                        Cargando usuarios...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && users.length === 0 ? (
                    <tr>
                      <td className="text-secondary" colSpan="4">
                        No hay usuarios registrados.
                      </td>
                    </tr>
                  ) : null}

                  {!loading
                    ? users.map((user) => (
                        <tr key={user.id}>
                          <td className="fw-semibold">{user.username}</td>
                          <td>
                            <span className="badge badge-role">{user.role.name}</span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                user.is_active ? "text-bg-success" : "text-bg-secondary"
                              }`}
                            >
                              {user.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="al-btn-sm al-btn-outline-primary"
                                onClick={() => startEdit(user)}
                                type="button"
                              >
                                Editar
                              </button>
                              <button
                                className="al-btn-sm al-btn-outline-danger"
                                disabled={!user.is_active}
                                onClick={() => handleDeactivate(user.id)}
                                type="button"
                              >
                                Desactivar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Users;
