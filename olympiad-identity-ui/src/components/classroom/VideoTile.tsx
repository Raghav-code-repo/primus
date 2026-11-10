import { useEffect, useRef } from 'react'
import {
  useLocalParticipant,
  useParticipantInfo,
  useParticipantTracks,
} from '@livekit/components-react'
import { Track } from 'livekit-client'
import { Mic, MicOff, Smartphone, Pin, PinOff } from 'lucide-react'
import { ParticipantTile, VideoTrack } from '@livekit/components-react'
import { useAuth } from '../../auth/useAuth'
import { resolveDisplayName, resolveParticipantDisplayName } from '../../utils/displayName'

interface VideoTileProps {
  isFocused?: boolean
  speakerIdentities: Set<string>
  pinned?: boolean
  pinnedIdentities?: Set<string>
  onPinToggle?: (identity: string) => void
  contain?: boolean
}

export function VideoTile({
  isFocused = false,
  speakerIdentities,
  pinned = false,
  pinnedIdentities,
  onPinToggle,
  contain = false,
}: VideoTileProps) {
  const { user } = useAuth()
  const { identity: infoIdentity, name } = useParticipantInfo()
  const cameraTracks = useParticipantTracks([Track.Source.Camera], infoIdentity)
  const screenTracks = useParticipantTracks([Track.Source.ScreenShare], infoIdentity)
  const micTracks = useParticipantTracks([Track.Source.Microphone], infoIdentity)
  const { localParticipant } = useLocalParticipant()
  const isLocal = infoIdentity === localParticipant?.identity
  const displayName = isLocal
    ? resolveDisplayName({ firstName: user?.firstName, lastName: user?.lastName, email: user?.email, isLocal: true })
    : resolveParticipantDisplayName(infoIdentity, name, { isLocal })
  const cameraTrackRef = cameraTracks[0]
  const screenTrackRef = screenTracks[0]
  const isScreenSharing = screenTrackRef != null
  const trackRef = isScreenSharing ? screenTrackRef : cameraTrackRef
  const micEnabled = micTracks.length > 0
  const isPinned = pinned || (pinnedIdentities?.has(infoIdentity ?? '') ?? false)

  const loggedTrackRefs = useRef<Set<string>>(new Set())
  const mediaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ref = trackRef
    if (!ref) {
      console.info('[LiveKit] No camera track ref for participant', infoIdentity)
      return
    }
    const sid = ref.publication.track?.sid ?? ref.publication.trackSid
    const key = `${infoIdentity ?? ''}:${sid}`
    if (loggedTrackRefs.current.has(key)) return
    const isRemote = !isLocal
    const track = ref.publication.track
    const mediaStreamTrack = track?.mediaStreamTrack
    console.info('[LiveKit] Track diagnostics:', {
      participant: infoIdentity,
      isLocal,
      sid,
      source: ref.source,
      kind: track?.kind,
      publicationState: ref.publication.track ? 'published' : 'unpublished',
      isPublished: Boolean(ref.publication.track),
      readyState: mediaStreamTrack?.readyState,
      enabled: mediaStreamTrack?.enabled,
      muted: mediaStreamTrack?.muted,
      subscribed: ref.publication.isSubscribed,
    })
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

    const inspectVideo = () => {
      const video = mediaRef.current?.querySelector('video') as HTMLVideoElement | null
      if (!video) {
        console.warn('[LiveKit] No video element found for', infoIdentity)
        return
      }
      console.info('[LiveKit] Video element diagnostics:', {
        participant: infoIdentity,
        exists: true,
        srcObject: Boolean(video.srcObject),
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
        muted: video.muted,
        autoplay: video.autoplay,
      })
      void video.play().then(() => {
        console.info('[LiveKit] video.play() resolved for', infoIdentity)
      }).catch((err) => {
        console.warn('[LiveKit] video.play() rejected for', infoIdentity, err?.name, err?.message)
      })
    }
    const timer = window.setTimeout(inspectVideo, 500)
    return () => window.clearTimeout(timer)
  }, [trackRef, infoIdentity, isLocal])

  return (
    <section
      className={[
        'video-tile',
        isFocused ? 'video-tile--focused' : '',
        speakerIdentities.has(infoIdentity ?? '') ? 'video-tile--speaking' : '',
        isPinned ? 'video-tile--pinned' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isLocal && <span className="video-tile__badge" aria-hidden="true">You</span>}
      {isScreenSharing && (
        <span className="video-tile__badge" aria-hidden="true">Screen sharing</span>
      )}
      {isPinned && (
        <span className="video-tile__badge" aria-label="Pinned participant">Pinned</span>
      )}
      {speakerIdentities.has(infoIdentity ?? '') && (
        <span className="video-tile__badge" aria-label="Active speaker">
          Active speaker
        </span>
      )}
      <div
        className={[
          'video-tile__media',
          contain ? 'video-tile__media--contain' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        ref={mediaRef}
      >
        {trackRef ? (
          <ParticipantTile trackRef={trackRef}>
            <VideoTrack
              trackRef={trackRef}
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
        {onPinToggle && infoIdentity && (
          <button
            type="button"
            className="video-tile__pin"
            aria-label={isPinned ? 'Unpin participant' : 'Pin participant'}
            onClick={() => onPinToggle(infoIdentity)}
            aria-pressed={isPinned}
          >
            {pinned ? <PinOff size={16} /> : <Pin size={16} />}
          </button>
        )}
      </div>
      <span className="video-tile__name">{displayName}</span>
    </section>
  )
}

interface ScreenShareFocusTileProps {}

export function ScreenShareFocusTile({}: ScreenShareFocusTileProps) {
  const { user } = useAuth()
  const { identity: infoIdentity, name } = useParticipantInfo()
  const screenTracks = useParticipantTracks([Track.Source.ScreenShare], infoIdentity)
  const { localParticipant } = useLocalParticipant()
  const isLocal = infoIdentity === localParticipant?.identity
  const trackRef = screenTracks[0]
  const displayName = isLocal
    ? resolveDisplayName({ firstName: user?.firstName, lastName: user?.lastName, email: user?.email, isLocal: true })
    : resolveParticipantDisplayName(infoIdentity, name, { isLocal })

  return (
    <section className="video-tile video-tile--focused">
      <span className="video-tile__badge" aria-hidden="true">Screen sharing</span>
      <div className="video-tile__media">
        {trackRef ? (
          <ParticipantTile trackRef={trackRef}>
            <VideoTrack
              trackRef={trackRef}
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
