import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  KNOWN_KEYS,
  clearAllFavorites,
  clearAllRatings,
  downloadExport,
  exportAll,
  exportFilename,
  importAll,
} from "../platform/userdata.js";
import {
  THEMES,
  applyTheme,
  applyCustomTheme,
  applySavedTheme,
  loadCustomTheme,
  loadSavedThemeChoice,
  previewTheme,
  CUSTOM_THEME_ID,
  CUSTOM_STORAGE_KEY,
  DEFAULT_CUSTOM,
  DEFAULT_THEME,
  type ThemeChoice,
  type CustomThemeConfig,
} from "../platform/themes.js";
import {
  applyLightMode,
  isLightMode,
  loadSavedLightMode,
  LIGHT_STORAGE_KEY,
} from "../platform/lightMode.js";
import {
  LS_SOUND_ON,
  LS_SOUND_VOLUME,
  LS_MUTE_ON_HIDDEN,
  DEFAULT_VOLUME_PERCENT,
} from "../platform/sounds.js";
import {
  isMockLeaderboardEnabled,
  setMockLeaderboardEnabled,
} from "../platform/leaderboardClient.js";
import { useToast } from "../platform/ui/Toast.js";
import { t } from "../platform/i18n.js";
import { resetWelcomeTutorial, setCoachmarkPending } from "../platform/tutorials.js";
import "./SettingsPage.css";

type CardBack = "classic-blue" | "red-weave" | "plain";
type Animations = "full" | "reduced" | "off";
type CardFont = "serif" | "modern";

const LS_CARD_BACK = "cards-card-back";
const LS_SOUND = LS_SOUND_ON; // "cards-sound-on"
const LS_SOUND_LEGACY = "cards-sound-enabled";
const LS_ANIMATIONS = "cards-animations";
const LS_CARD_FONT = "cards-card-font";
const LS_VOLUME = LS_SOUND_VOLUME;
const LS_MUTE_HIDDEN = LS_MUTE_ON_HIDDEN;
const LS_AUTO_MOVE = "cards-auto-move";
const LS_HINT_COUNT = "cards-hint-count";
const LS_HINTS_ENABLED = "cards-hints-enabled";
const LS_SHOW_UNDO_COUNT = "cards-show-undo-count";
const LS_BG_THEME = "cards-bg-theme";

const APPEARANCE_KEYS = [
  LS_BG_THEME,
  CUSTOM_STORAGE_KEY,
  LS_CARD_BACK,
  LIGHT_STORAGE_KEY,
  LS_CARD_FONT,
];
const AUDIO_KEYS = [LS_SOUND, LS_SOUND_LEGACY, LS_VOLUME, LS_MUTE_HIDDEN];
const GAMEPLAY_KEYS = [LS_ANIMATIONS, LS_AUTO_MOVE, LS_HINT_COUNT, LS_HINTS_ENABLED, LS_SHOW_UNDO_COUNT];

const CARD_BACKS: { id: CardBack; label: string; preview: string }[] = [
  {
    id: "classic-blue",
    label: "Classic Blue Weave",
    preview:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "radial-gradient(circle at 50% 50%, #5b59d9 0%, #3b3aa3 78%)",
  },
  {
    id: "red-weave",
    label: "Red Weave",
    preview:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "radial-gradient(circle at 50% 50%, #d44848 0%, #8a1f1f 78%)",
  },
  {
    id: "plain",
    label: "Plain",
    preview: "linear-gradient(180deg, #2a2f45 0%, #1a1d2c 100%)",
  },
];

