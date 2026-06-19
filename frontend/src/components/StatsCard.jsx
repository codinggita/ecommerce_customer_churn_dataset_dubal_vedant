import './StatsCard.css'

export default function StatsCard({ label, value, sub }) {
  return (
    <div className="stats-card">
      <p className="stats-label">{label}</p>
      <p className="stats-value">{value ?? '-'}</p>
      {sub && <p className="stats-sub">{sub}</p>}
    </div>
  )
}
