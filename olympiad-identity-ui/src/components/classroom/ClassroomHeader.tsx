import { useConnectionState, useRoomInfo, useParticipants } from '@livekit/components-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users, Wifi, Clock, Menu } from 'lucide-react'
import { Button, IconButton } from '../ui/button'
import { Tooltip } from '../ui/tooltip'
import { useAuth } from '../../auth/useAuth'

export interface ClassroomHeaderProps {
  onLeave: () => void
  onToggleSidebar: () => void
  classTitle?: string | null
}

export function ClassroomHeader({
  onLeave,
  onToggleSidebar,
  classTitle,
}: ClassroomHeaderProps) {
  const roomInfo = useRoomInfo()
  const connectionStatus = useConnectionState()
  const participants = useParticipants()
  const { user } = useAuth()

  const [sessionStart, setSessionStart] = useState<Date | null>(null)

  useEffect(() => {
    if (connectionStatus === 'connected' && !sessionStart) {
      setSessionStart(new Date())
    }
  }, [connectionStatus, sessionStart])

  const title = classTitle ?? roomInfo?.name ?? 'Live Class'

  useEffect(() => {
    document.title = title
  }, [title])

  const teacherName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
    : 'Teacher'

  const duration = useMemo(() => {
    if (!sessionStart) return '--:--'
    const now = new Date()
    const total = Math.floor((now.getTime() - sessionStart.getTime()) / 1000)
    const minutes = Math.floor(total / 60)
    const seconds = total % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [sessionStart])

  const handleLeave = useCallback(() => {
    onLeave()
  }, [onLeave])

  return (
    <header className="classroom__header">
      <div className="classroom__brand">
        <div className="classroom__brand-mark">OL</div>
        <div className="classroom__title-group">
          <h1 className="classroom__title">{title}</h1>
          <p className="classroom__subtitle">
            {classTitle
              ? 'Olympiad live classroom'
              : roomInfo?.name
              ? `Room · ${roomInfo.name}`
              : 'Olympiad live classroom'}
          </p>
        </div>
      </div>

      <div className="classroom__meta">
        <div className="classroom__meta__group">
          <span className="classroom__pill classroom__pill--live">
            <span aria-hidden="true">●</span>
            <span className="sr-only">Live</span>LIVE
          </span>
          <span className="classroom__pill" aria-label="Session duration">
            <Clock size={12} className="icon" aria-hidden="true" />
            {duration}
          </span>
        </div>

        <div className="classroom__meta__group">
          <Tooltip label="Network connection" placement="top">
            <span className="classroom__pill" aria-label={`Connection: ${connectionStatus}`}>
              <Wifi size={12} className="icon" aria-hidden="true" />
              {connectionStatus}
            </span>
          </Tooltip>
          <span className="classroom__pill" aria-label="Participant count">
            <Users size={12} className="icon" aria-hidden="true" />
            {participants.length + 1}
          </span>
          <span className="classroom__pill" aria-label="Teacher">
            {teacherName}
          </span>
        </div>

        <div className="classroom__leave">
          <IconButton
            variant="ghost"
            size="sm"
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            ariaLabel="Toggle sidebar"
          >
            <Menu size={18} />
          </IconButton>
          <Button variant="danger" size="sm" onClick={handleLeave} aria-label="Leave classroom">
            Leave classroom
          </Button>
        </div>
      </div>
    </header>
  )
}
