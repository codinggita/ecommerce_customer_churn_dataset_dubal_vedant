import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'
import Loader from '../components/Loader'
import Pagination from '../components/Pagination'
import CustomerForm from '../components/CustomerForm'
import './Customers.css'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')
  const [countryFilter, setCountryFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [churnFilter, setChurnFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCustomers = useCallback(async (page = pagination.page) => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit: pagination.limit }
      if (sort) params.sort = sort
      if (countryFilter) params.country = countryFilter
      if (genderFilter) params.gender = genderFilter
      if (churnFilter !== '') params.churned = churnFilter

      const res = search
        ? await api('/search/customers', { params: { q: search } })
        : await api('/customers', { params })

      if (search) {
        setCustomers(Array.isArray(res.data) ? res.data : [])
        setPagination(prev => ({ ...prev, page: 1, total: Array.isArray(res.data) ? res.data.length : 0 }))
      } else {
        setCustomers(res.data?.data ?? res.data ?? [])
        setPagination(prev => ({ ...prev, page, total: res.data?.pagination?.total ?? res.pagination?.total ?? res.data?.length ?? 0 }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, sort, countryFilter, genderFilter, churnFilter, pagination.limit])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  function handlePageChange(page) { fetchCustomers(page) }

  async function handleDelete(id) {
    if (!confirm('Delete this customer?')) return
    try {
      await api(`/protected/customers/${id}`, { method: 'DELETE', auth: true })
      showToast('Customer deleted')
      fetchCustomers()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  function handleEdit(customer) {
    setEditing(customer)
    setShowForm(true)
  }

  async function handleSubmit(formData) {
    try {
      if (editing) {
        await api(`/protected/customers/${editing._id}`, { method: 'PATCH', body: formData, auth: true })
        showToast('Customer updated')
      } else {
        await api('/protected/customers', { method: 'POST', body: formData, auth: true })
        showToast('Customer created')
      }
      setShowForm(false)
      setEditing(null)
      fetchCustomers()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  return (
    <div className="page">
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      <div className="flex items-center justify-between mb-12">
        <h1>Customers</h1>
        <button className="btn" onClick={() => setShowForm(true)}>+ Add</button>
      </div>

      <div className="customers-toolbar mb-12">
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
          <option value="">All Countries</option>
          <option value="France">France</option>
          <option value="UK">UK</option>
          <option value="USA">USA</option>
          <option value="Canada">Canada</option>
          <option value="Germany">Germany</option>
          <option value="Australia">Australia</option>
          <option value="India">India</option>
        </select>
        <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select value={churnFilter} onChange={e => setChurnFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="0">Active</option>
          <option value="1">Churned</option>
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="">Default Sort</option>
          <option value="age">Age</option>
          <option value="purchases">Purchases</option>
          <option value="lifetimeValue">Lifetime Value</option>
          <option value="creditBalance">Credit Balance</option>
          <option value="loginFrequency">Login Frequency</option>
          <option value="membershipYears">Membership Years</option>
        </select>
      </div>

      {error && <div className="empty-state"><p>Error: {error}</p></div>}

      {loading ? <Loader /> : (
        <>
          {customers.length === 0 ? (
            <div className="empty-state"><p>No customers found</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Country</th>
                    <th>City</th>
                    <th>Purchases</th>
                    <th>Lifetime</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c => (
                    <tr key={c._id}>
                      <td>{c.Name || `${c.Gender} #${c._id?.slice(-4)}`}</td>
                      <td>{c.Age}</td>
                      <td>{c.Gender}</td>
                      <td>{c.Country}</td>
                      <td>{c.City}</td>
                      <td>{c.Total_Purchases}</td>
                      <td>${Number(c.Lifetime_Value).toFixed(0)}</td>
                      <td><span className={`badge ${c.Churned === 1 ? 'badge-danger' : 'badge-success'}`}>{c.Churned === 1 ? 'Churned' : 'Active'}</span></td>
                      <td>
                        <div className="flex gap-8">
                          <button className="btn btn-small btn-outline" onClick={() => handleEdit(c)}>Edit</button>
                          <button className="btn btn-small btn-danger" onClick={() => handleDelete(c._id)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={pagination.page} total={pagination.total} limit={pagination.limit} onChange={handlePageChange} />
        </>
      )}

      {showForm && <CustomerForm initial={editing} onSubmit={handleSubmit} onCancel={closeForm} />}
    </div>
  )
}
