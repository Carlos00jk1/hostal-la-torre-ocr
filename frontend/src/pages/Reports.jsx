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
      {
        label: "Servicios activos",
        value: summary.total_services_active,
      },
      {
        label: "Compras registradas",
        value: summary.total_purchases,
      },
      {
        label: "Total compras",
        value: `Bs. ${formatCurrency(summary.total_purchase_amount)}`,
      },
      {
        label: "Ventas registradas",
        value: summary.total_sales,
      },
      {
        label: "Total ventas",
        value: `Bs. ${formatCurrency(summary.total_sales_amount)}`,
      },
      {
        label: "Huéspedes activos",
        value: summary.total_guests_active,
      },
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
      <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4">
        <div>
          <h2 className="h4 mb-1">Reportes operativos</h2>
          <p className="text-secondary mb-0">
            Resumen general de servicios, compras, ventas y huéspedes.
          </p>
        </div>
        <button className="btn btn-outline-primary" onClick={loadSummary} type="button">
          Actualizar
        </button>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="alert alert-light border text-secondary">
          Cargando reportes...
        </div>
      ) : null}

      {!loading && summary ? (
        <>
          <div className="row g-3 mb-4">
            {cards.map((card) => (
              <div className="col-md-6 col-xl-4" key={card.label}>
                <div className="bg-white border rounded-2 p-3 h-100">
                  <p className="small text-secondary mb-1">{card.label}</p>
                  <p className="h4 mb-0">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            <div className="col-xl-6">
              <div className="bg-white border rounded-2">
                <div className="p-3 border-bottom">
                  <h3 className="h5 mb-0">Últimas ventas</h3>
                </div>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
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
                          <td className="text-secondary" colSpan="5">
                            No hay ventas registradas.
                          </td>
                        </tr>
                      ) : null}

                      {summary.recent_sales.map((sale) => (
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="col-xl-6">
              <div className="bg-white border rounded-2">
                <div className="p-3 border-bottom">
                  <h3 className="h5 mb-0">Últimas compras</h3>
                </div>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
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
                          <td className="text-secondary" colSpan="4">
                            No hay compras registradas.
                          </td>
                        </tr>
                      ) : null}

                      {summary.recent_purchases.map((purchase) => (
                        <tr key={purchase.id}>
                          <td>{purchase.supplier_name}</td>
                          <td>{toInputDate(purchase.purchase_date)}</td>
                          <td>Bs. {formatCurrency(purchase.total_amount)}</td>
                          <td>
                            <span
                              className={`badge ${
                                purchase.is_cancelled
                                  ? "text-bg-secondary"
                                  : "text-bg-success"
                              }`}
                            >
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
