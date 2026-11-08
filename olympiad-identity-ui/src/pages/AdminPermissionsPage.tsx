import { useEffect, useState } from 'react'
import { adminApi } from '../api/adminApi'
import type { PermissionResponse } from '../types/auth'

export function AdminPermissionsPage() {
  const [perms, setPerms] = useState<PermissionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: '', description: '' })

  const load = async () => { setLoading(true); try { setPerms(await adminApi.listPermissions()) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await adminApi.createPermission(form)
    setForm({ code: '', description: '' })
    await load()
  }

  return (
    <div className="page">
      <h1 className="page__title">Permissions</h1>
      <form onSubmit={create} className="form" style={{ marginBottom: 16 }}>
        <input className="form-input" placeholder="code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
        <input className="form-input" placeholder="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button className="button button--primary" type="submit">Create</button>
      </form>
      {loading ? <p>Loading…</p> : <ul>{perms.map(p => <li key={p.id}>{p.code} - {p.description}</li>)}</ul>}
    </div>
  )
}
