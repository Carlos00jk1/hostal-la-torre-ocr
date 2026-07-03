import { useEffect, useState } from "react";

import {
  createUser,
  deactivateUser,
  getRoles,
  getUsers,
  hardDeleteUser,
  reactivateUser,
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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
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
    setShowForm(true);
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

  async function handleReactivate(userId) {
    if (!window.confirm("Confirma que desea reactivar este usuario?")) return;
    setMessage("");
    setError("");
    try {
      await reactivateUser(userId);
      setMessage("Usuario reactivado correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeactivate(userId) {
    if (!window.confirm("¿Confirma que desea desactivar este usuario? No podra iniciar sesion hasta que sea reactivado.")) {
      return;
    }
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

  async function handleHardDelete(userId) {
    if (!window.confirm("¡ATENCION! ¿Confirma que desea ELIMINAR FISICAMENTE a este usuario de la base de datos? Esta accion no se puede deshacer.")) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await hardDeleteUser(userId);
      setMessage("Usuario eliminado permanentemente.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Usuarios y roles</h2>
          <p className="text-secondary mb-0">
            Administra las cuentas de acceso y los permisos por rol.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="al-btn-ghost"
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            type="button"
          >
            {showForm ? "Ocultar formulario" : "Nuevo usuario"}
          </button>
          <span className="al-badge al-badge-primary align-self-center">
            {users.length} usuarios
          </span>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          className="al-input"
          placeholder="Buscar por usuario o rol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
      </div>

      {message ? <div className="al-alert al-alert-success">{message}</div> : null}
      {error ? <div className="al-alert al-alert-danger">{error}</div> : null}

      <div className="row g-4">
        {showForm ? (
          <>
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                      {editingId ? "Editar usuario" : "Nuevo usuario"}
                    </h5>
                    <button type="button" className="btn-close" onClick={resetForm}></button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body p-4">
                      <p className="al-form-section-title">Datos de acceso</p>

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

                      <p className="al-form-section-title">Rol y estado</p>
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
                    </div>
                    <div className="modal-footer bg-light">
                      <button className="al-btn al-btn-outline" onClick={resetForm} type="button">
                        Cancelar
                      </button>
                      <button className="al-btn al-btn-primary" disabled={saving} type="submit">
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        ) : null}

        <div className="col-12">
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

                  {!loading && filteredUsers.length === 0 ? (
                    <tr>
                      <td className="text-secondary" colSpan="4">
                        {searchTerm ? "No se encontraron resultados para su busqueda." : "No hay usuarios registrados."}
                      </td>
                    </tr>
                  ) : null}

                  {!loading
                    ? filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="fw-semibold">{user.username}</td>
                          <td>
                            <span className={user.role.name === "Administrador" ? "al-badge-admin" : user.role.name === "Recepcionista" ? "al-badge-recepcionista" : "al-badge-consulta"}>{user.role.name}</span>
                          </td>
                          <td>
                            <span className={user.is_active ? "al-badge-active" : "al-badge-inactive"}>
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
                              <button
                                className="al-btn-sm al-btn-danger"
                                onClick={() => handleHardDelete(user.id)}
                                type="button"
                              >
                                Eliminar
                              </button>
                              {!user.is_active ? (
                                <button
                                  className="al-btn-sm al-btn-outline-primary"
                                  onClick={() => handleReactivate(user.id)}
                                  type="button"
                                >
                                  Reactivar
                                </button>
                              ) : null}
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
