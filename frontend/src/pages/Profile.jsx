import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './Profile.css'

export default function Profile() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || user?.Name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function handleUpdate(e) {
    e.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const res = await api('/auth/profile', {
        method: 'PATCH',
        body: { name, email },
        auth: true
      })
      setUser(res.data)
      setMessage('Profile updated')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <h1>Profile</h1>

      {message && <div className={`toast ${message === 'Profile updated' ? 'success' : 'error'}`}>{message}</div>}

      <div className="profile-card card">
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex gap-8">
            <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Update Profile'}</button>
            <button type="button" className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </form>
      </div>
    </div>
  )
}
