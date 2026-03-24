function Header({ icon, title, subtitle }) {
  return (
    <section className="page-header">
      <div className="icon-badge">{icon}</div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>
  )
}

export default Header
