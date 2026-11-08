import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles/index.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/academy.css";
import "./styles/olympiad-banner.css";
import "./styles/dashboard.css";
import "./styles/classroom.css";
import App from "./App.tsx";
import { ThemeProvider } from "./theme/ThemeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
