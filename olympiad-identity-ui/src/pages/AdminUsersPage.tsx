import { useEffect, useState } from 'react'
import { adminApi } from '../api/adminApi'
import { ApiError } from '../api/errors'
import type { AdminUserResponse, RoleResponse } from '../types/auth'

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserResponse[]>([])
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [edit, setEdit] = useState({ id: '', firstName: '', lastName: '' })
  const [assign, setAssign] = useState({ userId: '', roleId: '' })

  const load = async () => {
    setLoading(true); setError('')
    try { setUsers(await adminApi.listUsers()); setRoles(await adminApi.listRoles()) }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Failed') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await adminApi.createUser(form); setForm({ email: '', password: '', firstName: '', lastName: '' }); await load() }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Failed') }
  }
  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await adminApi.updateUser(edit.id, { firstName: edit.firstName, lastName: edit.lastName }); await load() }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Failed') }
  }
  const deactivate = async (id: string) => {
    try { await adminApi.updateUserStatus(id, 'INACTIVE'); await load() }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Failed') }
  }
  const doAssign = async () => {
    try { await adminApi.assignRole(assign.userId, assign.roleId); await load() }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Failed') }
  }
  const doRemove = async () => {
    try { await adminApi.removeRole(assign.userId, assign.roleId); await load() }
    catch (e) { setError(e instanceof ApiError ? e.message : 'Failed') }
  }

  return (
    <div className="page">
      <header className="page__header"><h1 className="page__title">Users</h1></header>
      {error && <p>{error}</p>}
      <form onSubmit={create} className="form" style={{ marginBottom: 16 }}>
        <input className="form-input" placeholder="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input className="form-input" placeholder="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <input className="form-input" placeholder="first name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        <input className="form-input" placeholder="last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        <button className="button button--primary" type="submit">Create</button>
      </form>
      <form onSubmit={updateUser} className="form" style={{ marginBottom: 16 }}>
        <select className="form-input" value={edit.id} onChange={e => { const u = users.find(x=>x.id===e.target.value); setEdit({ id: e.target.value, firstName: u?.firstName ?? '', lastName: u?.lastName ?? '' }) }}>
          <option value="">user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
        <input className="form-input" placeholder="first name" value={edit.firstName} onChange={e => setEdit({ ...edit, firstName: e.target.value })} />
        <input className="form-input" placeholder="last name" value={edit.lastName} onChange={e => setEdit({ ...edit, lastName: e.target.value })} />
        <button className="button button--secondary" type="submit">Update</button>
      </form>
      <div className="form" style={{ marginBottom: 16 }}>
        <select className="form-input" value={assign.userId} onChange={e => setAssign({ ...assign, userId: e.target.value })}>
          <option value="">user</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
        <select className="form-input" value={assign.roleId} onChange={e => setAssign({ ...assign, roleId: e.target.value })}>
          <option value="">role</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button className="button button--primary" type="button" onClick={doAssign}>Assign Role</button>
        <button className="button button--secondary" type="button" onClick={doRemove}>Remove Role</button>
      </div>
      {loading && <p>Loading…</p>}
      {!loading && (
        <table className="table">
          <thead><tr><th>Email</th><th>Name</th><th>Status</th><th>Roles</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td><td>{u.firstName} {u.lastName}</td><td>{u.status}</td><td>{u.roles.join(', ')}</td>
                <td><button className="button button--ghost" onClick={() => deactivate(u.id)}>Deactivate</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
