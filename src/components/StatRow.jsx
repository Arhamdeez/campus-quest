function StatRow({ stats }) {
  return (
    <section className="stat-grid">
      {stats.map((s) => (
        <article key={s.label} className={`stat-card ${s.tone ?? ''}`}>
          <span>{s.icon}</span>
          <strong>{s.value}</strong>
          <small>{s.label}</small>
        </article>
      ))}
    </section>
  )
}

export default StatRow
