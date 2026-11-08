import { useEffect, useRef } from 'react'
import {
  useLocalParticipant,
  useParticipantInfo,
  useParticipantTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { Mic, MicOff, Smartphone } from 'lucide-react'
import { ParticipantTile, VideoTrack } from '@livekit/components-react'

interface VideoTileProps {
  isFocused?: boolean
  speakerIdentities: Set<string>
}

export function VideoTile({
  isFocused = false,
  speakerIdentities,
}: VideoTileProps) {
  const { identity: infoIdentity, name } = useParticipantInfo()
  const cameraTracks = useParticipantTracks([Track.Source.Camera], infoIdentity)
  const screenTracks = useParticipantTracks([Track.Source.ScreenShare], infoIdentity)
  const micTracks = useParticipantTracks([Track.Source.Microphone], infoIdentity)
  const { localParticipant } = useLocalParticipant()
  const isLocal = infoIdentity === localParticipant?.identity
  const displayName = name || infoIdentity || (isLocal ? 'You' : 'Participant')
  const cameraTrackRef = cameraTracks[0]
  const screenTrackRef = screenTracks[0]
  const isScreenSharing = screenTrackRef != null
  const trackRef = isScreenSharing ? screenTrackRef : cameraTrackRef
  const micEnabled = micTracks.length > 0

  const loggedTrackRefs = useRef<Set<string>>(new Set())

  useEffect(() => {
    const ref = trackRef
    if (!ref) return
    const sid = ref.publication.track?.sid ?? ref.publication.trackSid
    const key = `${infoIdentity ?? ''}:${sid}`
    if (loggedTrackRefs.current.has(key)) return
    const isRemote = !isLocal
    if (ref.source === Track.Source.Camera && isRemote) {
      console.info(
        '[LiveKit] Remote camera track subscribed:',
        sid,
        'for participant',
        infoIdentity,
      )
    }
    if (ref.source === Track.Source.Camera) {
      console.info(
        '[LiveKit] Video element mounted:',
        sid,
        isLocal ? 'local preview' : 'remote video',
        'for participant',
        infoIdentity,
      )
    }
    loggedTrackRefs.current.add(key)
  }, [trackRef, infoIdentity, isLocal])

  return (
    <section
      className={[
        'video-tile',
        isFocused ? 'video-tile--focused' : '',
        speakerIdentities.has(infoIdentity ?? '') ? 'video-tile--speaking' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLocal && <span className="video-tile__badge" aria-hidden="true">You</span>}
      {isScreenSharing && (
        <span className="video-tile__badge" aria-hidden="true">Screen sharing</span>
      )}
      {        speakerIdentities.has(infoIdentity ?? '') && (
        <span className="video-tile__badge" aria-label="Active speaker">
          Active speaker
        </span>
      )}
      <div className="video-tile__media">
        {trackRef ? (
          <ParticipantTile trackRef={trackRef}>
            <VideoTrack
              trackRef={trackRef}
              manageSubscription={!isLocal}
              autoPlay
              playsInline
              muted={isLocal}
            />
          </ParticipantTile>
        ) : (
          <div className="video-tile__placeholder" aria-label={`No camera: ${displayName}`}>
            <Smartphone size={40} />
          </div>
        )}
        <span
          className="video-tile__status"
          aria-label={micEnabled ? 'Microphone on' : 'Microphone off'}
        >
          {micEnabled ? <Mic size={14} /> : <MicOff size={14} />}
        </span>
      </div>
      <span className="video-tile__name">{displayName}</span>
    </section>
  )
}

interface ScreenShareFocusTileProps {}

export function ScreenShareFocusTile({}: ScreenShareFocusTileProps) {
  const { identity: infoIdentity, name } = useParticipantInfo()
  const screenTracks = useParticipantTracks([Track.Source.ScreenShare], infoIdentity)
  const { localParticipant } = useLocalParticipant()
  const isLocal = infoIdentity === localParticipant?.identity
  const trackRef = screenTracks[0]
  const displayName = name || infoIdentity || (isLocal ? 'You' : 'Participant')

  return (
    <section className="video-tile video-tile--focused">
      <span className="video-tile__badge" aria-hidden="true">Screen sharing</span>
      <div className="video-tile__media">
        {trackRef ? (
          <ParticipantTile trackRef={trackRef}>
            <VideoTrack
              trackRef={trackRef}
              manageSubscription={!isLocal}
              autoPlay
              playsInline
              muted={isLocal}
            />
          </ParticipantTile>
        ) : (
          <div className="video-tile__placeholder" aria-label={`Screen share: ${displayName}`}>
            <Smartphone size={40} />
          </div>
        )}
        <span className="video-tile__name">{displayName}</span>
      </div>
    </section>
  )
}
