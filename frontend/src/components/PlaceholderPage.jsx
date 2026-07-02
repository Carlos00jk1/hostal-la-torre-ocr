function PlaceholderPage({ description, title }) {
  return (
    <section className="bg-white border rounded-2 p-4">
      <h2 className="h4">{title}</h2>
      <p className="text-secondary mb-3">{description}</p>
      <span className="badge text-bg-warning">Módulo en desarrollo</span>
    </section>
  );
}

export default PlaceholderPage;
