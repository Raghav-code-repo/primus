import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Children,
  cloneElement,
  type MouseEvent,
  type ReactElement,
} from 'react'

export interface TooltipProps {
  children: ReactElement
  label: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({
  children,
  label,
  placement = 'top',
}: TooltipProps) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    timerRef.current = setTimeout(() => setOpen(false), 100)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const element = Children.only(children) as ReactElement<any>

  return (
    <span
      ref={anchorRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-flex' }}
    >
      {cloneElement(element, {
        'data-tooltip': open ? label : undefined,
        'data-tooltip-placement': placement,
        onMouseEnter: (e: MouseEvent) => {
          handleMouseEnter()
          if (element.props.onMouseEnter) {
            element.props.onMouseEnter(e)
          }
        },
        onMouseLeave: (e: MouseEvent) => {
          handleMouseLeave()
          if (element.props.onMouseLeave) {
            element.props.onMouseLeave(e)
          }
        },
      })}
      {open && (
        <div
          className={`tooltip tooltip--${placement}`}
          role="tooltip"
          style={{ pointerEvents: 'none' }}
        >
          {label}
        </div>
      )}
    </span>
  )
}
