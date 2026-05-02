import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  KNOWN_KEYS,
  downloadExport,
  exportAll,
  exportFilename,
  importAll,
} from "../platform/userdata.js";
import {
  THEMES,
  applyTheme,
  loadSavedTheme,
  DEFAULT_THEME,
  type ThemeId,
} from "../platform/themes.js";
import {
  applyLightMode,
  isLightMode,
  loadSavedLightMode,
  LIGHT_STORAGE_KEY,
} from "../platform/lightMode.js";
import { LS_SOUND_ON } from "../platform/sounds.js";
import { useToast } from "../platform/ui/Toast.js";
import { t } from "../platform/i18n.js";
import "./SettingsPage.css";

type CardBack = "classic-blue" | "red-weave" | "plain";
type Animations = "full" | "reduced" | "off";
type CardFont = "serif" | "modern";

const LS_CARD_BACK = "cards-card-back";
const LS_SOUND = LS_SOUND_ON; // "cards-sound-on"
const LS_SOUND_LEGACY = "cards-sound-enabled";
const LS_ANIMATIONS = "cards-animations";
const LS_CARD_FONT = "cards-card-font";
const LS_VOLUME = "cards-sound-volume";
const LS_AUTO_MOVE = "cards-auto-move";
const LS_HINT_COUNT = "cards-hint-count";
const LS_BG_THEME = "cards-bg-theme";

const APPEARANCE_KEYS = [
  LS_BG_THEME,
  LS_CARD_BACK,
  LIGHT_STORAGE_KEY,
  LS_CARD_FONT,
];
const AUDIO_KEYS = [LS_SOUND, LS_SOUND_LEGACY, LS_VOLUME];
const GAMEPLAY_KEYS = [LS_ANIMATIONS, LS_AUTO_MOVE, LS_HINT_COUNT];

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
  if (typeof localStorage === "undefined") return 0.8;
  const raw = localStorage.getItem(LS_VOLUME);
  const n = raw === null ? NaN : Number(raw);
  if (!Number.isFinite(n)) return 0.8;
  return Math.min(1, Math.max(0, n));
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
  const [theme, setTheme] = useState<ThemeId>(() => loadSavedTheme());
  const [light, setLight] = useState<boolean>(() =>
    typeof document === "undefined" ? loadSavedLightMode() : isLightMode(),
  );
  const [cardBack, setCardBack] = useState<CardBack>(readCardBack);
  const [cardFont, setCardFont] = useState<CardFont>(readCardFont);
  const [sound, setSound] = useState<boolean>(readSound);
  const [volume, setVolume] = useState<number>(readVolume);
  const [animations, setAnimations] = useState<Animations>(readAnimations);
  const [autoMove, setAutoMove] = useState<boolean>(readAutoMove);
  const [hintCount, setHintCount] = useState<number>(readHintCount);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  function refreshFromStorage() {
    setTheme(loadSavedTheme());
    setLight(loadSavedLightMode());
    setCardBack(readCardBack());
    setCardFont(readCardFont());
    setSound(readSound());
    setVolume(readVolume());
    setAnimations(readAnimations());
    setAutoMove(readAutoMove());
    setHintCount(readHintCount());
    applyCardBack(readCardBack());
    applyAnimations(readAnimations());
    applyCardFont(readCardFont());
    applyTheme(loadSavedTheme());
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
      refreshFromStorage();
    } catch (err) {
      useToast.getState().push("error", "Import failed: " + (err as Error).message);
    }
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
    setCardBack("classic-blue");
    setCardFont("modern");
    setLight(loadSavedLightMode());
    applyTheme(DEFAULT_THEME);
    applyCardBack("classic-blue");
    applyCardFont("modern");
    applyLightMode(loadSavedLightMode());
  }
  function resetAudio() {
    clearKeys(AUDIO_KEYS);
    setSound(true);
    setVolume(0.8);
  }
  function resetGameplay() {
    clearKeys(GAMEPLAY_KEYS);
    setAnimations("full");
    setAutoMove(true);
    setHintCount(3);
    applyAnimations("full");
  }

  // Persist + side-effects.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
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

  return (
    <div className="settings-page" data-testid="settings-page">
      <header className="settings-header">
        <h1>{t("settings.title")}</h1>
        <p className="settings-subtitle">
          Customize how the table looks and feels. Changes save automatically.
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
          <label className="settings-field-label">Background theme</label>
          <div className="settings-row" role="radiogroup" aria-label="Background theme">
            {THEMES.map((th) => (
              <button
                key={th.id}
                type="button"
                role="radio"
                aria-checked={theme === th.id}
                className={`theme-chip${theme === th.id ? " is-selected" : ""}`}
                onClick={() => setTheme(th.id)}
                data-testid={`settings-theme-${th.id}`}
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
          </div>
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
            Volume <span className="settings-meta">{Math.round(volume * 100)}%</span>
          </label>
          <input
            id="settings-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            disabled={!sound}
            className="settings-range"
            data-testid="settings-volume"
          />
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
      </section>
    </div>
  );
}

// Test-only helper: build the export blob synchronously without DOM side
// effects. Re-exported so tests can verify the export shape.
export function _buildExportSnapshot(): ReturnType<typeof exportAll> {
  return exportAll();
}
