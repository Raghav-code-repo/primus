import {
  useCallback,
  useEffect,
  useRef,
  useState,
  Children,
  cloneElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

export interface DropdownMenuProps {
  children: ReactNode
  trigger: ReactElement
  items: Array<{
    key: string
    label: string
    disabled?: boolean
    onSelect?: () => void
  }>
  className?: string
}

export function DropdownMenu({
  children,
  trigger,
  items,
  className,
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

  const toggle = useCallback(() => setOpen((o) => !o), [])

  const place = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.bottom + 6 })
  }, [])

  useEffect(() => {
    if (open) {
      place()
      const handler = () => place()
      window.addEventListener('scroll', handler, true)
      return () => window.removeEventListener('scroll', handler, true)
    }
  }, [open, place])

  const handleSelect = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key)
      if (!item || item.disabled) return
      setOpen(false)
      void item.onSelect?.()
    },
    [items],
  )

  const element = Children.only(trigger) as ReactElement<any>

  return (
    <span style={{ display: 'inline-flex', position: 'relative' }}>
      {cloneElement(element, {
        ref: anchorRef,
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          toggle()
          if (element.props.onClick) {
            element.props.onClick(e)
          }
        },
      })}
      {children}
      {open && (
        <div
          className={`dropdown-menu ${className ?? ''}`}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            zIndex: 200,
          }}
          onMouseLeave={() => setOpen(false)}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={item.disabled}
              className={`dropdown-menu__item${
                item.disabled ? ' dropdown-menu__item--disabled' : ''
              }`}
              onClick={() => {
                setOpen(false)
                void handleSelect(item.key)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </span>
  )
}
