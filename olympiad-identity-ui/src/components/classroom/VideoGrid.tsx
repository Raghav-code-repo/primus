import { Track } from 'livekit-client'
import {
  ParticipantLoop,
  useParticipants,
  useSpeakingParticipants,
  useLocalParticipant,
} from '@livekit/components-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Speaker, Grid2x2, Monitor } from 'lucide-react'
import { VideoTile } from './VideoTile'

type LayoutMode = 'speaker' | 'gallery' | 'screen-share'

interface VideoGridProps {
  mode?: LayoutMode
  onModeChange?: (mode: LayoutMode) => void
}

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  speaker: 'Speaker view',
  gallery: 'Gallery view',
  'screen-share': 'Screen share view',
}

export function VideoGrid({ mode: initialMode, onModeChange }: VideoGridProps = {}) {
  const participants = useParticipants()
  const speakerParticipants = useSpeakingParticipants()
  const { localParticipant } = useLocalParticipant()
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(initialMode ?? 'gallery')
  const [screenShareIdentity, setScreenShareIdentity] = useState<string | null>(null)
  const [pinned, setPinned] = useState<Set<string>>(new Set())

  useEffect(() => {
    let next: string | null = null
    for (const p of participants) {
      const tracks = (p as unknown as Record<string, unknown>).tracks
      if (tracks && typeof tracks === 'object' && 'values' in tracks) {
        const values = (tracks as { values: () => Iterable<Record<string, unknown>> }).values()
        for (const t of values) {
          if (t.source === Track.Source.ScreenShare) {
            next = p.identity
            break
          }
        }
      }
      if (next) break
    }
    setScreenShareIdentity(next)
  }, [participants])

  const speakerIdentities = useMemo(
    () => new Set(speakerParticipants.map((p) => p.identity)),
    [speakerParticipants],
  )

  const others = participants.filter((p) => p.identity !== screenShareIdentity)
  const count = others.length
  const pinnedParticipants = [...pinned]
    .map((id) => participants.find((p) => p.identity === id))
    .filter(Boolean)

  const mainSpeaker = useMemo(() => {
    if (pinnedParticipants.length > 0) return pinnedParticipants[0]
    if (speakerParticipants.length > 0) return speakerParticipants[0]
    if (localParticipant) return localParticipant
    if (others.length > 0) return others[0]
    return null
  }, [pinnedParticipants, speakerParticipants, localParticipant, others])

  const handlePinToggle = useCallback((identity: string) => {
    setPinned((prev) => {
      const next = new Set(prev)
      if (next.has(identity)) next.delete(identity)
      else next.add(identity)
      return next
    })
  }, [])

  const handleModeChange = useCallback((next: LayoutMode) => {
    setLayoutMode(next)
    onModeChange?.(next)
  }, [onModeChange])

  const isScreenShareActive = layoutMode === 'screen-share' || screenShareIdentity != null

  const stripParticipants = useMemo(() => {
    const mainId = mainSpeaker?.identity ?? null
    return others.filter((p) => p.identity !== mainId)
  }, [mainSpeaker, others])

  return (
    <div
      className={[
        'video-area',
        `video-layout--${layoutMode}`,
        isScreenShareActive ? 'video-layout--screen-share-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Layout selector */}
      <div className="layout-selector" aria-label="Video layout">
        <span className="layout-selector__label">Layout</span>
        {(['speaker', 'gallery', 'screen-share'] as const).map((m) => {
          const icon =
            m === 'speaker' ? <Speaker size={14} /> : m === 'gallery' ? <Grid2x2 size={14} /> : <Monitor size={14} />
          return (
            <button
              key={m}
              type="button"
              className={[
                'layout-selector__btn',
                layoutMode === m ? 'layout-selector__btn--active' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleModeChange(m)}
              aria-pressed={layoutMode === m}
              title={LAYOUT_LABELS[m]}
            >
              {icon}
              <span className="layout-selector__text">{LAYOUT_LABELS[m]}</span>
            </button>
          )
        })}
      </div>

      {isScreenShareActive && screenShareIdentity ? (
        <div className="speaker-stage">
          <div className="speaker-stage__main">
            <ParticipantLoop
              participants={participants.filter((p) => p.identity === screenShareIdentity)}
            >
              <VideoTile
                speakerIdentities={speakerIdentities}
                isFocused
                contain
              />
            </ParticipantLoop>
          </div>
          <div className="speaker-stage__thumbnails thumbnail-strip">
            <ParticipantLoop participants={stripParticipants}>
              <VideoTile
                speakerIdentities={speakerIdentities}
                pinnedIdentities={pinned}
                onPinToggle={handlePinToggle}
              />
            </ParticipantLoop>
          </div>
        </div>
      ) : layoutMode === 'speaker' ? (
        <div className="speaker-stage">
          <div className="speaker-stage__main">
            {mainSpeaker && (
              <ParticipantLoop participants={[mainSpeaker]}>
                <VideoTile
                  speakerIdentities={speakerIdentities}
                  isFocused
                  pinned={pinned.has(mainSpeaker.identity)}
                  pinnedIdentities={pinned}
                  onPinToggle={handlePinToggle}
                />
              </ParticipantLoop>
            )}
          </div>
          <div className="speaker-stage__thumbnails thumbnail-strip">
            <ParticipantLoop participants={stripParticipants}>
              <VideoTile
                speakerIdentities={speakerIdentities}
                pinnedIdentities={pinned}
                onPinToggle={handlePinToggle}
              />
            </ParticipantLoop>
          </div>
        </div>
      ) : (
        <div className="video-grid">
          {count === 0 && (
            <div className="empty-state">
              <h3 className="empty-state__title">Waiting for participants</h3>
              <p className="empty-state__description">
                No one else has joined the session yet.
              </p>
            </div>
          )}
          <ParticipantLoop participants={others}>
            <VideoTile
              speakerIdentities={speakerIdentities}
              pinnedIdentities={pinned}
              onPinToggle={handlePinToggle}
            />
          </ParticipantLoop>
        </div>
      )}
    </div>
  )
}
