import { useCallback, useMemo } from 'react'
import { useLocalParticipant, useParticipants } from '@livekit/components-react'
import { type RaisedHand } from '../../types/classroom'
import { useToast } from '../../hooks/useToast'
import { Button } from '../ui/button'
import { IconButton } from '../ui/button'
import { Badge } from '../ui/badge'
import { ParticipantAvatar } from '../ui/participant-avatar'
import { Hand, Mic, Video } from 'lucide-react'
import { resolveDisplayName, resolveParticipantDisplayName } from '../../utils/displayName'

interface ParticipantRowProps {
  identity: string
  name: string | null | undefined
  isMe: boolean
  hand: RaisedHand | undefined
  isTeacher: boolean
  onAccept: (userId: string) => void
  onLower: (userId: string) => void
  onMute: (userId: string) => void
  onLowerOwn: () => void
  onError: (message: string) => void
  localDisplayName?: string | null
  localEmail?: string | null
}

function ParticipantRow({
  identity,
  name,
  isMe,
  hand,
  isTeacher,
  onAccept,
  onLower,
  onMute,
  onLowerOwn,
  localDisplayName,
  localEmail,
}: ParticipantRowProps) {
  const handRaised = Boolean(hand)
  const handleAccept = useCallback(() => void onAccept(identity), [onAccept, identity])
  const handleLower = useCallback(() => void onLower(identity), [onLower, identity])
  const handleMute = useCallback(() => void onMute(identity), [onMute, identity])
  const displayName = isMe
    ? (localDisplayName || resolveDisplayName({ name, identity, email: localEmail, isLocal: true }))
    : resolveParticipantDisplayName(identity, name, { isLocal: false })

  return (
    <div
      key={identity}
      className={[
        'participant-row',
        isMe ? 'participant-row--you' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
              <ParticipantAvatar
                user={{ id: identity, name: displayName }}
                name={displayName}
                size="md"
              />
      <div className="participant-row__meta">
        <div className="participant-row__name">
          {displayName}
          {isMe && <span className="badge badge--neutral badge--sm">You</span>}
          {handRaised && <span className="badge badge--warning badge--sm">Hand raised</span>}
        </div>
        <div className="participant-row__status">
          <IconButton variant="ghost" size="sm" ariaLabel="Microphone">
            <Mic size={14} />
          </IconButton>
          <IconButton variant="ghost" size="sm" ariaLabel="Camera">
            <Video size={14} />
          </IconButton>
          {handRaised && (
            <span className="badge badge--warning badge--sm" style={{ fontSize: '0.7rem' }}>
                      Queue {hand?.queuePosition ?? '--'}
            </span>
          )}
        </div>
      </div>
      <div className="participant-row__actions">
        {isTeacher && !isMe && handRaised && (
          <>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={handleAccept}
                      ariaLabel="Accept request to speak"
                    >
                      <Hand size={14} />
                    </IconButton>
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={handleLower}
                      ariaLabel="Lower hand"
                    >
                      <Hand size={14} />
                    </IconButton>
          </>
        )}
        {isTeacher && !isMe && !handRaised && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={handleMute}
                    ariaLabel="Mute participant"
                  >
                    <Mic size={14} />
                  </IconButton>
        )}
        {!isTeacher && isMe && handRaised && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={onLowerOwn}
                    ariaLabel="Lower your hand"
                  >
                    <Hand size={14} />
                  </IconButton>
        )}
      </div>
    </div>
  )
}

export interface ParticipantsPanelProps {
  isTeacher: boolean
  handRaised: boolean
  onLowerOwnHand: () => void
  raisedHands: RaisedHand[]
  onAcceptRaisedHand: (userId: string) => void
  onLowerRaisedHand: (userId: string) => void
  onMuteParticipant: (userId: string) => void
  onMuteAllParticipants: () => void
  onError: (message: string) => void
  localDisplayName?: string | null
  localEmail?: string | null
}

export function ParticipantsPanel({
  isTeacher,
  handRaised,
  onLowerOwnHand,
  raisedHands,
  onAcceptRaisedHand,
  onLowerRaisedHand,
  onMuteParticipant,
  onMuteAllParticipants,
  onError,
  localDisplayName,
  localEmail,
}: ParticipantsPanelProps) {
  const { toast } = useToast()
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const myId = localParticipant?.identity ?? null

  const raisedByUser = useMemo(() => {
    const map = new Map<string, RaisedHand>()
    for (const hand of raisedHands) map.set(hand.userId, hand)
    return map
  }, [raisedHands])

  const handleMuteAll = useCallback(async () => {
    try {
      await onMuteAllParticipants()
      toast({ title: 'All participants muted', variant: 'success' })
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to mute all participants.')
    }
  }, [onMuteAllParticipants, toast, onError])

  return (
    <section className="panel">
      <div className="panel__title">
        Participants
        {participants.length > 0 && (
          <Badge variant="neutral" size="sm">{participants.length}</Badge>
        )}
      </div>

      {isTeacher && (
        <Button variant="secondary" size="sm" onClick={handleMuteAll} className="button--block">
          Mute all
        </Button>
      )}

      <div className="participant-list">
        {participants.map((p) => {
          const isMe = p.identity === myId
          const hand = raisedByUser.get(p.identity)
          return (
            <ParticipantRow
              key={p.identity}
              identity={p.identity}
              name={p.name}
              isMe={isMe}
              hand={hand}
              isTeacher={isTeacher}
              onAccept={onAcceptRaisedHand}
              onLower={onLowerRaisedHand}
              onMute={onMuteParticipant}
              onLowerOwn={onLowerOwnHand}
              onError={onError}
              localDisplayName={localDisplayName}
              localEmail={localEmail}
            />
          )
        })}
        {participants.length === 0 && (
          <p className="empty-state__description">No participants yet.</p>
        )}
      </div>

      {!isTeacher && handRaised && (
        <div className="empty-state">
          <p className="empty-state__description">
            Your hand is raised. Wait for your teacher to accept.
          </p>
        </div>
      )}
    </section>
  )
}
