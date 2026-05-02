import { useEffect, useRef, useState, useCallback } from "react";
import {
  THEMES,
  applyTheme,
  applyCustomTheme,
  applySavedTheme,
  loadSavedThemeChoice,
  loadCustomTheme,
  previewTheme,
  CUSTOM_THEME_ID,
  DEFAULT_THEME,
  type ThemeId,
  type ThemeChoice,
  type CustomThemeConfig,
} from "../themes.js";
import { Skeleton } from "../Skeleton.js";
import { emitSparkles } from "../Sparkles.js";
import { useFocusTrap } from "../useFocusTrap.js";
import { t } from "../i18n.js";
import { track } from "../analytics.js";
import "./ThemePicker.css";

/**
 * Header theme/background picker.
 *
 * Renders a small palette button. Clicking opens a popover grid of swatches.
 * Hovering a swatch temporarily applies its CSS variables to :root for a
 * live preview (without persisting); leaving the swatch reverts to the
 * saved theme. Selecting a swatch applies + persists via `applyTheme()`.
 *
 * The trailing "Custom" entry reveals a color input that drives the custom
 * theme (persisted as `cards-bg-theme=custom` plus
 * `cards-theme-custom={accent:"#..."}`).
 */
export default function ThemePicker(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeChoice>(() => loadSavedThemeChoice());
  const [custom, setCustom] = useState<CustomThemeConfig>(() => loadCustomTheme());
  // While `priming` is true the popover renders skeleton swatches instead
  // of the real grid — gives the popover a tactile "warming up" feel
  // that matches the rest of the app's loading states. Briefly true on
  // every open and then cleared on the next animation frame / short timer.
  const [priming, setPriming] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Trap focus inside the open popover for keyboard navigation parity
  // with other modal-style surfaces (cheat sheet, FamilyPicker, etc.).
  useFocusTrap(popoverRef, open);

  // Prime the popover with a skeleton on each open so the swatch grid
  // animates in instead of slamming into place. ~120ms is short enough to
  // feel snappy but long enough to register.
  useEffect(() => {
    if (!open) return;
    setPriming(true);
    const id = setTimeout(() => setPriming(false), 120);
    return () => clearTimeout(id);
  }, [open]);

  // Close on outside click / Escape. Also revert any in-flight preview.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        applySavedTheme();
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        applySavedTheme();
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

  // Stamp `cards-themes-tried` whenever the user commits a theme.
  // Powers the "Theme Hopper" achievement (try all 10 themes). We dedupe
  // by id and tolerate corrupt blobs by starting fresh.
  const stampTried = useCallback((id: string) => {
    try {
      if (typeof localStorage === "undefined") return;
      const raw = localStorage.getItem("cards-themes-tried");
      let arr: string[] = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) arr = parsed.filter((x): x is string => typeof x === "string");
        } catch {
          /* corrupt — start fresh */
        }
      }
      if (!arr.includes(id)) {
        arr.push(id);
        localStorage.setItem("cards-themes-tried", JSON.stringify(arr));
      }
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const select = useCallback((id: ThemeId) => {
    applyTheme(id);
    setActive(id);
    stampTried(id);
    setOpen(false);
    buttonRef.current?.focus();
    track("theme.change", { theme: id });
  }, [stampTried]);

  const selectCustom = useCallback((cfg: CustomThemeConfig) => {
    applyCustomTheme(cfg);
    setActive(CUSTOM_THEME_ID);
    setCustom(cfg);
    stampTried(CUSTOM_THEME_ID);
    track("theme.change", { theme: CUSTOM_THEME_ID, accent: cfg.accent });
  }, [stampTried]);

  // Hover-preview: temporarily apply theme variables without persisting.
  const hoverPreview = useCallback((id: ThemeId) => {
    previewTheme(id);
  }, []);
  const hoverPreviewCustom = useCallback(() => {
    previewTheme(DEFAULT_THEME, custom.accent);
  }, [custom.accent]);
  const revertPreview = useCallback(() => {
    applySavedTheme();
  }, []);

  return (
    <div ref={rootRef} className="theme-picker" onMouseLeave={revertPreview}>
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
        <span className="theme-picker-label">{t("theme.label")}</span>
      </button>

      {open && (
        <div
          className="theme-picker-popover"
          role="dialog"
          aria-label="Background themes"
          ref={popoverRef}
          tabIndex={-1}
        >
          <div className="theme-picker-title">{t("theme.background")}</div>
          {priming && (
            <div
              className="theme-picker-grid theme-picker-grid--skeleton"
              aria-hidden="true"
              data-testid="theme-picker-skeleton"
            >
              {THEMES.map((t) => (
                <div key={`sk-${t.id}`} className="theme-swatch theme-swatch--skeleton">
                  <Skeleton variant="circle" width={36} height={36} />
                  <Skeleton variant="text-line" width={48} />
                </div>
              ))}
            </div>
          )}
          <div
            className={`theme-picker-grid${priming ? " is-priming" : ""}`}
            role="radiogroup"
            aria-label="Background themes"
            onMouseLeave={revertPreview}
          >
            {THEMES.map((th) => {
              const selected = active === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`theme-swatch${selected ? " is-selected" : ""}`}
                  data-testid={`theme-row-${th.id}`}
                  onMouseEnter={() => hoverPreview(th.id)}
                  onFocus={() => hoverPreview(th.id)}
                  onBlur={revertPreview}
                  onClick={(e) => {
                    emitSparkles(e.clientX, e.clientY);
                    select(th.id);
                  }}
                >
                  <span
                    className="theme-swatch-color"
                    style={{ background: th.swatch }}
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
                  <span className="theme-swatch-label">{th.label}</span>
                </button>
              );
            })}

            {/* Custom-theme entry: same shape as the canonical swatches, but
                clicking commits the custom theme and reveals a color input
                so the user can dial in their accent. */}
            <button
              type="button"
              role="radio"
              aria-checked={active === CUSTOM_THEME_ID}
              className={`theme-swatch${active === CUSTOM_THEME_ID ? " is-selected" : ""}`}
              data-testid="theme-row-custom"
              onMouseEnter={hoverPreviewCustom}
              onFocus={hoverPreviewCustom}
              onBlur={revertPreview}
              onClick={(e) => {
                emitSparkles(e.clientX, e.clientY);
                selectCustom(custom);
              }}
            >
              <span
                className="theme-swatch-color theme-swatch-color--custom"
                style={{
                  background: `conic-gradient(from 0deg, ${custom.accent}, #f87171, #fbbf24, #34d399, #60a5fa, ${custom.accent})`,
                }}
                aria-hidden="true"
              >
                {active === CUSTOM_THEME_ID && (
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
              <span className="theme-swatch-label">Custom</span>
            </button>
          </div>

          {active === CUSTOM_THEME_ID && (
            <div className="theme-picker-custom" data-testid="theme-picker-custom">
              <label className="theme-picker-custom-label">
                <span>Accent</span>
                <input
                  type="color"
                  value={custom.accent}
                  onChange={(e) => {
                    const next = { ...custom, accent: e.target.value };
                    selectCustom(next);
                  }}
                  data-testid="theme-custom-accent"
                  aria-label="Custom accent color"
                />
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
