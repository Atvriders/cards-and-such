import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import "./App.css";
import { applySavedTheme } from "./platform/themes.js";
import { applySavedLightMode } from "./platform/lightMode.js";
import { playSound } from "./platform/sounds.js";
import { track } from "./platform/analytics.js";

// Apply the saved (or default) theme as early as possible so the very first
// paint already uses the user's chosen background. Setting CSS variables on
// :root is cheap and doesn't depend on React.
applySavedTheme();

// Apply saved light/dark preference (or honour `prefers-color-scheme: light`
// for first-time visitors) before React mounts so we never flash the wrong
// palette on the initial paint.
applySavedLightMode();

// Local-only telemetry: stamp a boot event so the dev panel shows session start.
track("app.boot", {
  href: typeof location !== "undefined" ? location.pathname : "",
});

// Global click SFX: any .btn-primary or .play-iconbtn anywhere in the tree
// emits a short click tone (gated by the global sound toggle).
if (typeof document !== "undefined") {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      if (target.closest(".btn-primary, .play-iconbtn")) {
        playSound("button-click");
      }
    },
    { capture: true },
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
