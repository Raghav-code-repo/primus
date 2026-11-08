import { useCallback, useState } from 'react'

export interface TabsProps {
  tabs: Array<{ key: string; label: string }>
  activeKey: string
  onChange: (key: string) => void
  className?: string
}

export function Tabs({
  tabs,
  activeKey,
  onChange,
  className,
}: TabsProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const handleKeyDown = useCallback(
    (key: string) => {
      const index = tabs.findIndex((t) => t.key === key)
      if (index === -1) return
      setFocusedIndex(index)
      onChange(key)
    },
    [tabs, onChange],
  )

  return (
    <div className={`tabs ${className ?? ''}`} role="tablist" aria-label="Tabs">
      {tabs.map((tab) => {
        const active = tab.key === activeKey
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            className={`tabs__tab${active ? ' tabs__tab--active' : ''}${
              focusedIndex === tabs.indexOf(tab) ? ' tabs__tab--focused' : ''
            }`}
            onFocus={() => setFocusedIndex(tabs.indexOf(tab))}
            onBlur={() => setFocusedIndex(null)}
            onClick={() => handleKeyDown(tab.key)}
          >
            {tab.label}
            {active && <span className="tabs__indicator" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}
