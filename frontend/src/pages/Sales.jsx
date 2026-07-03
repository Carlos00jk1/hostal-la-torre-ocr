import { useEffect, useMemo, useState } from "react";

import {
  cancelSale,
  createSale,
  getSales,
  getServices,
  updateSale,
} from "../api/api.js";

const emptyDetail = {
  product_service_id: "",
  description: "",
  quantity: "1",
  unit_price: "",
};

const emptyForm = {
  customer_name: "",
  sale_date: new Date().toISOString().slice(0, 10),
  payment_method: "Efectivo",
  notes: "",
  details: [{ ...emptyDetail }],
};

function formatCurrency(value) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return "0.00";
  }
  return number.toFixed(2);
}

function getDetailSubtotal(detail) {
  return Number(detail.quantity || 0) * Number(detail.unit_price || 0);
}

function toInputDate(value) {
  return value ? value.slice(0, 10) : new Date().toISOString().slice(0, 10);
}

function Sales({ user }) {
  const [sales, setSales] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleName = user?.role?.name;
  const isAdmin = roleName === "Administrador";
  const canCreate = isAdmin || roleName === "Recepcionista";
  const activeServices = useMemo(
    () => services.filter((service) => service.is_active),
    [services],
  );
  const formTotal = useMemo(
    () => form.details.reduce((total, detail) => total + getDetailSubtotal(detail), 0),
    [form.details],
  );

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [salesData, servicesData] = await Promise.all([
        getSales(),
        canCreate ? getServices() : Promise.resolve([]),
      ]);
      if (!Array.isArray(salesData)) {
        throw new Error("El backend de ventas no esta actualizado. Reinicia Uvicorn.");
      }
      if (!Array.isArray(servicesData)) {
        throw new Error("El backend de servicios no devolvio una lista valida.");
      }
      setSales(salesData);
      setServices(servicesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm({
      ...emptyForm,
      details: [{ ...emptyDetail }],
      sale_date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleDetailChange(index, field, value) {
    setForm((current) => ({
      ...current,
      details: current.details.map((detail, detailIndex) => {
        if (detailIndex !== index) {
          return detail;
        }

        if (field !== "product_service_id") {
          return { ...detail, [field]: value };
        }

        const selectedService = activeServices.find(
          (service) => String(service.id) === value,
        );

        return {
          ...detail,
          product_service_id: value,
          description: selectedService ? selectedService.name : "",
          unit_price: selectedService ? String(selectedService.price) : "",
        };
      }),
    }));
  }

  function addDetail() {
    setForm((current) => ({
      ...current,
      details: [...current.details, { ...emptyDetail }],
    }));
  }

  function removeDetail(index) {
    setForm((current) => ({
      ...current,
      details:
        current.details.length === 1
          ? current.details
          : current.details.filter((detail, detailIndex) => detailIndex !== index),
    }));
  }

  function startEdit(sale) {
    setEditingId(sale.id);
    setSelectedSale(sale);
    setForm({
      customer_name: sale.customer_name,
      sale_date: toInputDate(sale.sale_date),
      payment_method: sale.payment_method,
      notes: sale.notes ?? "",
      details: sale.details.map((detail) => ({
        product_service_id: detail.product_service_id
          ? String(detail.product_service_id)
          : "",
        description: detail.description ?? "",
        quantity: String(detail.quantity),
        unit_price: String(detail.unit_price),
      })),
    });
    setMessage("");
    setError("");
  }

  function buildPayload() {
    return {
      customer_name: form.customer_name,
      sale_date: `${form.sale_date}T00:00:00`,
      payment_method: form.payment_method,
      notes: form.notes || null,
      details: form.details.map((detail) => ({
        product_service_id: detail.product_service_id
          ? Number(detail.product_service_id)
          : null,
        description: detail.description,
        quantity: Number(detail.quantity),
        unit_price: Number(detail.unit_price),
      })),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (editingId) {
        await updateSale(editingId, buildPayload());
        setMessage("Venta actualizada correctamente.");
      } else {
        await createSale(buildPayload());
        setMessage("Venta registrada correctamente.");
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(saleId) {
    setMessage("");
    setError("");
    try {
      await cancelSale(saleId);
      setMessage("Venta anulada correctamente.");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Cobros / Ventas</h2>
          <p className="text-secondary mb-0">
            Registra ingresos por hospedaje, servicios y consumos del hostal.
          </p>
        </div>
        <span className="al-badge al-badge-primary align-self-start">
          {sales.length} ventas
        </span>
      </div>

      {message ? <div className="alert alert-success">{message}</div> : null}
      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-4">
        {canCreate ? (
          <div className="col-xl-5">
            <form className="al-card p-4" onSubmit={handleSubmit}>
              <h3 className="h5 mb-3">
                {editingId ? "Editar venta" : "Nueva venta"}
              </h3>

              <div className="row">
                <div className="col-md-7 mb-3">
                  <label className="form-label" htmlFor="customer_name">
                    Cliente
                  </label>
                  <input
                    className="al-input"
                    id="customer_name"
                    name="customer_name"
                    onChange={handleFieldChange}
                    required
                    type="text"
                    value={form.customer_name}
                  />
                </div>
                <div className="col-md-5 mb-3">
                  <label className="form-label" htmlFor="sale_date">
                    Fecha
                  </label>
                  <input
                    className="al-input"
                    id="sale_date"
                    name="sale_date"
                    onChange={handleFieldChange}
                    required
                    type="date"
                    value={form.sale_date}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="payment_method">
                  Metodo de pago
                </label>
                <select
                  className="al-input"
                  id="payment_method"
                  name="payment_method"
                  onChange={handleFieldChange}
                  value={form.payment_method}
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="QR">QR</option>
                </select>
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

              <div className="d-flex justify-content-between align-items-center mb-2">
                <h4 className="h6 mb-0">Detalle de venta</h4>
                <button className="al-btn-sm al-btn-outline-primary" onClick={addDetail} type="button">
                  Agregar detalle
                </button>
              </div>

              {form.details.map((detail, index) => (
                <div className="border rounded-2 p-3 mb-3" key={index}>
                  <div className="mb-2">
                    <label className="form-label" htmlFor={`service_${index}`}>
                      Servicio o producto
                    </label>
                    <select
                      className="al-input"
                      id={`service_${index}`}
                      onChange={(event) =>
                        handleDetailChange(index, "product_service_id", event.target.value)
                      }
                      value={detail.product_service_id}
                    >
                      <option value="">Venta manual</option>
                      {activeServices.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - Bs. {formatCurrency(service.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label" htmlFor={`description_${index}`}>
                      Descripción
                    </label>
                    <input
                      className="al-input"
                      id={`description_${index}`}
                      onChange={(event) =>
                        handleDetailChange(index, "description", event.target.value)
                      }
                      required
                      type="text"
                      value={detail.description}
                    />
                  </div>

                  <div className="row align-items-end">
                    <div className="col-md-4 mb-2">
                      <label className="form-label" htmlFor={`quantity_${index}`}>
                        Cantidad
                      </label>
                      <input
                        className="al-input"
                        id={`quantity_${index}`}
                        min="0.01"
                        onChange={(event) =>
                          handleDetailChange(index, "quantity", event.target.value)
                        }
                        required
                        step="0.01"
                        type="number"
                        value={detail.quantity}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <label className="form-label" htmlFor={`unit_price_${index}`}>
                        Precio unitario
                      </label>
                      <input
                        className="al-input"
                        id={`unit_price_${index}`}
                        min="0"
                        onChange={(event) =>
                          handleDetailChange(index, "unit_price", event.target.value)
                        }
                        required
                        step="0.01"
                        type="number"
                        value={detail.unit_price}
                      />
                    </div>
                    <div className="col-md-4 mb-2">
                      <p className="small text-secondary mb-1">Subtotal</p>
                      <p className="fw-semibold mb-0">
                        Bs. {formatCurrency(getDetailSubtotal(detail))}
                      </p>
                    </div>
                  </div>
                  <button
                    className="al-btn-sm al-btn-outline-danger"
                    disabled={form.details.length === 1}
                    onClick={() => removeDetail(index)}
                    type="button"
                  >
                    Quitar
                  </button>
                </div>
              ))}

              <div className="d-flex justify-content-between align-items-center border-top pt-3 mb-3">
                <span className="text-secondary">Total calculado</span>
                <strong>Bs. {formatCurrency(formTotal)}</strong>
              </div>

              <div className="d-flex gap-2">
                <button className="al-btn al-btn-primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : "Guardar venta"}
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

        <div className={canCreate ? "col-xl-7" : "col-12"}>
          <div className="al-card mb-4">
            <div className="al-table-responsive">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-secondary" colSpan="6">
                        Cargando ventas...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && sales.length === 0 ? (
                    <tr>
                      <td className="text-secondary" colSpan="6">
                        No hay ventas registradas.
                      </td>
                    </tr>
                  ) : null}

                  {!loading
                    ? sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>{sale.customer_name}</td>
                          <td>{toInputDate(sale.sale_date)}</td>
                          <td>{sale.payment_method}</td>
                          <td>Bs. {formatCurrency(sale.total_amount)}</td>
                          <td>
                            <span
                              className={`badge ${
                                sale.status === "anulada"
                                  ? "text-bg-secondary"
                                  : "text-bg-success"
                              }`}
                            >
                              {sale.status === "anulada" ? "Anulada" : "Vigente"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setSelectedSale(sale)}
                                type="button"
                              >
                                Ver detalle
                              </button>
                              {isAdmin ? (
                                <>
                                  <button
                                    className="al-btn-sm al-btn-outline-primary"
                                    onClick={() => startEdit(sale)}
                                    type="button"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    className="al-btn-sm al-btn-outline-danger"
                                    disabled={sale.status === "anulada"}
                                    onClick={() => handleCancel(sale.id)}
                                    type="button"
                                  >
                                    Anular
                                  </button>
                                </>
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

          {selectedSale ? (
            <div className="al-card p-4">
              <div className="d-flex justify-content-between gap-3 mb-3">
                <div>
                  <h3 className="h5 mb-1">Detalle de venta</h3>
                  <p className="text-secondary mb-0">
                    {selectedSale.customer_name} - {toInputDate(selectedSale.sale_date)}
                  </p>
                </div>
                <strong>Bs. {formatCurrency(selectedSale.total_amount)}</strong>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge text-bg-light border">
                  Pago: {selectedSale.payment_method}
                </span>
                <span
                  className={`badge ${
                    selectedSale.status === "anulada"
                      ? "text-bg-secondary"
                      : "text-bg-success"
                  }`}
                >
                  {selectedSale.status === "anulada" ? "Anulada" : "Vigente"}
                </span>
              </div>

              {selectedSale.notes ? (
                <p className="text-secondary">{selectedSale.notes}</p>
              ) : null}

              <div className="al-table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Precio unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.details.map((detail) => (
                      <tr key={detail.id}>
                        <td>{detail.description}</td>
                        <td>{formatCurrency(detail.quantity)}</td>
                        <td>Bs. {formatCurrency(detail.unit_price)}</td>
                        <td>Bs. {formatCurrency(detail.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default Sales;
