import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/useAuth";
import { normalizeRole } from "../../auth/roles";
import { ThemeToggle } from "../ThemeToggle";

interface DashboardTopbarProps {
  onToggleSidebar: () => void;
}

export function DashboardTopbar({ onToggleSidebar }: DashboardTopbarProps) {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "User";

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "U";

  return (
    <header className="edulearn-topbar">
      {/* Left: Hamburger & Search */}
      <div className="edulearn-topbar__left">
        <button
          type="button"
          className="edulearn-topbar__toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle navigation menu"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>

        {/* Global Search Bar */}
        <div className="edulearn-topbar__search">
          <svg
            className="edulearn-topbar__search-icon"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="search"
            placeholder="Search courses, mentors, lessons..."
            className="edulearn-topbar__search-input"
            aria-label="Search dashboard"
          />
        </div>
      </div>

      {/* Right: Quick Actions, Theme, Notifications, Profile */}
      <div className="edulearn-topbar__right">
        {/* Theme Toggle (Night/Day icon) */}
        <ThemeToggle className="edulearn-topbar__icon-btn" />

        {/* Notification Bell with Badge */}
        <button
          type="button"
          className="edulearn-topbar__icon-btn"
          title="Notifications"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="edulearn-topbar__badge" aria-hidden="true">
            3
          </span>
        </button>

        {/* Messages / Chat Bubble */}
        <button
          type="button"
          className="edulearn-topbar__icon-btn"
          title="Messages"
          aria-label="Messages"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          className="edulearn-topbar__icon-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            {isFullscreen ? (
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            ) : (
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            )}
          </svg>
        </button>

        {/* User Profile Pill & Actions */}
        <div className="edulearn-topbar__user-wrapper">
          <button
            type="button"
            className="edulearn-topbar__user-pill"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="edulearn-topbar__avatar" aria-hidden="true">
              {initials}
            </div>

            <div className="edulearn-topbar__user-info">
              <span className="edulearn-topbar__user-name">{displayName}</span>
              {roles.length > 0 ? (
                <span className="edulearn-topbar__user-role">
                  {roles.map((r) => normalizeRole(r)).join(", ")}
                </span>
              ) : null}
            </div>

            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </button>

          {profileDropdownOpen ? (
            <div className="edulearn-topbar__dropdown">
              <div className="edulearn-topbar__dropdown-header">
                <strong>{displayName}</strong>
                <span className="edulearn-topbar__dropdown-email">
                  {user?.email}
                </span>
                {roles.length > 0 ? (
                  <span className="badge badge--primary">
                    {roles.map((r) => normalizeRole(r)).join(", ")}
                  </span>
                ) : null}
              </div>

              <div className="edulearn-topbar__dropdown-divider" />

              <button
                type="button"
                className="button button--ghost button--block button--danger"
                onClick={handleLogout}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                <span>Log out</span>
              </button>
            </div>
          ) : null}

          {/* Direct Log out button always rendered for accessible queries and quick access */}
          <button
            type="button"
            className="button button--ghost edulearn-topbar__logout-direct"
            onClick={handleLogout}
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
