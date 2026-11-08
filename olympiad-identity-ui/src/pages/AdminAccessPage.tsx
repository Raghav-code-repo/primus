import { useEffect, useState } from 'react'
import { authApi } from '../api/authApi'
import type { CurrentAuthoritiesResponse } from '../types/auth'

export function AdminAccessPage() {
  const [data, setData] = useState<CurrentAuthoritiesResponse | null>(null)
  useEffect(() => { authApi.permissions().then(setData) }, [])
  if (!data) return <p>Loading…</p>
  return <div className="page"><h1 className="page__title">Access</h1><p>{data.subject}</p><ul>{data.authorities.map(a => <li key={a}>{a}</li>)}</ul></div>
}
