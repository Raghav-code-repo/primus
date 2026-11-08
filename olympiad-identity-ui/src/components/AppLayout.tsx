import { Outlet } from 'react-router-dom'

import { Alert } from './Alert'
import { Navbar } from './Navbar'
import {
  configurationIssues,
} from '../config/apiConfig'

export function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        {configurationIssues.length > 0 ? (
          <Alert variant="error" title="The frontend is not configured correctly">
            <ul className="alert__list">
              {configurationIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </Alert>
        ) : null}

        <Outlet />
      </main>
      <footer className="app-footer">
        <p>Olympiad Learning Academy &middot; Identity, Course and Student Services</p>
      </footer>
    </div>
  )
}
