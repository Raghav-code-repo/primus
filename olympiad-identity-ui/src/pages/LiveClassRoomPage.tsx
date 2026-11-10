import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MediaDeviceFailure, Track, type LocalTrackPublication } from 'livekit-client'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ConnectionStateToast,
  useLocalParticipant,
  useParticipants,
} from '@livekit/components-react'

import { getLiveKitTokenGet, getLiveClass } from '../api/liveClassApi'
import {
  disconnectStomp,
  raiseHand,
  lowerHand,
  listRaisedHands,
  acceptRaisedHand,
  lowerRaisedHand,
  muteParticipant,
  muteAllParticipants,
} from '../api/classroomApi'
import type { RaisedHand } from '../types/classroom'
import { useToast } from '../hooks/useToast'
import { useClassroomSocket } from '../hooks/useClassroomSocket'
import { resolveDisplayName } from '../utils/displayName'

import { ROLE_TEACHER } from '../auth/roles'
import { useAuth } from '../auth/useAuth'
import { ClassroomHeader } from '../components/classroom/ClassroomHeader'
import { VideoGrid } from '../components/classroom/VideoGrid'
import { BottomToolbar } from '../components/classroom/BottomToolbar'
import { SocketChatPanel } from '../components/classroom/SocketChatPanel'
import { SocketQuestionPanel } from '../components/classroom/SocketQuestionPanel'
import { SocketModerationPanel } from '../components/classroom/SocketModerationPanel'
import { ParticipantsPanel } from '../components/classroom/ParticipantsPanel'

type Tab = 'chat' | 'participants' | 'questions'

function mediaErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)
  const name = err instanceof Error ? err.name : ''
  const lower = message.toLowerCase()
  if (name === 'NotAllowedError' || lower.includes('permission') || lower.includes('not allowed')) {
    return 'Camera or microphone access was denied. Allow access in your browser and retry.'
  }
  if (name === 'NotReadableError' || lower.includes('could not start') || lower.includes('not readable')) {
    return 'Camera or microphone is in use by another application. Close it and retry.'
  }
  if (name === 'NotFoundError' || lower.includes('not found') || lower.includes('no device')) {
    return 'No camera or microphone was found on this device.'
  }
  if (name === 'OverconstrainedError' || lower.includes('overconstrained')) {
    return 'The requested camera or microphone settings are not supported.'
  }
  if (lower.includes('deviceinuse') || lower.includes('device in use')) {
    return 'Camera or microphone is already in use. Close other applications using it and retry.'
  }
  return 'Unable to access the camera or microphone. Please try again.'
}

function logMediaPermissions(): void {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return
  }
  void navigator.permissions
    .query({ name: 'camera' as PermissionName })
    .then((result) => {
      console.info('[LiveKit] Camera permission status:', result.state)
    })
    .catch(() => {
      // Permission query is not supported in this browser.
    })
  void navigator.permissions
    .query({ name: 'microphone' as PermissionName })
    .then((result) => {
      console.info('[LiveKit] Microphone permission status:', result.state)
    })
    .catch(() => {
      // Permission query is not supported in this browser.
    })
}

function logMediaDevices(): void {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.enumerateDevices
  ) {
    return
  }
  void navigator.mediaDevices
    .enumerateDevices()
    .then((devices) => {
      const cameras = devices.filter((d) => d.kind === 'videoinput')
      const microphones = devices.filter((d) => d.kind === 'audioinput')
      console.info(
        '[LiveKit] Available camera devices:',
        cameras.map((d) => ({
          deviceId: d.deviceId,
          label: d.label || 'unlabeled',
        })),
      )
      console.info(
        '[LiveKit] Available microphone devices:',
        microphones.map((d) => ({
          deviceId: d.deviceId,
          label: d.label || 'unlabeled',
        })),
      )
    })
    .catch((err) => {
      console.error(
        '[LiveKit] Failed to enumerate media devices:',
        err instanceof Error ? err.message : String(err),
      )
    })
}

