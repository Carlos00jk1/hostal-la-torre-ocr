import { Link } from "react-router-dom";

/* ── Tarjetas de ambiente ──────────────────────────────────────── */
const rooms = [
  {
    id: "alojamiento",
    img: "/images/Habitacion1.jpg",
    label: "Alojamiento",
    title: "Espacios para el descanso",
    text: "Espacios cómodos y funcionales para el descanso de quienes visitan Tupiza.",
  },
  {
    id: "atencion",
    img: "/images/hotel3.webp",
    label: "Atención cercana",
    title: "Trato familiar",
    text: "Recepción y trato familiar para acompañar la llegada de cada huésped.",
  },
  {
    id: "ambientes",
    img: "/images/hotel4.jpg",
    label: "Ambientes",
    title: "Interiores del hostal",
    text: "Áreas interiores que reflejan una atención sencilla, local y acogedora.",
  },
];

/* ── Beneficios ─────────────────────────────────────────────────── */
const benefits = [
  { icon: "bi-journal-check",    label: "Registro más ordenado" },
  { icon: "bi-database",        label: "Información centralizada" },
  { icon: "bi-receipt",         label: "Cobros y servicios organizados" },
  { icon: "bi-bar-chart-line",  label: "Reportes operativos" },
];

export default function Home() {
  return (
    <div className="ht-home">

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="ht-hero" id="inicio">
        <div className="ht-hero-content">
          <p className="ht-kicker">Tupiza, Bolivia</p>
          <h1 className="ht-hero-h1">Hostal<br />La Torre</h1>
          <p className="ht-hero-phrase">Alojamiento con identidad local</p>
          <p className="ht-hero-sub">
            Un espacio cálido para visitantes y viajeros que llegan a Tupiza.
          </p>
          <Link className="ht-cta" to="/login">Ingresar al sistema</Link>
        </div>

        {/* Scroll hint */}
        <div className="ht-hero-hint" aria-hidden="true">
          <span className="ht-hint-dot" />
          <span className="ht-hint-line" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TARJETAS – Alojamiento / Atención / Ambientes
      ══════════════════════════════════════════════════════════════ */}
      <section className="ht-cards-section" id="alojamiento">
        <div className="ht-section-header">
          <span className="ht-eyebrow">El hostal</span>
          <h2 className="ht-h2">Conozca el Hostal La Torre</h2>
        </div>
        <div className="ht-cards-grid">
          {rooms.map((r) => (
            <article className="ht-card" key={r.id} id={r.id}>
              <div className="ht-card-img-wrap">
                <img src={r.img} alt={r.label} className="ht-card-img" />
                <span className="ht-card-badge">{r.label}</span>
              </div>
              <div className="ht-card-body">
                <h3 className="ht-card-title">{r.title}</h3>
                <p className="ht-card-text">{r.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BENEFICIOS
      ══════════════════════════════════════════════════════════════ */}
      <section className="ht-benefits" id="atencion">
        <div className="ht-benefits-inner">
          <div className="ht-benefits-label">
            <span className="ht-eyebrow ht-eyebrow-light">Sistema interno</span>
            <p className="ht-benefits-title">Gestión diaria organizada</p>
          </div>
          <div className="ht-benefits-grid">
            {benefits.map((b) => (
              <div className="ht-benefit-item" key={b.label}>
                <i className={`bi ${b.icon} ht-benefit-icon`} aria-hidden="true" />
                <span className="ht-benefit-label">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ACCESO ADMINISTRATIVO
      ══════════════════════════════════════════════════════════════ */}
      <section className="ht-access" id="sistema">
        <div className="ht-access-inner">
          <div className="ht-access-photo">
            <img src="/images/hotel5.jpg" alt="" />
          </div>
          <div className="ht-access-text">
            <span className="ht-eyebrow">Acceso administrativo</span>
            <h2 className="ht-h2">Gestión web<br />con apoyo OCR</h2>
            <p className="ht-body-text">
              El personal autorizado puede ingresar al sistema para apoyar la
              gestión diaria del hostal. El registro puede apoyarse en OCR para
              sugerir datos desde imágenes del documento del huésped, siempre
              con revisión del personal.
            </p>
            <Link className="ht-cta" to="/login">Ingresar al sistema</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          UBICACIÓN
      ══════════════════════════════════════════════════════════════ */}
      <section className="ht-location" id="ubicacion">
        <div className="ht-location-photo-wrap">
          <img src="/images/fachada2.webp" alt="Hostal La Torre, Tupiza" />
          <div className="ht-location-overlay">
            <div className="ht-location-box">
              <span className="ht-eyebrow ht-eyebrow-light">Hostal La Torre en Tupiza</span>
              <h2 className="ht-location-title">Parte de la atención local</h2>
              <p className="ht-location-text">
                Ubicado en Tupiza, el Hostal La Torre forma parte de la atención
                local a visitantes y viajeros en una ciudad reconocida por sus
                paisajes colorados y su actividad turística.
              </p>
              <Link className="ht-cta-light" to="/login">Ingresar al sistema</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="ht-footer">
        <div className="ht-footer-inner">
          <div className="ht-footer-brand-block">
            <span className="ht-footer-name">Hostal La Torre</span>
            <span className="ht-footer-place">Tupiza, Bolivia</span>
          </div>
          <span className="ht-footer-tag">Sistema administrativo interno</span>
          <Link className="ht-footer-link" to="/login">Ingresar</Link>
        </div>
      </footer>

    </div>
  );
}
