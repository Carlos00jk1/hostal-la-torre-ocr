import { useEffect, useMemo, useState } from "react";

import { getReportSummary } from "../api/api.js";

function formatCurrency(value) {
  const number = Number(value);
  if (Number.isNaN(number)) {
    return "0.00";
  }
  return number.toFixed(2);
}

function toInputDate(value) {
  return value ? value.slice(0, 10) : "";
}

function Reports() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cards = useMemo(() => {
    if (!summary) {
      return [];
    }

    return [
      ["Servicios activos", summary.total_services_active, "Servicios disponibles"],
      ["Huéspedes activos", summary.total_guests_active, "Registros habilitados"],
      ["Compras registradas", summary.total_purchases, "Compras vigentes"],
      ["Total compras", `Bs. ${formatCurrency(summary.total_purchase_amount)}`, "Egresos vigentes"],
      ["Ventas registradas", summary.total_sales, "Cobros vigentes"],
      ["Total ventas", `Bs. ${formatCurrency(summary.total_sales_amount)}`, "Ingresos vigentes"],
    ];
  }, [summary]);

  async function loadSummary() {
    setLoading(true);
    setError("");
    try {
      const data = await getReportSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <section>
      <div className="page-title-block p-4 mb-4">
        <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center">
          <div>
            <p className="section-eyebrow mb-2">Vista gerencial</p>
            <h2 className="h4 mb-2">Reportes operativos</h2>
            <p className="text-secondary mb-0">
              Resumen de servicios, huéspedes, compras y cobros vigentes.
            </p>
          </div>
          <button className="btn btn-outline-primary" onClick={loadSummary} type="button">
            Actualizar
          </button>
        </div>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="alert alert-light border text-secondary">
          Cargando reportes operativos...
        </div>
      ) : null}

      {!loading && summary ? (
        <>
          <div className="row g-3 mb-4">
            {cards.map(([label, value, detail]) => (
              <div className="col-md-6 col-xl-4" key={label}>
                <div className="summary-card bg-white border rounded-2 p-4 h-100">
                  <p className="small text-secondary mb-1">{label}</p>
                  <p className="display-6 fw-bold mb-1">{value}</p>
                  <p className="small text-secondary mb-0">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-xl-6">
              <div className="content-card bg-white border rounded-2">
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                  <div>
                    <p className="section-eyebrow mb-1">Ingresos</p>
                    <h3 className="h5 mb-0">Últimas ventas</h3>
                  </div>
                  <span className="badge text-bg-primary">{summary.recent_sales.length}</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Pago</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recent_sales.length === 0 ? (
                        <tr>
                          <td className="text-secondary py-4" colSpan="5">
                            Todavía no hay ventas registradas para mostrar.
                          </td>
                        </tr>
                      ) : null}

                      {summary.recent_sales.map((sale) => (
                        <tr key={sale.id}>
                          <td className="fw-semibold">{sale.customer_name}</td>
                          <td>{toInputDate(sale.sale_date)}</td>
                          <td>{sale.payment_method}</td>
                          <td>Bs. {formatCurrency(sale.total_amount)}</td>
                          <td>
                            <span className={`badge ${sale.status === "anulada" ? "text-bg-secondary" : "text-bg-success"}`}>
                              {sale.status === "anulada" ? "Anulada" : "Vigente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              <div className="content-card bg-white border rounded-2">
                <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
                  <div>
                    <p className="section-eyebrow mb-1">Abastecimiento</p>
                    <h3 className="h5 mb-0">Últimas compras</h3>
                  </div>
                  <span className="badge text-bg-primary">{summary.recent_purchases.length}</span>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.recent_purchases.length === 0 ? (
                        <tr>
                          <td className="text-secondary py-4" colSpan="4">
                            Todavía no hay compras registradas para mostrar.
                          </td>
                        </tr>
                      ) : null}

                      {summary.recent_purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td className="fw-semibold">{purchase.supplier_name}</td>
                          <td>{toInputDate(purchase.purchase_date)}</td>
                          <td>Bs. {formatCurrency(purchase.total_amount)}</td>
                          <td>
                            <span className={`badge ${purchase.is_cancelled ? "text-bg-secondary" : "text-bg-success"}`}>
                              {purchase.is_cancelled ? "Anulada" : "Vigente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export default Reports;
