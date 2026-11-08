import { Link, NavLink } from "react-router-dom";

import { BrandLogo } from "../BrandLogo";
import type { NavigationItem } from "../../config/navigation";

interface DashboardSidebarProps {
  items: NavigationItem[];
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

function getIconForRoute(to: string) {
  if (to === "/dashboard") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    );
  }
  if (to.includes("/student/courses")) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
      </svg>
    );
  }
  if (to === "/courses" || to.startsWith("/courses/")) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
      </svg>
    );
  }
  if (to.includes("/admin/courses")) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
      </svg>
    );
  }
  if (to.includes("/live-classes")) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
      </svg>
    );
  }
  if (to.includes("/admin/content")) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    );
  }
  if (to === "/admin") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z" />
      </svg>
    );
  }
  if (to.includes("/student/profile")) {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    );
  }
  if (to === "/profile") {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}

export function DashboardSidebar({
  items,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: DashboardSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen ? (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`edulearn-sidebar ${isCollapsed ? "edulearn-sidebar--collapsed" : ""} ${
          isMobileOpen ? "edulearn-sidebar--mobile-open" : ""
        }`}
        aria-label="Navigation Menu"
      >
        {/* Brand Header */}
        <div className="edulearn-sidebar__header">
          <Link
            to="/dashboard"
            className="edulearn-sidebar__brand"
            onClick={onCloseMobile}
          >
            <BrandLogo size={32} />
            {!isCollapsed ? (
              <span className="edulearn-sidebar__brand-name">EduLearn</span>
            ) : null}
          </Link>

          <button
            type="button"
            className="edulearn-sidebar__toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              {isCollapsed ? (
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              ) : (
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              )}
            </svg>
          </button>
        </div>

        {/* Primary Role-Aware Navigation Links */}
        <nav className="edulearn-sidebar__nav" aria-label="Primary Navigation">
          {!isCollapsed ? (
            <span className="edulearn-sidebar__section-title">Main Menu</span>
          ) : null}

          {items.map((item) => {
            const icon = getIconForRoute(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `edulearn-sidebar__link ${isActive ? "active" : ""}`
                }
                title={isCollapsed ? item.label : undefined}
                onClick={onCloseMobile}
              >
                <span
                  className="edulearn-sidebar__link-icon"
                  aria-hidden="true"
                >
                  {icon}
                </span>
                {!isCollapsed ? (
                  <span className="edulearn-sidebar__link-label">
                    {item.label}
                  </span>
                ) : null}
              </NavLink>
            );
          })}

          {/* EduLearn Auxiliary Navigation Items (matching reference image) */}
          {!isCollapsed ? (
            <span className="edulearn-sidebar__section-title">
              Communication
            </span>
          ) : null}

          <a
            href="#mailbox"
            className="edulearn-sidebar__link"
            title={isCollapsed ? "Mailbox" : undefined}
            onClick={(e) => e.preventDefault()}
          >
            <span className="edulearn-sidebar__link-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </span>
            {!isCollapsed ? (
              <span className="edulearn-sidebar__link-label">Mailbox</span>
            ) : null}
          </a>

          <a
            href="#calendar"
            className="edulearn-sidebar__link"
            title={isCollapsed ? "Calendar" : undefined}
            onClick={(e) => e.preventDefault()}
          >
            <span className="edulearn-sidebar__link-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
              </svg>
            </span>
            {!isCollapsed ? (
              <span className="edulearn-sidebar__link-label">Calendar</span>
            ) : null}
          </a>

          <a
            href="#group-chats"
            className="edulearn-sidebar__link"
            title={isCollapsed ? "Group chats" : undefined}
            onClick={(e) => e.preventDefault()}
          >
            <span className="edulearn-sidebar__link-icon" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
              </svg>
            </span>
            {!isCollapsed ? (
              <span className="edulearn-sidebar__link-label">Group chats</span>
            ) : null}
          </a>
        </nav>

        {/* Bottom Sidebar Widget Card (EduLearn "Best Education Admin" / Scholars) */}
        {!isCollapsed ? (
          <div className="edulearn-sidebar__card" aria-hidden="true">
            <div className="edulearn-sidebar__card-art">
              <svg viewBox="0 0 160 90" width="100%" height="75">
                <circle cx="80" cy="45" r="38" fill="#dbeafe" />
                <circle cx="45" cy="50" r="12" fill="#fed7aa" />
                <circle cx="80" cy="42" r="15" fill="#fbcfe8" />
                <circle cx="115" cy="50" r="12" fill="#bbf7d0" />
                {/* Cute student team silhouettes */}
                <path d="M35 78c0-5 5-9 10-9s10 4 10 9" fill="#f97316" />
                <path d="M68 80c0-7 6-12 12-12s12 5 12 12" fill="#0284c7" />
                <path d="M105 78c0-5 5-9 10-9s10 4 10 9" fill="#10b981" />
              </svg>
            </div>
            <span className="edulearn-sidebar__card-title">
              Best Education Admin
            </span>
          </div>
        ) : null}
      </aside>
    </>
  );
}
