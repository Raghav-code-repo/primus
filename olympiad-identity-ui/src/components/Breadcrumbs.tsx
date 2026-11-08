import { Link } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  /** The target of the crumb. The last crumb is usually the current page. */
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

/**
 * The path of the current page. The last entry describes the page itself and
 * is not a link.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li className="breadcrumbs__item" key={`${item.label}-${index}`}>
              {item.to && !isLast ? (
                <Link className="breadcrumbs__link" to={item.to}>
                  {item.label}
                </Link>
              ) : (
                <span
                  className="breadcrumbs__current"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
