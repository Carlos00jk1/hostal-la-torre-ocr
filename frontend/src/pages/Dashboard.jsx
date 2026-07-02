function Dashboard({ onLogout, user }) {
  return (
    <section>
      <h1 className="h3">Dashboard</h1>
      <p className="text-secondary">Resumen operativo pendiente.</p>

      {user ? (
        <div className="mt-3">
          <p className="mb-1">
            <strong>Usuario:</strong> {user.username}
          </p>
          <p className="mb-3">
            <strong>Rol:</strong> {user.role.name}
          </p>
          <button className="btn btn-outline-secondary" onClick={onLogout}>
            Cerrar sesion
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default Dashboard;
