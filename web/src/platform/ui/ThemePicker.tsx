import { useEffect, useRef, useState, useCallback } from "react";
import { THEMES, applyTheme, loadSavedTheme, type ThemeId } from "../themes.js";
import "./ThemePicker.css";

/**
 * Header theme/background picker.
 *
 * Renders a small palette button. Clicking opens a popover grid of swatches.
 * Selecting a swatch applies the theme via `applyTheme()` (which also
 * persists to localStorage). Click-outside / Escape close the popover.
 */
export default function ThemePicker(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeId>(() => loadSavedTheme());
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = useCallback((id: ThemeId) => {
    applyTheme(id);
    setActive(id);
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  return (
    <div ref={rootRef} className="theme-picker">
      <button
        ref={buttonRef}
        type="button"
        className="theme-picker-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Choose background theme"
        title="Background theme"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="theme-picker-icon" aria-hidden="true">
          {/* paint-palette glyph */}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22a10 10 0 1 1 10-10c0 2-1.5 3.5-3.5 3.5H17a2 2 0 0 0-2 2v.5a2 2 0 0 1-3 1.7A4 4 0 0 1 12 22z" />
            <circle cx="7.5" cy="11.5" r="1" fill="currentColor" />
            <circle cx="9.5" cy="7.5" r="1" fill="currentColor" />
            <circle cx="14" cy="6.5" r="1" fill="currentColor" />
            <circle cx="17.5" cy="9.5" r="1" fill="currentColor" />
          </svg>
        </span>
        <span className="theme-picker-label">Theme</span>
      </button>

      {open && (
        <div
          className="theme-picker-popover"
          role="dialog"
          aria-label="Background themes"
        >
          <div className="theme-picker-title">Background</div>
          <div className="theme-picker-grid" role="radiogroup" aria-label="Background themes">
            {THEMES.map((t) => {
              const selected = active === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`theme-swatch${selected ? " is-selected" : ""}`}
                  onClick={() => select(t.id)}
                >
                  <span
                    className="theme-swatch-color"
                    style={{ background: t.swatch }}
                    aria-hidden="true"
                  >
                    {selected && (
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path
                          d="M5 12l4 4 10-10"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="theme-swatch-label">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
