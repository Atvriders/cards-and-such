import { useCallback, useEffect, useState } from "react";
import {
  applyLightMode,
  isLightMode,
  loadSavedLightMode,
} from "../lightMode.js";
import "./LightModeToggle.css";

/**
 * Header light/dark toggle button.
 *
 * Renders a sun/moon glyph that flips the global `:root[data-light]`
 * attribute via `applyLightMode()` (which also persists the choice). Pairs
 * with the existing ThemePicker — themes change the felt/background, this
 * toggle changes the global token palette (light vs dark surfaces).
 */
export default function LightModeToggle(): JSX.Element {
  const [light, setLight] = useState<boolean>(() =>
    typeof document === "undefined" ? loadSavedLightMode() : isLightMode(),
  );

  // Keep state in sync if the attribute is changed elsewhere (e.g. boot
  // sequence ran after this component already constructed in tests).
  useEffect(() => {
    setLight(isLightMode());
  }, []);

  const toggle = useCallback(() => {
    const next = !light;
    applyLightMode(next);
    setLight(next);
  }, [light]);

  return (
    <button
      type="button"
      className={`light-toggle${light ? " is-light" : ""}`}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      aria-pressed={light}
      title={light ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggle}
    >
      {light ? (
        // Moon — currently in light mode, click to go dark.
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      ) : (
        // Sun — currently in dark mode, click to go light.
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
