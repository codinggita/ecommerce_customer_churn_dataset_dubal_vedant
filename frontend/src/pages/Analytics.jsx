import { useState, useEffect } from 'react'
import { api } from '../api'
import StatsCard from '../components/StatsCard'
import Loader from '../components/Loader'
import './Analytics.css'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api('/analytics/customers/country-analysis').catch(() => null),
      api('/analytics/customers/churn-analysis').catch(() => null),
      api('/analytics/customers/purchase-analysis').catch(() => null),
      api('/analytics/customers/session-analysis').catch(() => null),
      api('/analytics/customers/signup-analysis').catch(() => null),
      api('/analytics/customers/gender-analysis').catch(() => null),
    ]).then(([countries, churn, purchases, sessions, signups, gender]) => {
      setData({ countries, churn, purchases, sessions, signups, gender })
    }).catch(err => setError(err.message))
  }, [])

  if (error) return <div className="page"><div className="empty-state"><p>Error: {error}</p></div></div>
  if (!data) return <Loader text="Loading analytics..." />

  return (
    <div className="page">
      <h1>Analytics</h1>

      {data.churn?.data && (
        <div className="dashboard-section">
          <h2>Churn Analysis</h2>
          <div className="grid-3 mb-16">
            <StatsCard label="Total Customers" value={data.churn.data.total ?? '-'} />
            <StatsCard label="Churned" value={data.churn.data.churned ?? '-'} />
            <StatsCard label="Churn Rate" value={data.churn.data.churnRate ?? '-'} />
          </div>
        </div>
      )}

      {data.purchases?.data && (
        <div className="dashboard-section">
          <h2>Purchase Analysis</h2>
          <div className="grid-3 mb-16">
            <StatsCard label="Avg Purchases" value={data.purchases.data.avgPurchases?.toFixed(1) ?? '-'} />
            <StatsCard label="Min Purchases" value={data.purchases.data.minPurchases ?? '-'} />
            <StatsCard label="Max Purchases" value={data.purchases.data.maxPurchases ?? '-'} />
          </div>
          {data.purchases.data.totalRevenue && (
            <StatsCard label="Total Revenue" value={`$${Number(data.purchases.data.totalRevenue).toLocaleString()}`} />
          )}
        </div>
      )}

      {data.countries?.data && Array.isArray(data.countries.data) && (
        <div className="dashboard-section">
          <h2>Country Distribution</h2>
          <table>
            <thead><tr><th>Country</th><th>Count</th></tr></thead>
            <tbody>
              {data.countries.data.map((c, i) => (
                <tr key={i}><td>{c._id}</td><td>{c.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.sessions?.data && (
        <div className="dashboard-section">
          <h2>Session Analysis</h2>
          <div className="grid-2">
            {data.sessions.data.avgSession && <StatsCard label="Avg Session Duration" value={data.sessions.data.avgSession?.toFixed(1) ?? '-'} />}
            {data.sessions.data.avgDuration && <StatsCard label="Avg Session Duration" value={data.sessions.data.avgDuration?.toFixed(1) ?? '-'} />}
          </div>
        </div>
      )}

      {data.signups?.data && Array.isArray(data.signups.data) && (
        <div className="dashboard-section">
          <h2>Signup Quarter Distribution</h2>
          <table>
            <thead><tr><th>Quarter</th><th>Count</th></tr></thead>
            <tbody>
              {data.signups.data.map((s, i) => (
                <tr key={i}><td>{s._id}</td><td>{s.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.gender?.data && Array.isArray(data.gender.data) && (
        <div className="dashboard-section">
          <h2>Gender Distribution</h2>
          <table>
            <thead><tr><th>Gender</th><th>Count</th></tr></thead>
            <tbody>
              {data.gender.data.map((g, i) => (
                <tr key={i}><td>{g._id}</td><td>{g.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
