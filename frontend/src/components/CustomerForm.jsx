import { useState } from 'react'

const fields = [
  { key: 'Age', label: 'Age', type: 'number' },
  { key: 'Gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
  { key: 'Country', label: 'Country', type: 'text' },
  { key: 'City', label: 'City', type: 'text' },
  { key: 'Membership_Years', label: 'Membership Years', type: 'number' },
  { key: 'Login_Frequency', label: 'Login Frequency', type: 'number' },
  { key: 'Total_Purchases', label: 'Total Purchases', type: 'number' },
  { key: 'Lifetime_Value', label: 'Lifetime Value', type: 'number' },
  { key: 'Credit_Balance', label: 'Credit Balance', type: 'number' },
  { key: 'Churned', label: 'Churned', type: 'select', options: [0, 1] },
  { key: 'Signup_Quarter', label: 'Signup Quarter', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4'] },
]

export default function CustomerForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || Object.fromEntries(fields.map(f => [f.key, ''])))

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = { ...form }
    for (const f of fields) {
      if (f.type === 'number' && payload[f.key] !== '') payload[f.key] = Number(payload[f.key])
    }
    onSubmit(payload)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{initial ? 'Edit Customer' : 'Add Customer'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {fields.map(f => (
              <div className="form-group" key={f.key}>
                <label>{f.label}</label>
                {f.type === 'select' ? (
                  <select value={form[f.key] ?? ''} onChange={e => handleChange(f.key, e.target.value)}>
                    <option value="">--</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={form[f.key] ?? ''} onChange={e => handleChange(f.key, e.target.value)} step="any" />
                )}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
            <button type="submit">{initial ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
