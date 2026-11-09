import { useState } from 'react'
import type { Socket } from 'socket.io-client'
import { isUuidLike } from '../../utils/displayName'

interface SocketModerationPanelProps {
  socket: Socket | null
  classId: string
  isTeacher: boolean
  participants?: Array<{ identity: string; name: string }>
}

export function SocketModerationPanel({ socket, classId, isTeacher, participants = [] }: SocketModerationPanelProps) {
  const [targetId, setTargetId] = useState('')
  if (!isTeacher) return null
  return (
    <div className="socket-moderation">
      <div className="socket-moderation__title">Socket moderation</div>
      <label className="form-field__label" htmlFor="socket-mod-target">Participant</label>
      {participants.length > 0 ? (
        <select
          id="socket-mod-target"
          className="form-input"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
        >
          <option value="">Select a participant</option>
          {participants.map((p) => (
            <option key={p.identity} value={p.identity}>
              {isUuidLike(p.name) ? 'Participant' : p.name}
            </option>
          ))}
        </select>
      ) : (
        <input
          id="socket-mod-target"
          className="form-input"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="Participant ID (internal)"
        />
      )}
      <div className="socket-moderation__actions">
        <button className="button button--ghost button--sm" disabled={!targetId} onClick={() => socket?.emit('moderation:mute_participant', { classId, userId: targetId })}>Mute</button>
        <button className="button button--ghost button--sm" disabled={!targetId} onClick={() => socket?.emit('moderation:remove_participant', { classId, userId: targetId })}>Remove</button>
        <button className="button button--ghost button--sm" disabled={!targetId} onClick={() => socket?.emit('moderation:screen_share_revoked', { classId, userId: targetId })}>Revoke screen share</button>
      </div>
      <p className="form-field__hint">Actions target the selected participant’s internal ID; names shown for clarity.</p>
    </div>
  )
}