function readCardBack(): CardBack {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_CARD_BACK)) as CardBack | null;
  return v === "red-weave" || v === "plain" || v === "classic-blue" ? v : "classic-blue";
}
function readSound(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem(LS_SOUND);
  if (v !== null) return v === "true";
  const legacy = localStorage.getItem(LS_SOUND_LEGACY);
  return legacy === null ? true : legacy === "true";
}
function readVolume(): number {
  // Stored on the 0..100 integer scale; tolerate the legacy 0..1 floats.
  if (typeof localStorage === "undefined") return DEFAULT_VOLUME_PERCENT;
  const raw = localStorage.getItem(LS_VOLUME);
  if (raw === null) return DEFAULT_VOLUME_PERCENT;
  const n = Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_VOLUME_PERCENT;
  const pct = n > 0 && n <= 1 ? n * 100 : n;
  return Math.min(100, Math.max(0, Math.round(pct)));
}
function readMuteOnHidden(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem(LS_MUTE_HIDDEN);
  return v === null ? true : v === "true";
}
function readAnimations(): Animations {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_ANIMATIONS)) as Animations | null;
  return v === "reduced" || v === "off" || v === "full" ? v : "full";
}
function readCardFont(): CardFont {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_CARD_FONT)) as CardFont | null;
  return v === "serif" || v === "modern" ? v : "modern";
}
function readAutoMove(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem(LS_AUTO_MOVE);
  return v === null ? true : v === "true";
}
function readHintCount(): number {
  if (typeof localStorage === "undefined") return 3;
  const raw = localStorage.getItem(LS_HINT_COUNT);
  const n = raw === null ? NaN : Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 3;
  return Math.min(10, Math.max(0, n));
}
function readHintsEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  const v = localStorage.getItem(LS_HINTS_ENABLED);
  return v === null ? true : v === "true";
}
function readShowUndoCount(): boolean {
  if (typeof localStorage === "undefined") return false;
  const v = localStorage.getItem(LS_SHOW_UNDO_COUNT);
  return v === "true";
}

export function applyCardBack(id: CardBack): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-card-back", id);
}
export function applyAnimations(mode: Animations): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-animations", mode);
}
export function applyCardFont(font: CardFont): void {
  if (typeof document !== "undefined") document.documentElement.setAttribute("data-card-font", font);
}

/** Read all preferences from localStorage and apply to <html>. Call once at app start. */
export function applySavedPreferences(): void {
  applyCardBack(readCardBack());
  applyAnimations(readAnimations());
  applyCardFont(readCardFont());
}

function clearKeys(keys: readonly string[]): void {
  if (typeof localStorage === "undefined") return;
  for (const k of keys) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
}

