import { useEffect, useMemo, useState } from "react";

import {
  createService,
  deactivateService,
  getServices,
  updateService,
} from "../api/api.js";

const emptyForm = {
  name: "",
  description: "",
  category: "Hospedaje",
  price: "",
  stock: "",
  is_active: true,
};

const categories = [
  "Hospedaje",
  "Alimentacion",
  "Lavanderia",
  "Bebidas",
  "Habitacion",
  "Otros",
];

function formatPrice(value) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return value;
  }
  return number.toFixed(2);
}

function Services({ user }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role?.name === "Administrador";
  const activeServices = useMemo(
    () => services.filter((service) => service.is_active),
    [services],
  );

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      const data = await getServices();
      setServices(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  function handleChange(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description ?? "",
      category: service.category,
      price: service.price,
      stock: service.stock ?? "",
      is_active: service.is_active,
    });
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      stock: form.stock === "" ? null : Number(form.stock),
    };

    try {
      if (editingId) {
        await updateService(editingId, payload);
        setMessage("Servicio actualizado correctamente.");
      } else {
        await createService(payload);
        setMessage("Servicio creado correctamente.");
      }
      resetForm();
      await loadServices();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(serviceId) {
    if (!window.confirm("¿Confirma que desea desactivar este servicio? No podra usarse en nuevos cobros.")) {
      return;
    }
    setMessage("");
    setError("");
    try {
      await deactivateService(serviceId);
      setMessage("Servicio desactivado correctamente.");
      await loadServices();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Servicios y consumos</h2>
          <p className="text-secondary mb-0">
            Administra conceptos cobrables del hostal: hospedaje, servicios y consumos.
          </p>
        </div>
        <span className="al-badge al-badge-primary align-self-start">
          {activeServices.length} activos
        </span>
      </div>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        {isAdmin ? (
          <div className="col-xl-4">
            <form className="al-card p-4" onSubmit={handleSubmit}>
              <h3 className="h5 mb-3">
                {editingId ? "Editar servicio" : "Nuevo servicio"}
              </h3>

              <div className="mb-3">
                <label className="form-label" htmlFor="name">
                  Nombre
                </label>
                <input
                  className="al-input"
                  id="name"
                  name="name"
                  onChange={handleChange}
                  required
                  type="text"
                  value={form.name}
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="category">
                  Categoría
                </label>
                <select
                  className="al-input"
                  id="category"
                  name="category"
                  onChange={handleChange}
                  value={form.category}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="price">
                    Precio
                  </label>
                  <input
                    className="al-input"
                    id="price"
                    min="0"
                    name="price"
                    onChange={handleChange}
                    required
                    step="0.01"
                    type="number"
                    value={form.price}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label" htmlFor="stock">
                    Stock
                  </label>
                  <input
                    className="al-input"
                    id="stock"
                    min="0"
                    name="stock"
                    onChange={handleChange}
                    type="number"
                    value={form.stock}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  className="al-input"
                  id="description"
                  name="description"
                  onChange={handleChange}
                  rows="3"
                  value={form.description}
                />
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
                  Servicio activo
                </label>
              </div>

              <div className="d-flex gap-2">
                <button className="al-btn al-btn-primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                {editingId ? (
                  <button
                    className="al-btn al-btn-outline"
                    onClick={resetForm}
                    type="button"
                  >
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        ) : null}

        <div className={isAdmin ? "col-xl-8" : "col-12"}>
          <div className="al-card">
            <div className="al-table-responsive">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    {isAdmin ? <th>Acciones</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-secondary" colSpan={isAdmin ? 6 : 5}>
                        Cargando servicios...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && services.length === 0 ? (
                    <tr>
                      <td className="text-secondary" colSpan={isAdmin ? 6 : 5}>
                        No hay servicios registrados.
                      </td>
                    </tr>
                  ) : null}

                  {!loading
                    ? services.map((service) => (
                        <tr key={service.id}>
                          <td>
                            <p className="fw-semibold mb-1">{service.name}</p>
                            <p className="small text-secondary mb-0">
                              {service.description || "Sin descripcion"}
                            </p>
                          </td>
                          <td>
                            <span className="badge bg-gold-soft text-dark">
                              {service.category}
                            </span>
                          </td>
                          <td>Bs. {formatPrice(service.price)}</td>
                          <td>{service.stock ?? "No aplica"}</td>
                          <td>
                            <span
                              className={`badge ${
                                service.is_active
                                  ? "text-bg-success"
                                  : "text-bg-secondary"
                              }`}
                            >
                              {service.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          {isAdmin ? (
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                <button
                                  className="al-btn-sm al-btn-outline-primary"
                                  onClick={() => startEdit(service)}
                                  type="button"
                                >
                                  Editar
                                </button>
                                <button
                                  className="al-btn-sm al-btn-outline-danger"
                                  disabled={!service.is_active}
                                  onClick={() => handleDeactivate(service.id)}
                                  type="button"
                                >
                                  Desactivar
                                </button>
                              </div>
                            </td>
                          ) : null}
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

export default Services;
