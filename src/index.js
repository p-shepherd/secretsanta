import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./Routes";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Router>
      <AppRoutes />
    </Router>
  </StrictMode>,
);
