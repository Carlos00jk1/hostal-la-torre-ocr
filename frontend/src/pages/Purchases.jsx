import { useEffect, useMemo, useState } from "react";

import {
  cancelPurchase,
  createPurchase,
  getPurchases,
  updatePurchase,
} from "../api/api.js";

const emptyDetail = {
  item_name: "",
  quantity: "1",
  unit_price: "",
};

const emptyForm = {
  supplier_name: "",
  purchase_date: new Date().toISOString().slice(0, 10),
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

function Purchases({ user }) {
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = user?.role?.name === "Administrador";
  const formTotal = useMemo(
    () => form.details.reduce((total, detail) => total + getDetailSubtotal(detail), 0),
    [form.details],
  );

  async function loadPurchases() {
    setLoading(true);
    setError("");
    try {
      const data = await getPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPurchases();
  }, []);

  function resetForm() {
    setForm({
      ...emptyForm,
      details: [{ ...emptyDetail }],
      purchase_date: new Date().toISOString().slice(0, 10),
    });
    setFormTotal(0);
    setEditingId(null);
    setShowForm(false);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleDetailChange(index, field, value) {
    setForm((current) => ({
      ...current,
      details: current.details.map((detail, detailIndex) =>
        detailIndex === index ? { ...detail, [field]: value } : detail,
      ),
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

  function startEdit(purchase) {
    setEditingId(purchase.id);
    setSelectedPurchase(purchase);
    setForm({
      supplier_name: purchase.supplier_name,
      purchase_date: toInputDate(purchase.purchase_date),
      notes: purchase.notes ?? "",
      details: purchase.details.map((detail) => ({
        item_name: detail.item_name,
        quantity: String(detail.quantity),
        unit_price: String(detail.unit_price),
      })),
    });
    setMessage("");
    setError("");
    setShowForm(true);
  }

  function buildPayload() {
    return {
      supplier_name: form.supplier_name,
      purchase_date: `${form.purchase_date}T00:00:00`,
      notes: form.notes || null,
      details: form.details.map((detail) => ({
        item_name: detail.item_name,
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
        await updatePurchase(editingId, buildPayload());
        setMessage("Compra actualizada correctamente.");
      } else {
        await createPurchase(buildPayload());
        setMessage("Compra registrada correctamente.");
      }
      resetForm();
      await loadPurchases();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel(purchaseId) {
    if (!window.confirm("¿Confirma que desea anular esta compra?")) return;
    setMessage("");
    setError("");
    try {
      await cancelPurchase(purchaseId);
      setMessage("Compra anulada correctamente.");
      await loadPurchases();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredPurchases = purchases.filter((p) =>
    (p.supplier_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.supplier_document || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.invoice_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section>
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Compras de insumos</h2>
          <p className="text-secondary mb-0">
            Registra compras internas de limpieza, alimentos, bebidas,
            lavanderia, mantenimiento y articulos de habitacion.
          </p>
        </div>
        <div className="d-flex gap-2">
          {isAdmin && (
            <button
              className="al-btn-ghost"
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) resetForm();
              }}
              type="button"
            >
              {showForm ? "Ocultar formulario" : "Nueva compra"}
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <input
          type="text"
          className="al-input"
          placeholder="Buscar por proveedor, documento o factura..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: "400px" }}
        />
        <span className="al-badge al-badge-primary align-self-center">
          {purchases.length} compras en total
        </span>
      </div>

      {message ? <div className="al-alert al-alert-success">{message}</div> : null}
      {error ? <div className="al-alert al-alert-danger">{error}</div> : null}

      <div className="row g-4">
        {isAdmin && showForm ? (
          <div className="col-12">
            <form className="al-card p-4" onSubmit={handleSubmit}>
              <h3 className="h5 mb-3">
                {editingId ? "Editar compra" : "Nueva compra"}
              </h3>

              <p className="al-form-section-title">Datos de la compra</p>

              <div className="row">
                <div className="col-md-7 mb-3">
                  <label className="form-label" htmlFor="supplier_name">
                    Proveedor
                  </label>
                  <input
                    className="al-input"
                    id="supplier_name"
                    name="supplier_name"
                    onChange={handleFieldChange}
                    required
                    type="text"
                    value={form.supplier_name}
                  />
                </div>
                <div className="col-md-5 mb-3">
                  <label className="form-label" htmlFor="purchase_date">
                    Fecha
                  </label>
                  <input
                    className="al-input"
                    id="purchase_date"
                    name="purchase_date"
                    onChange={handleFieldChange}
                    required
                    type="date"
                    value={form.purchase_date}
                  />
                </div>
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

              <p className="al-form-section-title">Items de la compra</p>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-semibold" style={{color: "#5c4e48"}}>Detalle de insumos</span>
                <button className="al-btn-sm al-btn-outline-primary" onClick={addDetail} type="button">
                  Agregar detalle
                </button>
              </div>

              {form.details.map((detail, index) => (
                <div className="border rounded-2 p-3 mb-3" key={index}>
                  <div className="mb-2">
                    <label className="form-label" htmlFor={`item_name_${index}`}>
                      Insumo
                    </label>
                    <input
                      className="al-input"
                      id={`item_name_${index}`}
                      onChange={(event) =>
                        handleDetailChange(index, "item_name", event.target.value)
                      }
                      required
                      type="text"
                      value={detail.item_name}
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

              <div className="al-total-card mb-3">
                <span className="al-total-card-label">Total calculado</span>
                <span className="al-total-card-value">Bs. {formatCurrency(formTotal)}</span>
              </div>

              <div className="d-flex gap-2">
                <button className="al-btn al-btn-primary" disabled={saving} type="submit">
                  {saving ? "Guardando..." : "Guardar compra"}
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

        <div className="col-12">
          <div className="al-card mb-4">
            <div className="al-table-responsive">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="text-secondary" colSpan="5">
                        Cargando compras...
                      </td>
                    </tr>
                  ) : null}

                  {!loading && filteredPurchases.length === 0 ? (
                    <tr>
                      <td className="text-secondary py-4" colSpan="7">
                        {searchTerm ? "No se encontraron resultados para su busqueda." : "Todavía no hay compras registradas."}
                      </td>
                    </tr>
                  ) : null}

                  {!loading
                    ? filteredPurchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>{purchase.supplier_name}</td>
                          <td>{toInputDate(purchase.purchase_date)}</td>
                          <td>Bs. {formatCurrency(purchase.total_amount)}</td>
                          <td>
                            <span className={purchase.is_cancelled ? "al-badge-cancelled" : "al-badge-vigente"}>
                              {purchase.is_cancelled ? "Anulada" : "Vigente"}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-2">
                              <button
                                className="al-btn-sm al-btn-outline"
                                onClick={() => setSelectedPurchase(purchase)}
                                type="button"
                              >
                                Ver detalle
                              </button>
                              {isAdmin ? (
                                <>
                                  <button
                                    className="al-btn-sm al-btn-outline-primary"
                                    disabled={purchase.is_cancelled}
                                    onClick={() => startEdit(purchase)}
                                    type="button"
                                  >
                                    Editar
                                  </button>
                                  <button
                                  className="al-btn-sm al-btn-outline-danger"
                                  disabled={purchase.is_cancelled}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel(purchase.id);
                                  }}
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

          {selectedPurchase ? (
            <div className="al-card p-4">
              <div className="d-flex justify-content-between gap-3 mb-3">
                <div>
                  <h3 className="h5 mb-1">Detalle de compra</h3>
                  <p className="text-secondary mb-0">
                    {selectedPurchase.supplier_name} -{" "}
                    {toInputDate(selectedPurchase.purchase_date)}
                  </p>
                </div>
                <strong>Bs. {formatCurrency(selectedPurchase.total_amount)}</strong>
              </div>

              {selectedPurchase.notes ? (
                <p className="text-secondary">{selectedPurchase.notes}</p>
              ) : null}

              <div className="al-table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Cantidad</th>
                      <th>Precio unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurchase.details.map((detail) => (
                      <tr key={detail.id}>
                        <td>{detail.item_name}</td>
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

export default Purchases;