export function LiveClassRoomPage() {
  const { id } = useParams<{ id: string }>()
  const [token, setToken] = useState<string | null>(null)
  const [serverUrl, setServerUrl] = useState<string | null>(null)
  const [classTitle, setClassTitle] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      if (!id) {
        setError('No class was specified.')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await getLiveKitTokenGet(id)
        if (!active) return
        setToken(response.token)
        setServerUrl(response.url)

        // Fetch the human-readable class title for display. This is
        // independent of the token so a failure here never blocks joining.
        try {
          const liveClassData = await getLiveClass(id)
          if (!active) return
          setClassTitle(liveClassData.title ?? null)
        } catch (err) {
          console.warn('[LiveClass] Failed to load class details:', err)
        }
      } catch (err) {
        if (!active) return
        const status = (err as { status?: number })?.status
        setError(
          status
            ? `Unable to obtain a LiveKit token for this class (HTTP ${status}).`
            : 'Unable to obtain a LiveKit token for this class.',
        )
        setLoading(false)
      }

      if (!active) return
      setLoading(false)
    })()
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="page-container" role="status" aria-label="Joining class">
        <div className="card" style={{ maxWidth: 360, margin: '80px auto', textAlign: 'center' }}>
          <div className="spinner" aria-hidden="true" />
          <p className="card__text" style={{ marginTop: 'var(--space-3)' }}>
            Joining the live class…
          </p>
        </div>
      </div>
    )
  }
  if (error || !token || !serverUrl || !id) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 420, margin: '80px auto' }}>
          <div className="alert alert--error" role="alert">
            <p className="alert__title">Could not join the live class</p>
            <div className="alert__body">{error ?? 'Missing token or LiveKit server URL.'}</div>
          </div>
          <div className="card__actions">
            <button className="button button--primary" onClick={() => window.location.reload()}>
              Retry
            </button>
            <button className="button" onClick={() => window.history.back()}>
              Back to classes
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleError = (err: Error) => {
    console.error('[LiveKit] Error:', err.message)
  }
  const handleMediaDeviceFailure = (failure?: MediaDeviceFailure, kind?: MediaDeviceKind) => {
    console.error('[LiveKit] Media device failure:', kind, failure)
    setMediaError(mediaErrorMessage(failure ?? new Error('Media device failure')))
  }
  const handleDisconnected = () => {
    console.info('[LiveKit] Disconnected from room')
  }
  const handleConnected = () => {
    console.info('[LiveKit] Room connected', serverUrl ? `(${serverUrl})` : '')
  }

  return (
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect={true}
        audio={false}
        video={false}
        onError={handleError}
        onMediaDeviceFailure={handleMediaDeviceFailure}
        onDisconnected={handleDisconnected}
        onConnected={handleConnected}
      >
        <RoomAudioRenderer />
        <ConnectionStateToast />
        <LiveClassRoomContent
          classId={id}
          classTitle={classTitle}
          mediaError={mediaError}
          onClearMediaError={() => setMediaError(null)}
        />
      </LiveKitRoom>
  )
}

