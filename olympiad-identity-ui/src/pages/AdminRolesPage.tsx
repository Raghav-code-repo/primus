import { useEffect, useState } from 'react'
import { adminApi } from '../api/adminApi'
import type { PermissionResponse, RoleResponse } from '../types/auth'

export function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([])
  const [perms, setPerms] = useState<PermissionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '' })
  const [assign, setAssign] = useState({ roleId: '', permissionId: '' })

  const load = async () => { setLoading(true); try { setRoles(await adminApi.listRoles()); setPerms(await adminApi.listPermissions()) } catch (e) { } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try { await adminApi.createRole(form); setForm({ name: '', description: '' }); await load() }
    catch (e) { }
  }
  const doAssign = async () => {
    try { await adminApi.assignPermission(assign.roleId, assign.permissionId); await load() }
    catch (e) { }
  }
  const doRemove = async () => {
    try { await adminApi.removePermission(assign.roleId, assign.permissionId); await load() }
    catch (e) { }
  }

  return (
    <div className="page">
      <h1 className="page__title">Roles</h1>
      <form onSubmit={create} className="form" style={{ marginBottom: 16 }}>
        <input className="form-input" placeholder="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input className="form-input" placeholder="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button className="button button--primary" type="submit">Create</button>
      </form>
      <div className="form" style={{ marginBottom: 16 }}>
        <select className="form-input" value={assign.roleId} onChange={e => setAssign({ ...assign, roleId: e.target.value })}>
          <option value="">role</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className="form-input" value={assign.permissionId} onChange={e => setAssign({ ...assign, permissionId: e.target.value })}>
          <option value="">permission</option>
          {perms.map(p => <option key={p.id} value={p.id}>{p.code}</option>)}
        </select>
        <button className="button button--primary" type="button" onClick={doAssign}>Assign</button>
        <button className="button button--secondary" type="button" onClick={doRemove}>Remove</button>
      </div>
      {loading ? <p>Loading…</p> : <ul>{roles.map(r => <li key={r.id}>{r.name} - {r.description}</li>)}</ul>}
    </div>
  )
}
