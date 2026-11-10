import { useLocalParticipant } from '@livekit/components-react'
import { useCallback, useEffect, useMemo, type ReactElement, type RefObject, useState } from 'react'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  LogOut,
  Hand,
  MessageCircle,
  Users,
  List,
  PlayCircle,
  Settings,
  Maximize,
  Minimize,
} from 'lucide-react'
import { Button, IconButton } from '../ui/button'
import { Tooltip } from '../ui/tooltip'
import { Badge } from '../ui/badge'

export interface BottomToolbarProps {
  isCameraEnabled: boolean
  isMicrophoneEnabled: boolean
  cameraToggling?: boolean
  microphoneToggling?: boolean
  onCameraToggle: () => void
  onMicrophoneToggle: () => void
  onScreenShareToggle: () => void
  screenSharing: boolean
  onRaiseHandToggle: () => void
  handRaised: boolean
  onChatToggle: () => void
  onParticipantsToggle: () => void
  onQuestionsToggle: () => void
  activeTab: 'chat' | 'participants' | 'questions'
  unreadCount: number
  participantCount: number
  onMuteAll?: () => void
  onLaunchQuestion?: () => void
  onOpenSettings?: () => void
  isTeacher: boolean
  onLeave: () => void
  onMediaError?: (message: string) => void
  mediaError?: string | null
  onClearMediaError?: () => void
  containerRef?: RefObject<HTMLDivElement | null>
}

export function BottomToolbar({
  isCameraEnabled,
  isMicrophoneEnabled,
  cameraToggling = false,
  microphoneToggling = false,
  onCameraToggle,
  onMicrophoneToggle,
  onScreenShareToggle,
  screenSharing,
  onRaiseHandToggle,
  handRaised,
  onChatToggle,
  onParticipantsToggle,
  onQuestionsToggle,
  activeTab,
  unreadCount,
  participantCount,
  onMuteAll,
  onLaunchQuestion,
  onOpenSettings,
  isTeacher,
  onLeave,
  onMediaError,
  mediaError,
  onClearMediaError,
}: BottomToolbarProps) {
  const { localParticipant } = useLocalParticipant()
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = document.documentElement
    if (!document.fullscreenElement) {
      void el
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => setIsFullscreen(false))
    } else {
      void document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => setIsFullscreen(false))
    }
  }, [])

  const handleMuteAll = useCallback(async () => {
    if (!onMuteAll) return
    try {
      await onMuteAll()
    } catch (err) {
      void onMediaError?.(
        err instanceof Error ? err.message : 'Failed to mute all participants.',
      )
    }
  }, [onMuteAll, onMediaError])

  const toolbarButtons = useMemo(() => {
    const base: Array<{
      key: string
      active?: boolean
      disabled?: boolean
      onClick: () => void
      variant?: 'ghost' | 'primary' | 'secondary' | 'danger' | 'danger' | 'danger'
      icon: ReactElement
      label: string
      badge?: number
    }> = [
      {
        key: 'microphone',
        active: isMicrophoneEnabled,
        disabled: microphoneToggling || (!isMicrophoneEnabled && localParticipant === undefined),
        onClick: onMicrophoneToggle,
        icon: isMicrophoneEnabled ? <Mic size={18} /> : <MicOff size={18} />,
        label: isMicrophoneEnabled ? 'Disable microphone' : 'Enable microphone',
      },
      {
        key: 'camera',
        active: isCameraEnabled,
        disabled: cameraToggling || (!isCameraEnabled && localParticipant === undefined),
        onClick: onCameraToggle,
        icon: isCameraEnabled ? <Video size={18} /> : <VideoOff size={18} />,
        label: isCameraEnabled ? 'Disable camera' : 'Enable camera',
      },
      {
        key: 'screen',
        active: screenSharing,
        onClick: onScreenShareToggle,
        icon: <Monitor size={18} />,
        label: screenSharing ? 'Stop sharing screen' : 'Share screen',
      },
      {
        key: 'hand',
        active: handRaised,
        onClick: onRaiseHandToggle,
        icon: <Hand size={18} />,
        label: handRaised ? 'Lower hand' : 'Raise hand',
      },
      {
        key: 'chat',
        active: activeTab === 'chat',
        onClick: onChatToggle,
        icon: <MessageCircle size={18} />,
        badge: unreadCount > 0 ? unreadCount : undefined,
        label: 'Chat',
      },
      {
        key: 'participants',
        active: activeTab === 'participants',
        onClick: onParticipantsToggle,
        icon: <Users size={18} />,
        badge: participantCount > 0 ? participantCount : undefined,
        label: 'Participants',
      },
      {
        key: 'questions',
        active: activeTab === 'questions',
        onClick: onQuestionsToggle,
        icon: <List size={18} />,
        label: 'Questions',
      },
      {
        key: 'fullscreen',
        active: isFullscreen,
        onClick: toggleFullscreen,
        icon: isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />,
        label: isFullscreen ? 'Exit full screen' : 'Full screen',
      },
    ]

    if (isTeacher) {
      base.push(
        {
          key: 'mute-all',
          onClick: handleMuteAll,
          disabled: !onMuteAll,
          icon: <MicOff size={18} />,
          label: 'Mute all',
        },
        {
          key: 'launch-question',
          onClick: onLaunchQuestion ?? (() => {}),
          icon: <PlayCircle size={18} />,
          label: 'Launch question',
        },
        {
          key: 'settings',
          onClick: onOpenSettings ?? (() => {}),
          icon: <Settings size={18} />,
          label: 'Classroom settings',
        },
      )
    }

    base.push({
      key: 'leave',
      onClick: onLeave,
      variant: 'danger',
      icon: <LogOut size={18} />,
      label: 'Leave classroom',
    })

    return base
  }, [
    isCameraEnabled,
    isMicrophoneEnabled,
    cameraToggling,
    microphoneToggling,
    localParticipant,
    onCameraToggle,
    onMicrophoneToggle,
    onScreenShareToggle,
    screenSharing,
    onRaiseHandToggle,
    handRaised,
    onChatToggle,
    onParticipantsToggle,
    onQuestionsToggle,
    activeTab,
    unreadCount,
    participantCount,
    isTeacher,
    handleMuteAll,
    onMuteAll,
    onLaunchQuestion,
    onOpenSettings,
    onLeave,
    isFullscreen,
    toggleFullscreen,
  ])

  return (
    <footer className="classroom__controls">
      {mediaError && onClearMediaError && (
        <div className="alert alert--error media-error-banner" role="alert">
          <p className="alert__title">Camera or microphone error</p>
          <div className="alert__body">{mediaError}</div>
          <button
            className="button button--primary"
            type="button"
            onClick={onClearMediaError}
            aria-label="Dismiss camera or microphone error"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="controls__media">
        <div className="toolbar-group">
          {toolbarButtons.map((button) => (
            <Tooltip key={button.key} label={button.label} placement="top">
              <IconButton
                key={button.key}
                variant={button.variant ?? 'ghost'}
                active={button.active}
                disabled={button.disabled}
                onClick={button.onClick}
                ariaLabel={button.label}
              >
                {button.icon}
                {button.badge != null && (
                  <Badge variant="danger" size="sm" className="toolbar-badge">
                    {button.badge}
                  </Badge>
                )}
              </IconButton>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className="controls__leave">
        {isTeacher && (
          <div className="toolbar__actions">
            <Button variant="ghost" size="sm" onClick={onLeave} aria-label="Leave classroom">
              <LogOut size={16} aria-hidden="true" />
              Leave
            </Button>
          </div>
        )}
      </div>
    </footer>
  )
}
