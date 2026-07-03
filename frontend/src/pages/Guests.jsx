import { useEffect, useState } from "react";

import {
  createGuest,
  deactivateGuest,
  getGuests,
  updateGuest,
} from "../api/api.js";

const emptyForm = {
  full_name: "",
  document_number: "",
  document_type: "CI",
  phone: "",
  email: "",
  nationality: "",
  address: "",
  birth_date: "",
  notes: "",
  is_active: true,
};

function toInputDate(value) {
  return value ? value.slice(0, 10) : "";
}

function calculateAge(birthDate) {
  const inputDate = toInputDate(birthDate);
  if (!inputDate) {
    return null;
  }

  const born = new Date(`${inputDate}T00:00:00`);
  if (Number.isNaN(born.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function normalizePayload(form) {
  return {
    full_name: form.full_name,
    document_number: form.document_number,
    document_type: form.document_type,
    phone: form.phone || null,
    email: form.email || null,
    nationality: form.nationality || null,
    address: form.address || null,
    birth_date: form.birth_date ? `${form.birth_date}T00:00:00` : null,
    notes: form.notes || null,
    is_active: form.is_active,
  };
}

function Guests({ user }) {
  const [guests, setGuests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleName = user?.role?.name;
  const isAdmin = roleName === "Administrador";
  const canWrite = isAdmin || roleName === "Recepcionista";
  const formAge = calculateAge(form.birth_date);

  async function loadGuests() {
    setLoading(true);
    setError("");
    try {
      const data = await getGuests();
      setGuests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuests();
  }, []);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(guest) {
    setEditingId(guest.id);
    setForm({
      full_name: guest.full_name,
      document_number: guest.document_number,
      document_type: guest.document_type,
      phone: guest.phone ?? "",
      email: guest.email ?? "",
      nationality: guest.nationality ?? "",
      address: guest.address ?? "",
      birth_date: toInputDate(guest.birth_date),
      notes: guest.notes ?? "",
      is_active: guest.is_active,
    });
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updateGuest(editingId, normalizePayload(form));
        setMessage("Huésped actualizado correctamente.");
      } else {
        await createGuest(normalizePayload(form));
        setMessage("Huésped registrado correctamente.");
      }
      resetForm();
      await loadGuests();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(guestId) {
    if (!window.confirm("¿Confirma que desea desactivar este huesped? No aparecera en listados activos.")) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await deactivateGuest(guestId);
      setMessage("Huesped desactivado correctamente.");
      await loadGuests();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Huéspedes</h2>
          <p className="text-secondary mb-0">
            Administra los datos de identificación y contacto de los huéspedes.
          </p>
        </div>
        <span className="al-badge al-badge-primary align-self-start">
          {guests.length} huéspedes
        </span>
      </div>

      {message ? <div className="al-alert al-alert-success">{message}</div> : null}
      {error ? <div className="al-alert al-alert-danger">{error}</div> : null}

      <div className="row g-4">
        {canWrite ? (
          <div className="col-xl-5">
            <form className="al-card p-4" onSubmit={handleSubmit}>
              <h3 className="h5 mb-3">
                {editingId ? "Editar huesped" : "Nuevo huesped"}
              </h3>

              <p className="al-form-section-title">Identificacion</p>

              <div className="mb-3">
                <label className="form-label" htmlFor="full_name">
                  Nombre completo
                </label>
                <input
                  className="al-input"
                  id="full_name"
                  name="full_name"
                  onChange={handleFieldChange}
                  required
                  type="text"
                  value={form.full_name}
                />
              </div>

              <div className="row">
                <div className="col-md-5 mb-3">
                  <label className="form-label" htmlFor="document_type">
                    Tipo documento
                  </label>
                  <select
                    className="al-input"
                    id="document_type"
                    name="document_type"
                    onChange={handleFieldChange}
                    value={form.document_type}
                  >
                    <option value="CI">CI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="DNI">DNI</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="col-md-7 mb-3">
                  <label className="form-label" htmlFor="document_number">
                    Numero documento
                  </label>
                  <input
                    className="al-input"
                    id="document_number"
                    name="document_number"
                    onChange={handleFieldChange}
                    required
                    type="text"
                    value={form.document_number}
                  />
                </div>
              </div>

              <p className="al-form-section-title">Datos personales</p>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="phone">
                    Telefono
                  </label>
                  <input
                    className="al-input"
                    id="phone"
                    name="phone"
                    onChange={handleFieldChange}
                    type="text"
                    value={form.phone}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="birth_date">
                    Fecha nacimiento
                  </label>
                  <input
                    className="al-input"
                    id="birth_date"
                    name="birth_date"
                    onChange={handleFieldChange}
                    type="date"
                    value={form.birth_date}
                  />
                  <div className="al-form-hint">
                    {formAge !== null ? `Edad: ${formAge} anos` : "Edad no calculada"}
                  </div>
                </div>
              </div>

              <p className="al-form-section-title">Contacto y observaciones</p>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <input
                  className="al-input"
                  id="email"
                  name="email"
                  onChange={handleFieldChange}
                  type="email"
                  value={form.email}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="nationality">
                  Nacionalidad
                </label>
                <input
                  className="al-input"
                  id="nationality"
                  name="nationality"
                  onChange={handleFieldChange}
                  type="text"
                  value={form.nationality}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="address">
                  Dirección
                </label>
                <input
                  className="al-input"
                  id="address"
                  name="address"
                  onChange={handleFieldChange}
                  type="text"
                  value={form.address}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="notes">
                  Notas
                </label>
                <textarea
                  className="al-input"
                  id="notes"
                  name="notes"
                  onChange={handleFieldChange}
                  rows="2"
                  value={form.notes}
                />
              </div>

              <div className="d-flex gap-2">
                <button className="al-btn al-btn-primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : "Guardar huésped"}
                </button>
                {editingId ? (
                  <button className="al-btn al-btn-outline" onClick={resetForm} type="button">
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        ) : null}

        <div className={canWrite ? "col-xl-7" : "col-12"}>
          <div className="al-card">
            <div className="al-table-responsive">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Contacto</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-secondary" colSpan="5">
                        Cargando huéspedes...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && guests.length === 0 ? (
                    <tr>
                      <td className="text-secondary" colSpan="5">
                        No hay huéspedes registrados.
                      </td>
                    </tr>
                  ) : null}

                  {!loading
                    ? guests.map((guest) => (
                        <tr key={guest.id}>
                          <td>
                            <p className="fw-semibold mb-0">{guest.full_name}</p>
                            <small className="text-secondary">
                              {guest.nationality || "Sin nacionalidad"}
                            </small>
                            <br />
                            <small className="text-secondary">
                              {guest.birth_date
                                ? `Fecha nacimiento: ${toInputDate(guest.birth_date)}`
                                : "Sin fecha nacimiento"}
                            </small>
                            <br />
                            <small className="text-secondary">
                              {calculateAge(guest.birth_date) !== null
                                ? `Edad: ${calculateAge(guest.birth_date)} años`
                                : "Edad no calculada"}
                            </small>
                          </td>
                          <td>
                            {guest.document_type} {guest.document_number}
                          </td>
                          <td>
                            <p className="mb-0">{guest.phone || "Sin telefono"}</p>
                            <small className="text-secondary">
                              {guest.email || "Sin email"}
                            </small>
                          </td>
                          <td>
                            <span className={guest.is_active ? "al-badge-active" : "al-badge-inactive"}>
                              {guest.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              {canWrite ? (
                                <button
                                  className="al-btn-sm al-btn-outline-primary"
                                  onClick={() => startEdit(guest)}
                                  type="button"
                                >
                                  Editar
                                </button>
                              ) : null}
                              {isAdmin ? (
                                <button
                                  className="al-btn-sm al-btn-outline-danger"
                                  disabled={!guest.is_active}
                                  onClick={() => handleDeactivate(guest.id)}
                                  type="button"
                                >
                                  Desactivar
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

export default Guests;
