import { Track } from 'livekit-client'
import {
  ParticipantLoop,
  useParticipants,
  useSpeakingParticipants,
} from '@livekit/components-react'
import { useEffect, useMemo, useState } from 'react'
import { VideoTile } from './VideoTile'
import { ScreenShareFocusTile } from './VideoTile'

export function VideoGrid() {
  const participants = useParticipants()
  const speakerParticipants = useSpeakingParticipants()
  const [screenShareIdentity, setScreenShareIdentity] = useState<string | null>(null)

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

  const mode = useMemo(() => {
    if (count <= 1) return 'one'
    if (count === 2) return 'two'
    if (count <= 4) return 'four'
    if (count <= 9) return 'adaptive'
    return 'many'
  }, [count])

  return (
    <div
      className={[
        'video-area',
        `video-grid--${mode}`,
        screenShareIdentity ? 'video-grid--screen-share' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {screenShareIdentity ? (
        <ParticipantLoop
          participants={participants.filter((p) => p.identity === screenShareIdentity)}
        >
          <ScreenShareFocusTile />
        </ParticipantLoop>
      ) : null}
      <div className="video-grid">
        {count === 0 && (
          <div className="empty-state">
            <h3 className="empty-state__title">Waiting for participants</h3>
            <p className="empty-state__description">No one else has joined the session yet.</p>
          </div>
        )}
        <ParticipantLoop participants={others}>
          <VideoTile speakerIdentities={speakerIdentities} />
        </ParticipantLoop>
      </div>
    </div>
  )
}
