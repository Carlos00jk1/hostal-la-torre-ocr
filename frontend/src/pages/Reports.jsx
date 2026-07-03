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
          <button className="al-btn-ghost" onClick={loadSummary} type="button">
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
                <div className="al-metric-card h-100">
                  <p className="al-metric-label">{label}</p>
                  <p className="al-metric-value">{value}</p>
                  <p className="al-metric-detail">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-xl-6">
              <div className="content-card bg-white border rounded-2">
                <div className="content-card-header">
                  <div>
                    <p className="content-card-eyebrow">Ingresos</p>
                    <h3 className="content-card-title">Ultimas ventas</h3>
                  </div>
                  <span className="al-badge al-badge-primary">{summary.recent_sales.length}</span>
                </div>
                <div className="al-table-responsive">
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
                            <span className={sale.status === "anulada" ? "al-badge-cancelled" : "al-badge-vigente"}>
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
                <div className="content-card-header">
                  <div>
                    <p className="content-card-eyebrow">Abastecimiento</p>
                    <h3 className="content-card-title">Ultimas compras</h3>
                  </div>
                  <span className="al-badge al-badge-primary">{summary.recent_purchases.length}</span>
                </div>
                <div className="al-table-responsive">
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
                            <span className={purchase.is_cancelled ? "al-badge-cancelled" : "al-badge-vigente"}>
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
