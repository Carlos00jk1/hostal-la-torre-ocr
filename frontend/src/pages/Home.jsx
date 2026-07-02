import { Link } from "react-router-dom";

function Home() {
  const services = [
    "Hospedaje cómodo para viajeros y familias",
    "Registro ordenado de huéspedes",
    "Control de servicios, compras y ventas",
  ];

  const benefits = [
    {
      title: "Atención más ágil",
      text: "El personal puede registrar huéspedes con menos pasos manuales y más control.",
    },
    {
      title: "Administración clara",
      text: "La información operativa queda organizada por módulos y roles de usuario.",
    },
    {
      title: "Innovación OCR",
      text: "El documento del huésped se procesa con OCR para sugerir datos del registro.",
    },
  ];

  return (
    <>
      <section className="hotel-hero">
        <div className="hero-panel">
          <p className="section-eyebrow mb-3">Hostal La Torre</p>
          <h1 className="hero-title mb-4">
            Gestión hotelera moderna con registro asistido por OCR
          </h1>
          <p className="hero-copy mb-4">
            Una plataforma web para automatizar el registro de huéspedes,
            administrar servicios, controlar operaciones y fortalecer la atención
            en recepción.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link className="btn btn-light btn-lg px-4" to="/login">
              Iniciar sesión
            </Link>
            <a className="btn btn-outline-light btn-lg px-4" href="#innovacion">
              Ver innovación OCR
            </a>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-5">
            <p className="section-eyebrow mb-2">Experiencia del hostal</p>
            <h2 className="h1 mb-3">Un sistema pensado para recepción y administración</h2>
            <p className="text-secondary mb-0">
              El proyecto integra módulos operativos esenciales para el Hostal La
              Torre, con una interfaz clara para usuarios administradores,
              recepcionistas y personal de consulta.
            </p>
          </div>
          <div className="col-lg-7">
            <div className="row g-3">
              {services.map((service) => (
                <div className="col-md-4" key={service}>
                  <div className="feature-card">
                    <span className="icon-tile mb-3">✓</span>
                    <p className="fw-semibold mb-0">{service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="row g-4">
          {benefits.map((benefit) => (
            <div className="col-md-4" key={benefit.title}>
              <div className="feature-card">
                <p className="section-eyebrow mb-2">Beneficio</p>
                <h3 className="h5 mb-3">{benefit.title}</h3>
                <p className="text-secondary mb-0">{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-5" id="innovacion">
        <div className="page-title-block p-4 p-lg-5">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <p className="section-eyebrow mb-2">Innovación OCR</p>
              <h2 className="h1 mb-3">Registro asistido desde imágenes del documento</h2>
              <p className="text-secondary mb-0">
                El recepcionista puede cargar fotografías del carnet, como
                anverso y reverso. El sistema extrae texto, sugiere datos y
                permite revisarlos antes de guardar al huésped.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="bg-gold-soft rounded-2 p-4">
                <p className="fw-semibold mb-2">Flujo principal</p>
                <ol className="mb-0 text-secondary">
                  <li>Cargar imágenes del documento.</li>
                  <li>Extraer texto con OCR.</li>
                  <li>Revisar datos detectados.</li>
                  <li>Guardar huésped.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
