import { useState } from 'react'

import { Alert } from './Alert'
import { rbacApi } from '../api/rbacApi'
import { ApiError } from '../api/errors'

interface ProbeState {
  status: 'idle' | 'pending' | 'granted' | 'denied' | 'error'
  message?: string
}

/**
 * Calls the diagnostic endpoints of the Identity Service so the effective
 * RBAC state of the signed-in account becomes visible.
 *
 * The endpoints answer with 403 when the account does not own the required
 * authority, which is the expected result as long as no permission is mapped
 * to a role.
 */
export function AccessCheckPanel() {
  const [probes, setProbes] = useState<Record<string, ProbeState>>({})

  const runProbe = async (
    key: string,
    probe: () => Promise<{ message: string }>,
  ) => {
    setProbes((current) => ({
      ...current,
      [key]: { status: 'pending' },
    }))
    try {
      const result = await probe()
      setProbes((current) => ({
        ...current,
        [key]: { status: 'granted', message: result.message },
      }))
    } catch (error) {
      if (error instanceof ApiError && error.isForbidden) {
        setProbes((current) => ({
          ...current,
          [key]: { status: 'denied', message: error.message },
        }))
        return
      }
      setProbes((current) => ({
        ...current,
        [key]: {
          status: 'error',
          message:
            error instanceof ApiError
              ? error.message
              : 'The access check could not be completed.',
        },
      }))
    }
  }

  return (
    <section className="card" aria-labelledby="access-check-heading">
      <h2 className="card__title" id="access-check-heading">
        Backend access check
      </h2>
      <p className="card__text">
        The Identity Service enforces every action with its own permission
        model. These checks call the real diagnostic endpoints so you can see
        which authorities your account currently owns.
      </p>

      <div className="probe-list">
        <div className="probe">
          <div className="probe__header">
            <code>GET /api/rbac-test/users</code>
            <button
              type="button"
              className="button button--secondary button--small"
              disabled={probes.userRead?.status === 'pending'}
              onClick={() => runProbe('userRead', rbacApi.probeUserRead)}
            >
              {probes.userRead?.status === 'pending' ? 'Checking…' : 'Check'}
            </button>
          </div>
          {probes.userRead ? <ProbeResult probe={probes.userRead} /> : null}
        </div>

        <div className="probe">
          <div className="probe__header">
            <code>GET /api/rbac-test/permission-management</code>
            <button
              type="button"
              className="button button--secondary button--small"
              disabled={probes.permissionManagement?.status === 'pending'}
              onClick={() =>
                runProbe(
                  'permissionManagement',
                  rbacApi.probePermissionManagement,
                )
              }
            >
              {probes.permissionManagement?.status === 'pending'
                ? 'Checking…'
                : 'Check'}
            </button>
          </div>
          {probes.permissionManagement ? (
            <ProbeResult probe={probes.permissionManagement} />
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProbeResult({ probe }: { probe: ProbeState }) {
  if (probe.status === 'pending') {
    return (
      <p className="probe__result probe__result--pending" role="status">
        Checking access…
      </p>
    )
  }

  if (probe.status === 'granted') {
    return (
      <Alert variant="success" title="Access granted">
        {probe.message}
      </Alert>
    )
  }

  if (probe.status === 'denied') {
    return (
      <Alert variant="error" title="Access denied">
        {probe.message} Your session stays active; the Identity Service
        simply denied this operation.
      </Alert>
    )
  }

  return (
    <Alert variant="warning" title="Check failed">
      {probe.message}
    </Alert>
  )
}
