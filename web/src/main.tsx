import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import "./App.css";
import { applyTheme, loadSavedTheme } from "./platform/themes.js";

// Apply the saved (or default) theme as early as possible so the very first
// paint already uses the user's chosen background. Setting CSS variables on
// :root is cheap and doesn't depend on React.
applyTheme(loadSavedTheme());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