function LiveClassRoomContent({
  classId,
  classTitle,
  mediaError,
  onClearMediaError,
}: {
  classId: string
  classTitle?: string | null
  mediaError: string | null
  onClearMediaError: () => void
}) {
  const navigate = useNavigate()
  const { user, isAuthenticated, hasRole } = useAuth()
  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [raisedHands, setRaisedHands] = useState<RaisedHand[]>([])
  const [_unreadCount, _setUnreadCount] = useState(0)
  const [questionError, setQuestionError] = useState<string | null>(null)

  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, isScreenShareEnabled } = useLocalParticipant()
  const { socket, connected: socketConnected } = useClassroomSocket(classId)
  const participants = useParticipants()

  const cameraEnabledRef = useRef(isCameraEnabled)
  const cameraAcquiringRef = useRef(false)
  const [cameraToggling, setCameraToggling] = useState(false)
  const [microphoneToggling, setMicrophoneToggling] = useState(false)

  useEffect(() => {
    if (!localParticipant) return
    console.info('[LiveKit] Local participant available:', localParticipant.identity)

    logMediaPermissions()
    logMediaDevices()

    const handleLocalTrackPublished = (publication: LocalTrackPublication) => {
      const track = publication.track
      if (track?.kind === Track.Kind.Video && track.source === Track.Source.Camera) {
        console.info('[LiveKit] Camera track created and published:', track.sid)
      }
    }
    const handleLocalTrackUnpublished = (publication: LocalTrackPublication) => {
      const track = publication.track
      if (track?.kind === Track.Kind.Video && track.source === Track.Source.Camera) {
        console.info(
          '[LiveKit] Camera track unpublished:',
          track ? track.sid : 'unknown',
        )
      }
    }

    localParticipant.on('localTrackPublished', handleLocalTrackPublished)
    localParticipant.on('localTrackUnpublished', handleLocalTrackUnpublished)
    return () => {
      localParticipant.off('localTrackPublished', handleLocalTrackPublished)
      localParticipant.off('localTrackUnpublished', handleLocalTrackUnpublished)
    }
  }, [localParticipant])

  useEffect(() => {
    if (cameraEnabledRef.current !== isCameraEnabled) {
      console.info('[LiveKit] Camera enabled state:', isCameraEnabled ? 'on' : 'off')
      cameraEnabledRef.current = isCameraEnabled
    }
  }, [isCameraEnabled])

  const handleCameraToggle = useCallback(async () => {
    if (!localParticipant || cameraToggling || cameraAcquiringRef.current) return
    cameraAcquiringRef.current = true
    setCameraToggling(true)
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled)
    } catch (err) {
      const message = mediaErrorMessage(err)
      setQuestionError(message)
      toast({ title: message, variant: 'error' })
    } finally {
      cameraAcquiringRef.current = false
      setCameraToggling(false)
    }
  }, [localParticipant, isCameraEnabled, cameraToggling, toast])

  const handleMicrophoneToggle = useCallback(async () => {
    if (!localParticipant || microphoneToggling) return
    setMicrophoneToggling(true)
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    } catch (err) {
      const message = mediaErrorMessage(err)
      setQuestionError(message)
      toast({ title: message, variant: 'error' })
    } finally {
      setMicrophoneToggling(false)
    }
  }, [localParticipant, isMicrophoneEnabled, microphoneToggling, toast])

  const isTeacher = isAuthenticated && hasRole(ROLE_TEACHER)

  useEffect(() => { return () => { disconnectStomp() } }, [])

  useEffect(() => {
    if (!isTeacher) return
    let active = true
    const refresh = async () => {
      try {
        const hands = await listRaisedHands(classId)
        if (active) setRaisedHands(hands)
      } catch { /* ignore */ }
    }
    void refresh()
    const timer = setInterval(refresh, 5000)
    return () => { active = false; clearInterval(timer) }
  }, [classId, isTeacher])

  const handleLeave = useCallback(() => { navigate('/live-classes', { replace: true }) }, [navigate])

  const handleRaiseHand = useCallback(async () => {
    if (!isAuthenticated) return
    try { await raiseHand(classId); setHandRaised(true); toast({ title: 'Hand raised', variant: 'success' }) }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to raise your hand.'
      toast({ title: message, variant: 'error' })
    }
  }, [classId, isAuthenticated, toast])

  const handleLowerOwnHand = useCallback(async () => {
    try { await lowerHand(classId); setHandRaised(false) }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to lower your hand.'
      toast({ title: message, variant: 'error' })
    }
  }, [classId, toast])

  const handleAcceptRaisedHand = useCallback(async (userId: string) => {
    if (!isTeacher) return
    try { await acceptRaisedHand(classId, userId); toast({ title: 'Request accepted', variant: 'success' }) }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to accept the request.'
      toast({ title: message, variant: 'error' })
    }
  }, [classId, isTeacher, toast])

  const handleLowerRaisedHand = useCallback(async (userId: string) => {
    if (!isTeacher) return
    try { await lowerRaisedHand(classId, userId) }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to lower the hand.'
      toast({ title: message, variant: 'error' })
    }
  }, [classId, isTeacher, toast])

  const handleMuteParticipant = useCallback(async (userId: string) => {
    if (!isTeacher) return
    try { await muteParticipant(classId, userId); toast({ title: 'Participant muted', variant: 'success' }) }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mute participant.'
      toast({ title: message, variant: 'error' })
    }
  }, [classId, isTeacher, toast])

  const handleMuteAllParticipants = useCallback(async () => {
    if (!isTeacher) return
    try { await muteAllParticipants(classId); toast({ title: 'All participants muted', variant: 'success' }) }
    catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mute all participants.'
      toast({ title: message, variant: 'error' })
    }
  }, [classId, isTeacher, toast])

  const participantCount = participants.length + 1

  return (
    <div className="classroom-shell">
      <ClassroomHeader
        onLeave={handleLeave}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        classTitle={classTitle}
      />
      <div className="classroom__body">
        <main className="classroom__main"><VideoGrid /></main>
        <aside className={`classroom__sidebar${sidebarOpen ? ' classroom__sidebar--open' : ''}`}>
          {sidebarOpen && (
            <button type="button" className="sidebar__close" onClick={() => setSidebarOpen(false)} aria-label="Close panel">
              <span aria-hidden="true">×</span><span className="sr-only">Close panel</span>
            </button>
          )}
          <div className="tabs">
            <button type="button" role="tab" aria-selected={tab === 'chat'} className={`tabs__tab${tab === 'chat' ? ' tabs__tab--active' : ''}`} onClick={() => setTab('chat')}>
              Chat{_unreadCount > 0 && <span className="badge badge--danger badge--sm" style={{ marginLeft: 'var(--space-1)' }}>{_unreadCount}</span>}
            </button>
            <button type="button" role="tab" aria-selected={tab === 'participants'} className={`tabs__tab${tab === 'participants' ? ' tabs__tab--active' : ''}`} onClick={() => setTab('participants')}>
              Participants<span className="badge badge--neutral badge--sm" style={{ marginLeft: 'var(--space-1)' }}>{participantCount}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === 'questions'} className={`tabs__tab${tab === 'questions' ? ' tabs__tab--active' : ''}`} onClick={() => setTab('questions')}>
              Questions
            </button>
          </div>
          <div className="sidebar__content">
            {questionError && (
              <div className="alert alert--error sidebar__alert" role="alert">
                <p className="alert__title">Classroom error</p>
                <div className="alert__body">{questionError}</div>
              </div>
            )}

            {tab === 'chat' && (
              <div className="sidebar__tab-panel sidebar__tab-panel--chat">
                <SocketChatPanel
                  socket={socket}
                  connected={socketConnected}
                  classId={classId}
                  userId={user?.id ?? null}
                  displayName={resolveDisplayName({ firstName: user?.firstName, lastName: user?.lastName, email: user?.email, isLocal: true })}
                />
              </div>
            )}

            {tab === 'participants' && (
              <div className="sidebar__tab-panel">
                <ParticipantsPanel
                  isTeacher={isTeacher}
                  handRaised={handRaised}
                  onLowerOwnHand={handleLowerOwnHand}
                  raisedHands={raisedHands}
                  onAcceptRaisedHand={handleAcceptRaisedHand}
                  onLowerRaisedHand={handleLowerRaisedHand}
                  onMuteParticipant={handleMuteParticipant}
                  onMuteAllParticipants={handleMuteAllParticipants}
                  onError={(m: string) => setQuestionError(m)}
                  localDisplayName={resolveDisplayName({ firstName: user?.firstName, lastName: user?.lastName, email: user?.email, isLocal: true })}
                  localEmail={user?.email ?? null}
                />
                {isTeacher && (
                  <SocketModerationPanel
                    socket={socket ?? null}
                    classId={classId}
                    isTeacher={isTeacher}
                    participants={participants.map((p) => ({ identity: p.identity, name: resolveDisplayName({ name: p.name, identity: p.identity, isLocal: p.identity === localParticipant?.identity, firstName: p.identity === localParticipant?.identity ? user?.firstName : undefined, lastName: p.identity === localParticipant?.identity ? user?.lastName : undefined, email: p.identity === localParticipant?.identity ? user?.email : undefined }) }))}
                  />
                )}
              </div>
            )}

            {tab === 'questions' && (
              <div className="sidebar__tab-panel">
                <SocketQuestionPanel socket={socket ?? null} classId={classId} isTeacher={isTeacher} />
              </div>
            )}
          </div>
        </aside>
      </div>
      <BottomToolbar
        isCameraEnabled={isCameraEnabled}
        isMicrophoneEnabled={isMicrophoneEnabled}
        cameraToggling={cameraToggling}
        microphoneToggling={microphoneToggling}
        onCameraToggle={handleCameraToggle}
        onMicrophoneToggle={handleMicrophoneToggle}
        onScreenShareToggle={() => localParticipant?.setScreenShareEnabled(!isScreenShareEnabled)}
        screenSharing={isScreenShareEnabled}
        onRaiseHandToggle={handRaised ? handleLowerOwnHand : handleRaiseHand}
        handRaised={handRaised}
        onChatToggle={() => setTab('chat')}
        onParticipantsToggle={() => setTab('participants')}
        onQuestionsToggle={() => setTab('questions')}
        activeTab={tab}
        unreadCount={_unreadCount}
        participantCount={participantCount}
        onMuteAll={handleMuteAllParticipants}
        onLaunchQuestion={() => setTab('questions')}
        onOpenSettings={() => { toast({ title: 'Classroom settings are managed by your institution.', variant: 'info' }) }}
        isTeacher={isTeacher}
        onLeave={handleLeave}
        onMediaError={(m: string) => setQuestionError(m)}
        mediaError={mediaError}
        onClearMediaError={onClearMediaError}
      />
    </div>
  )
}