export default function SettingsPage(): JSX.Element {
  const [theme, setTheme] = useState<ThemeChoice>(() => loadSavedThemeChoice());
  const [customTheme, setCustomTheme] = useState<CustomThemeConfig>(() => loadCustomTheme());
  const [light, setLight] = useState<boolean>(() =>
    typeof document === "undefined" ? loadSavedLightMode() : isLightMode(),
  );
  const [cardBack, setCardBack] = useState<CardBack>(readCardBack);
  const [cardFont, setCardFont] = useState<CardFont>(readCardFont);
  const [sound, setSound] = useState<boolean>(readSound);
  const [volume, setVolume] = useState<number>(readVolume);
  const [muteOnHidden, setMuteOnHidden] = useState<boolean>(readMuteOnHidden);
  const [animations, setAnimations] = useState<Animations>(readAnimations);
  const [autoMove, setAutoMove] = useState<boolean>(readAutoMove);
  const [hintCount, setHintCount] = useState<number>(readHintCount);
  const [hintsEnabled, setHintsEnabled] = useState<boolean>(readHintsEnabled);
  const [showUndoCount, setShowUndoCount] = useState<boolean>(readShowUndoCount);
  const [mockLeaderboard, setMockLeaderboard] = useState<boolean>(isMockLeaderboardEnabled);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  function refreshFromStorage() {
    setTheme(loadSavedThemeChoice());
    setCustomTheme(loadCustomTheme());
    setLight(loadSavedLightMode());
    setCardBack(readCardBack());
    setCardFont(readCardFont());
    setSound(readSound());
    setVolume(readVolume());
    setMuteOnHidden(readMuteOnHidden());
    setAnimations(readAnimations());
    setAutoMove(readAutoMove());
    setHintCount(readHintCount());
    setHintsEnabled(readHintsEnabled());
    setShowUndoCount(readShowUndoCount());
    applyCardBack(readCardBack());
    applyAnimations(readAnimations());
    applyCardFont(readCardFont());
    applySavedTheme();
    applyLightMode(loadSavedLightMode());
  }

  function handleExport() {
    try {
      downloadExport();
      useToast.getState().push("success", "Exported your data");
    } catch (e) {
      useToast.getState().push("error", "Export failed: " + (e as Error).message);
    }
  }

  function handleImportClick() {
    importInputRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("Import will overwrite existing settings, ratings, and stats with the data in this file. Continue?")) {
      return;
    }
    try {
      const text = await file.text();
      const result = importAll(text);
      if (!result.ok) {
        useToast.getState().push("error", result.error ?? "Import failed");
        return;
      }
      useToast.getState().push(
        "success",
        `Imported ${result.written} key${result.written === 1 ? "" : "s"}` +
          (result.skipped > 0 ? ` (${result.skipped} skipped)` : ""),
      );
      // Stamp the import flag for the "Importer" achievement (v44). Run
      // *after* importAll so an in-blob value can't accidentally clear it.
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("cards-data-imported", "true");
        }
      } catch {
        /* ignore quota / private mode */
      }
      refreshFromStorage();
    } catch (err) {
      useToast.getState().push("error", "Import failed: " + (err as Error).message);
    }
  }

  // Per-key resets — narrower than "Clear all" but still a write, so we
  // confirm. Both fire a toast so the empty-state isn't surprising and
  // avoid `location.reload()` because the lobby already listens to
  // storage events and re-pulls automatically.
  function handleResetRatings() {
    if (!window.confirm("Erase all your star ratings? This can't be undone.")) return;
    clearAllRatings();
    useToast.getState().push("success", "Cleared all ratings");
  }
  function handleResetFavorites() {
    if (!window.confirm("Remove every favorited game? This can't be undone.")) return;
    clearAllFavorites();
    useToast.getState().push("success", "Cleared all favorites");
  }

  function handleClearAll() {
    if (!window.confirm("This will erase all progress. Continue?")) return;
    clearKeys(KNOWN_KEYS);
    useToast.getState().push("success", "Cleared all saved data");
    // Apply defaults visibly, then reload so any in-memory caches reset too.
    refreshFromStorage();
    // Defer reload so toast can render briefly. Wrapped in try/catch since
    // jsdom doesn't implement navigation and will throw.
    if (typeof window !== "undefined" && typeof window.location?.reload === "function") {
      setTimeout(() => {
        try {
          window.location.reload();
        } catch {
          /* test environments may block navigation */
        }
      }, 200);
    }
  }

  // Per-section resets — clear the keys for that section then re-pull.
  function resetAppearance() {
    clearKeys(APPEARANCE_KEYS);
    setTheme(DEFAULT_THEME);
    setCustomTheme({ ...DEFAULT_CUSTOM });
    setCardBack("classic-blue");
    setCardFont("modern");
    setLight(loadSavedLightMode());
    applyTheme(DEFAULT_THEME);
    applyCardBack("classic-blue");
    applyCardFont("modern");
    applyLightMode(loadSavedLightMode());
  }
  // "Reset theme" — narrower than the section reset; only clears the bg
  // theme + custom JSON, leaves card back / light mode / fonts alone.
  function resetTheme() {
    clearKeys([LS_BG_THEME, CUSTOM_STORAGE_KEY]);
    setTheme(DEFAULT_THEME);
    setCustomTheme({ ...DEFAULT_CUSTOM });
    applyTheme(DEFAULT_THEME);
  }
  function resetAudio() {
    clearKeys(AUDIO_KEYS);
    setSound(true);
    setVolume(DEFAULT_VOLUME_PERCENT);
    setMuteOnHidden(true);
  }
  function resetGameplay() {
    clearKeys(GAMEPLAY_KEYS);
    setAnimations("full");
    setAutoMove(true);
    setHintCount(3);
    setHintsEnabled(true);
    setShowUndoCount(false);
    applyAnimations("full");
  }

  // Persist + side-effects.
  useEffect(() => {
    if (theme === CUSTOM_THEME_ID) {
      applyCustomTheme(customTheme);
    } else {
      applyTheme(theme);
    }
  }, [theme, customTheme]);
  useEffect(() => {
    applyLightMode(light);
  }, [light]);
  useEffect(() => {
    localStorage.setItem(LS_CARD_BACK, cardBack);
    applyCardBack(cardBack);
  }, [cardBack]);
  useEffect(() => {
    localStorage.setItem(LS_SOUND, String(sound));
  }, [sound]);
  useEffect(() => {
    localStorage.setItem(LS_VOLUME, String(volume));
  }, [volume]);
  useEffect(() => {
    localStorage.setItem(LS_MUTE_HIDDEN, String(muteOnHidden));
  }, [muteOnHidden]);
  useEffect(() => {
    localStorage.setItem(LS_ANIMATIONS, animations);
    applyAnimations(animations);
  }, [animations]);
  useEffect(() => {
    localStorage.setItem(LS_CARD_FONT, cardFont);
    applyCardFont(cardFont);
  }, [cardFont]);
  useEffect(() => {
    localStorage.setItem(LS_AUTO_MOVE, String(autoMove));
  }, [autoMove]);
  useEffect(() => {
    localStorage.setItem(LS_HINT_COUNT, String(hintCount));
  }, [hintCount]);
  useEffect(() => {
    localStorage.setItem(LS_HINTS_ENABLED, String(hintsEnabled));
  }, [hintsEnabled]);
  useEffect(() => {
    localStorage.setItem(LS_SHOW_UNDO_COUNT, String(showUndoCount));
  }, [showUndoCount]);
  useEffect(() => {
    setMockLeaderboardEnabled(mockLeaderboard);
  }, [mockLeaderboard]);

  return (
    <div className="settings-page" data-testid="settings-page">
      <header className="settings-header">
        <h1>{t("settings.title")}</h1>
        <p className="settings-subtitle">
          Tune the look, sound, and feel — changes save automatically.
          {" "}<Link to="/" className="settings-link">Back to lobby</Link>
        </p>
      </header>

      {/* Appearance ------------------------------------------------------- */}
      <section
        className="settings-card"
        data-testid="settings-section-appearance"
        aria-labelledby="settings-appearance-heading"
      >
        <div className="settings-card-head">
          <div>
            <h2 id="settings-appearance-heading">Appearance</h2>
            <p className="settings-hint">
              Background palette, light/dark, and card visuals.
            </p>
          </div>
          <button
            type="button"
            className="settings-mini-btn"
            onClick={resetAppearance}
            data-testid="settings-reset-appearance"
          >
            Reset
          </button>
        </div>

        <div className="settings-field">
          <label className="settings-field-label">
            Background theme
            <button
              type="button"
              className="settings-link settings-link--inline"
              onClick={resetTheme}
              data-testid="theme-reset"
            >
              Reset theme
            </button>
          </label>
          <div
            className="settings-row"
            role="radiogroup"
            aria-label="Background theme"
            onMouseLeave={() => applySavedTheme()}
          >
            {THEMES.map((th) => (
              <button
                key={th.id}
                type="button"
                role="radio"
                aria-checked={theme === th.id}
                className={`theme-chip${theme === th.id ? " is-selected" : ""}`}
                onClick={() => setTheme(th.id)}
                onMouseEnter={() => previewTheme(th.id)}
                onFocus={() => previewTheme(th.id)}
                onBlur={() => applySavedTheme()}
                data-testid={`theme-row-${th.id}`}
                title={th.label}
              >
                <span
                  className="theme-chip-swatch"
                  style={{ background: th.swatch }}
                  aria-hidden="true"
                />
                <span className="theme-chip-label">{th.label}</span>
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={theme === CUSTOM_THEME_ID}
              className={`theme-chip${theme === CUSTOM_THEME_ID ? " is-selected" : ""}`}
              onClick={() => setTheme(CUSTOM_THEME_ID)}
              onMouseEnter={() => previewTheme(DEFAULT_THEME, customTheme.accent)}
              onFocus={() => previewTheme(DEFAULT_THEME, customTheme.accent)}
              onBlur={() => applySavedTheme()}
              data-testid="theme-row-custom"
              title="Custom"
            >
              <span
                className="theme-chip-swatch"
                style={{
                  background: `conic-gradient(from 0deg, ${customTheme.accent}, #f87171, #fbbf24, #34d399, #60a5fa, ${customTheme.accent})`,
                }}
                aria-hidden="true"
              />
              <span className="theme-chip-label">Custom</span>
            </button>
          </div>
          {theme === CUSTOM_THEME_ID && (
            <div className="settings-row" data-testid="theme-custom-controls">
              <label className="settings-field-label settings-field-label--inline">
                Accent color
                <input
                  type="color"
                  value={customTheme.accent}
                  onChange={(e) => {
                    const next = { ...customTheme, accent: e.target.value };
                    setCustomTheme(next);
                  }}
                  data-testid="theme-custom-accent"
                  aria-label="Custom accent color"
                  className="settings-color"
                />
              </label>
            </div>
          )}
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Light mode</div>
            <p className="settings-hint">Flip the global palette to a light surface.</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={light}
              onChange={(e) => setLight(e.target.checked)}
              data-testid="settings-light-mode"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">{light ? "On" : "Off"}</span>
          </label>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field">
          <label className="settings-field-label">Card back</label>
          <div className="settings-row" role="radiogroup" aria-label="Card-back style">
            {CARD_BACKS.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={cardBack === b.id}
                className={`card-back-swatch${cardBack === b.id ? " is-selected" : ""}`}
                onClick={() => setCardBack(b.id)}
                data-testid={`card-back-${b.id}`}
              >
                <span className="card-back-preview" style={{ background: b.preview }} aria-hidden="true" />
                <span>{b.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field">
          <label className="settings-field-label">Card font</label>
          <div className="settings-row" role="radiogroup" aria-label="Card font">
            <button
              type="button"
              role="radio"
              aria-checked={cardFont === "serif"}
              className={`pill${cardFont === "serif" ? " is-selected" : ""}`}
              onClick={() => setCardFont("serif")}
              data-testid="card-font-serif"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Serif (Georgia)
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={cardFont === "modern"}
              className={`pill${cardFont === "modern" ? " is-selected" : ""}`}
              onClick={() => setCardFont("modern")}
              data-testid="card-font-modern"
              style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            >
              Modern (Inter)
            </button>
          </div>
        </div>
      </section>

      {/* Audio ----------------------------------------------------------- */}
      <section
        className="settings-card"
        data-testid="settings-section-audio"
        aria-labelledby="settings-audio-heading"
      >
        <div className="settings-card-head">
          <div>
            <h2 id="settings-audio-heading">Audio</h2>
            <p className="settings-hint">Sound effects and volume.</p>
          </div>
          <button
            type="button"
            className="settings-mini-btn"
            onClick={resetAudio}
            data-testid="settings-reset-audio"
          >
            Reset
          </button>
        </div>

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Sound effects</div>
            <p className="settings-hint">Card flips, dice rolls, win chimes.</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              data-testid="sound-toggle"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">
              {sound ? t("settings.sound.on") : t("settings.sound.off")}
            </span>
          </label>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field">
          <label className="settings-field-label" htmlFor="settings-volume">
            Volume <span className="settings-meta">{volume}%</span>
          </label>
          <input
            id="settings-volume"
            type="range"
            min={0}
            max={100}
            step={1}
            value={volume}
            onChange={(e) => setVolume(Number.parseInt(e.target.value, 10))}
            disabled={!sound}
            className="settings-range"
            data-testid="settings-volume"
          />
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Mute when tab hidden</div>
            <p className="settings-hint">
              Silence sound effects while the browser tab is in the background.
            </p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={muteOnHidden}
              onChange={(e) => setMuteOnHidden(e.target.checked)}
              data-testid="settings-mute-on-hidden"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">{muteOnHidden ? "On" : "Off"}</span>
          </label>
        </div>
      </section>

      {/* Gameplay -------------------------------------------------------- */}
      <section
        className="settings-card"
        data-testid="settings-section-gameplay"
        aria-labelledby="settings-gameplay-heading"
      >
        <div className="settings-card-head">
          <div>
            <h2 id="settings-gameplay-heading">Gameplay</h2>
            <p className="settings-hint">Auto-move, hints, and motion.</p>
          </div>
          <button
            type="button"
            className="settings-mini-btn"
            onClick={resetGameplay}
            data-testid="settings-reset-gameplay"
          >
            Reset
          </button>
        </div>

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Auto-move to foundations</div>
            <p className="settings-hint">Automatically send obvious cards home.</p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={autoMove}
              onChange={(e) => setAutoMove(e.target.checked)}
              data-testid="settings-auto-move"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">{autoMove ? "On" : "Off"}</span>
          </label>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Hints</div>
            <p className="settings-hint">
              Pulse the most plausible next move on supported games.
              Disabling this hides the Hint button entirely.
            </p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={hintsEnabled}
              onChange={(e) => setHintsEnabled(e.target.checked)}
              data-testid="settings-hints-enabled"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">{hintsEnabled ? "On" : "Off"}</span>
          </label>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field">
          <label className="settings-field-label" htmlFor="settings-hint-count">
            Hints per game <span className="settings-meta">{hintCount}</span>
          </label>
          <input
            id="settings-hint-count"
            type="range"
            min={0}
            max={10}
            step={1}
            value={hintCount}
            onChange={(e) => setHintCount(Number.parseInt(e.target.value, 10))}
            className="settings-range"
            data-testid="settings-hint-count"
          />
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Show undo count</div>
            <p className="settings-hint">
              When on, the Undo button label includes the current step count
              (e.g. &quot;Undo (3)&quot;) so you can see how far you can roll back.
            </p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={showUndoCount}
              onChange={(e) => setShowUndoCount(e.target.checked)}
              data-testid="settings-show-undo-count"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">{showUndoCount ? "On" : "Off"}</span>
          </label>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field">
          <label className="settings-field-label">Animations</label>
          <div className="settings-row" role="radiogroup" aria-label="Animations">
            {(["full", "reduced", "off"] as Animations[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={animations === m}
                className={`pill${animations === m ? " is-selected" : ""}`}
                onClick={() => setAnimations(m)}
                data-testid={`animations-${m}`}
              >
                {m === "full" ? "Full" : m === "reduced" ? "Reduced" : "Off"}
              </button>
            ))}
          </div>
          <p className="settings-hint">
            Reduced/off matches the <code>prefers-reduced-motion</code> behavior.
          </p>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Welcome tutorial</div>
            <p className="settings-hint">
              Re-open the four-step intro carousel.
            </p>
          </div>
          <button
            type="button"
            className="settings-mini-btn"
            data-testid="settings-show-tutorial"
            onClick={() => {
              resetWelcomeTutorial();
              window.dispatchEvent(new CustomEvent("cards:open-welcome-tutorial"));
            }}
          >
            Show again
          </button>
        </div>

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Show coachmarks</div>
            <p className="settings-hint">
              Re-arm the lobby Featured-strip hint on your next visit.
            </p>
          </div>
          <button
            type="button"
            className="settings-mini-btn"
            data-testid="settings-show-coachmarks"
            onClick={() => {
              setCoachmarkPending();
            }}
          >
            Show again
          </button>
        </div>
      </section>

      {/* Data ------------------------------------------------------------ */}
      <section
        className="settings-card settings-card--data"
        data-testid="settings-section-data"
        aria-labelledby="settings-data-heading"
      >
        <div className="settings-card-head">
          <div>
            <h2 id="settings-data-heading">Your data</h2>
            <p className="settings-hint">
              Export bundles every <code>cards-</code> key (settings, ratings,
              stats, recents) into a JSON file. Import restores them. Clear
              wipes everything from this device.
            </p>
          </div>
        </div>

        <div className="settings-row settings-row--actions">
          <button
            type="button"
            className="settings-action"
            onClick={handleExport}
            data-testid="settings-export"
          >
            <span className="settings-action-title">Export all</span>
            <span className="settings-action-meta">
              {`${exportFilename()}`}
            </span>
          </button>
          <button
            type="button"
            className="settings-action"
            onClick={handleImportClick}
            data-testid="settings-import"
          >
            <span className="settings-action-title">Import</span>
            <span className="settings-action-meta">From a JSON backup</span>
          </button>
          <button
            type="button"
            className="settings-action settings-action--danger"
            onClick={handleClearAll}
            data-testid="settings-clear"
          >
            <span className="settings-action-title">Clear all</span>
            <span className="settings-action-meta">Erase progress on this device</span>
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={handleImportFile}
            data-testid="settings-import-input"
          />
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field settings-field--row">
          <div>
            <div className="settings-field-label">Use mock leaderboard</div>
            <p className="settings-hint">
              Show 5 simulated other players on the Top Players tab. There's
              no global leaderboard backend yet — this is a developer/preview
              toggle for the UI. Off = just your own scores.
            </p>
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={mockLeaderboard}
              onChange={(e) => setMockLeaderboard(e.target.checked)}
              data-testid="settings-mock-leaderboard"
              aria-label="Use mock leaderboard"
            />
            <span className="settings-toggle-track" aria-hidden="true">
              <span className="settings-toggle-thumb" />
            </span>
            <span className="settings-toggle-label">{mockLeaderboard ? "On" : "Off"}</span>
          </label>
        </div>

        {/* Mini-actions: narrower wipes that don't kick a full reload.
            Useful when a user wants to start fresh with rating curation
            but keep their stats / settings intact. */}
        <div
          className="settings-row settings-mini-row"
          data-testid="settings-data-mini"
        >
          <button
            type="button"
            className="settings-mini-btn"
            onClick={handleResetRatings}
            data-testid="settings-reset-ratings"
          >
            Reset ratings only
          </button>
          <button
            type="button"
            className="settings-mini-btn"
            onClick={handleResetFavorites}
            data-testid="settings-reset-favorites"
          >
            Reset favorites only
          </button>
        </div>
      </section>
    </div>
  );
}

// Test-only helper: build the export blob synchronously without DOM side
// effects. Re-exported so tests can verify the export shape.
export function _buildExportSnapshot(): ReturnType<typeof exportAll> {
  return exportAll();
}
