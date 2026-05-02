import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  KNOWN_KEYS,
  clearAllFavorites,
  clearAllHiddenGames,
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
  playSound,
  type SoundName,
} from "../platform/sounds.js";
import {
  isMockLeaderboardEnabled,
  setMockLeaderboardEnabled,
} from "../platform/leaderboardClient.js";
import { useToast } from "../platform/ui/Toast.js";
import { t } from "../platform/i18n.js";
import { resetWelcomeTutorial, setCoachmarkPending } from "../platform/tutorials.js";
import { track, getEvents, clearEvents, type AnalyticsEvent } from "../platform/analytics.js";
import { useStandaloneConfirm } from "../platform/ConfirmDialog.js";
import { highlightMatch } from "../platform/highlight.js";
import "./SettingsPage.css";

type CardBack =
  | "classic-blue"
  | "red-weave"
  | "plain"
  | "bicycle-weave"
  | "solid-emerald"
  | "tartan"
  | "dot-grid"
  | "art-deco"
  | "holographic";
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

// Gallery of selectable card-back designs. Each entry is rendered as a
// preview tile in Settings; selecting one writes `cards-card-back` to
// localStorage and the matching `:root[data-card-back="<id>"]` rule in
// Card.css applies the design site-wide.
//
// Note: classic-blue / red-weave / plain are kept for backwards compat
// (older saves + tests still reference them). The visible gallery shows
// the six new designs called out in the design spec.
const CARD_BACKS: { id: CardBack; label: string; preview: string }[] = [
  {
    id: "bicycle-weave",
    label: "Bicycle Weave",
    preview:
      "repeating-linear-gradient(45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "repeating-linear-gradient(-45deg, rgba(255,255,255,0.10) 0 1px, transparent 1px 8px)," +
      "radial-gradient(circle at 50% 50%, #5b59d9 0%, #3b3aa3 78%)",
  },
  {
    id: "solid-emerald",
    label: "Solid Emerald",
    preview: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
  },
  {
    id: "tartan",
    label: "Tartan",
    preview:
      "repeating-linear-gradient(0deg, rgba(255,255,255,0.10) 0 2px, transparent 2px 10px)," +
      "repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 10px)," +
      "linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)",
  },
  {
    id: "dot-grid",
    label: "Dot Grid",
    preview:
      "radial-gradient(rgba(255,255,255,0.30) 1.2px, transparent 1.6px) 0 0/8px 8px," +
      "linear-gradient(180deg, #1e3a8a 0%, #1e1b4b 100%)",
  },
  {
    id: "art-deco",
    label: "Art Deco",
    preview:
      "repeating-linear-gradient(90deg, rgba(250,204,21,0.55) 0 2px, transparent 2px 8px)," +
      "linear-gradient(180deg, #111827 0%, #1f2937 100%)",
  },
  {
    id: "holographic",
    label: "Holographic",
    preview:
      "linear-gradient(135deg, #f0abfc 0%, #93c5fd 33%, #6ee7b7 66%, #fde68a 100%)",
  },
];

// All ids the runtime accepts (gallery + legacy aliases).
const VALID_CARD_BACKS = new Set<CardBack>([
  "classic-blue",
  "red-weave",
  "plain",
  "bicycle-weave",
  "solid-emerald",
  "tartan",
  "dot-grid",
  "art-deco",
  "holographic",
]);

function readCardBack(): CardBack {
  const v = (typeof localStorage !== "undefined" && localStorage.getItem(LS_CARD_BACK)) as CardBack | null;
  return v && VALID_CARD_BACKS.has(v) ? v : "bicycle-weave";
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
  // Hidden dev panel: surfaces the local-only analytics ring buffer. The
  // toggle starts off — the link itself is small + de-emphasized so casual
  // users never notice it, but power users + maintainers can pop it open
  // to verify behaviour without running the app under devtools.
  const [eventLogOpen, setEventLogOpen] = useState(false);
  const [eventLog, setEventLog] = useState<AnalyticsEvent[]>([]);
  // Hidden dev-tools panel — only mounted in development builds. Vite
  // replaces `import.meta.env.DEV` with a literal at build time so the
  // toggle (and the fault-injection button it gates) tree-shakes out of
  // production bundles entirely.
  const isDevBuild =
    typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV ===
      true;
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const refreshEventLog = () => {
    const all = getEvents();
    // Show only the last 50 — newest last is the natural tail order.
    setEventLog(all.slice(-50));
  };
  const importInputRef = useRef<HTMLInputElement | null>(null);
  // Debounce timer for the volume-preview tone. We don't want to fire one
  // tone per drag event — wait 80ms after the last change to play.
  const volumePreviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Theme-styled confirm dialog — replaces native window.confirm() so
  // every destructive action gets the same keyboard-accessible UX.
  const { showConfirm, dialog: confirmDialog } = useStandaloneConfirm();

  // Search-bar filter: each .settings-field row checks `matchesQuery` on
  // its label and renders `hidden` when there's no substring match. The
  // visible label is wrapped via `labelNode(...)` so the matched span
  // gets the same <mark> highlight used by SearchPage / LobbyPage.
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();
  const matchesQuery = (label: string): boolean =>
    !trimmedQuery || label.toLowerCase().includes(trimmedQuery.toLowerCase());
  const labelNode = (label: string) => highlightMatch(label, trimmedQuery);

  // Dev-only: arm the fault-injection flag and reload. After the reload,
  // visiting /dev/error-test (which we navigate to here) will throw during
  // render, exercising the per-page <ErrorBoundary>. The flag is consumed
  // on read inside DevErrorTestPage so a Reload click on the boundary
  // recovers cleanly.
  function triggerErrorBoundaryTest() {
    if (typeof window === "undefined") return;
    type FlagWindow = Window & { __cardsForceError?: boolean };
    (window as FlagWindow).__cardsForceError = true;
    // Sending the user to the dev route ensures the throw happens even in
    // builds where the lobby/ shell never reads the flag itself.
    try {
      window.location.assign("/dev/error-test");
    } catch {
      window.location.reload();
    }
  }

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
    const ok = await showConfirm({
      title: "Import data?",
      message:
        "Import will overwrite existing settings, ratings, and stats with the data in this file. Continue?",
      confirmLabel: "Import",
      danger: true,
    });
    if (!ok) return;
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
  async function handleResetRatings() {
    const ok = await showConfirm({
      title: "Reset ratings?",
      message: "Erase all your star ratings? This can't be undone.",
      confirmLabel: "Reset ratings",
      danger: true,
    });
    if (!ok) return;
    clearAllRatings();
    useToast.getState().push("success", "Cleared all ratings");
  }
  async function handleResetFavorites() {
    const ok = await showConfirm({
      title: "Reset favorites?",
      message: "Remove every favorited game? This can't be undone.",
      confirmLabel: "Reset favorites",
      danger: true,
    });
    if (!ok) return;
    clearAllFavorites();
    useToast.getState().push("success", "Cleared all favorites");
  }
  // Wipe the cards-hidden-games set so previously-hidden tiles surface
  // again in every lobby filter. Mirrors the LobbyPage's `storage` event
  // listener so the user sees the change immediately on return.
  async function handleShowHidden() {
    const ok = await showConfirm({
      title: "Show all hidden games?",
      message: "Restore every game you've hidden from the lobby? This can't be undone.",
      confirmLabel: "Show all",
      danger: false,
    });
    if (!ok) return;
    clearAllHiddenGames();
    useToast.getState().push("success", "Hidden games restored");
  }

  async function handleClearAll() {
    const ok = await showConfirm({
      title: "Clear all data?",
      message:
        "This will erase all progress, ratings, stats, and settings on this device. This can't be undone.",
      confirmLabel: "Clear all data",
      danger: true,
      requireText: "DELETE",
      requireTextLabel: 'Type "DELETE" to confirm',
    });
    if (!ok) return;
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
    setCardBack("bicycle-weave");
    setCardFont("modern");
    setLight(loadSavedLightMode());
    applyTheme(DEFAULT_THEME);
    applyCardBack("bicycle-weave");
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
  // Skip the very first render of each setting effect — the persistence
  // useEffects fire on mount with the values that were just *read* from
  // storage, not user-driven changes. Only emit setting.change after the
  // first run.
  const settingsHydrated = useRef(false);
  useEffect(() => {
    settingsHydrated.current = true;
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_CARD_BACK, cardBack);
    applyCardBack(cardBack);
    if (settingsHydrated.current) track("setting.change", { key: "cardBack", value: cardBack });
  }, [cardBack]);
  useEffect(() => {
    localStorage.setItem(LS_SOUND, String(sound));
    if (settingsHydrated.current) track("setting.change", { key: "sound", value: sound });
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
    if (settingsHydrated.current) track("setting.change", { key: "animations", value: animations });
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
      {confirmDialog}
      <header className="settings-header">
        <h1>{t("settings.title")}</h1>
        <p className="settings-subtitle">
          Tune the look, sound, and feel — changes save automatically.
          {" "}<Link to="/" className="settings-link">Back to lobby</Link>
        </p>
        <div className="settings-search">
          <input
            type="search"
            className="settings-search-input"
            placeholder="Search settings…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="settings-search-input"
            aria-label="Search settings"
          />
        </div>
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

        <div className="settings-field" hidden={!matchesQuery("Background theme")}>
          <label className="settings-field-label">
            {labelNode("Background theme")}
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
              onMouseEnter={() =>
                previewTheme(DEFAULT_THEME, customTheme.accent, customTheme.bg, customTheme.surface)
              }
              onFocus={() =>
                previewTheme(DEFAULT_THEME, customTheme.accent, customTheme.bg, customTheme.surface)
              }
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
                Background color
                <input
                  type="color"
                  value={customTheme.bg}
                  onChange={(e) => {
                    const next = { ...customTheme, bg: e.target.value };
                    setCustomTheme(next);
                  }}
                  data-testid="theme-custom-bg"
                  aria-label="Custom background color"
                  className="settings-color"
                />
              </label>
              <label className="settings-field-label settings-field-label--inline">
                Surface color
                <input
                  type="color"
                  value={customTheme.surface}
                  onChange={(e) => {
                    const next = { ...customTheme, surface: e.target.value };
                    setCustomTheme(next);
                  }}
                  data-testid="theme-custom-surface"
                  aria-label="Custom surface color"
                  className="settings-color"
                />
              </label>
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

        <div className="settings-field settings-field--row" hidden={!matchesQuery("Light mode")}>
          <div>
            <div className="settings-field-label">{labelNode("Light mode")}</div>
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

        <div className="settings-field" hidden={!matchesQuery("Card back")}>
          <label className="settings-field-label">{labelNode("Card back")}</label>
          <div
            className="settings-row cardback-gallery"
            role="radiogroup"
            aria-label="Card-back style"
            data-testid="cardback-gallery"
          >
            {CARD_BACKS.map((b) => {
              // Map historical aliases to the gallery tile that renders them
              // so legacy saves still show as selected. classic-blue and
              // bicycle-weave share visuals; selecting either highlights the
              // bicycle-weave tile.
              const aliasMatch =
                (b.id === "bicycle-weave" && cardBack === "classic-blue") ||
                (b.id === "solid-emerald" && cardBack === "plain");
              const selected = cardBack === b.id || aliasMatch;
              return (
                <button
                  key={b.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`card-back-swatch${selected ? " is-selected" : ""}`}
                  onClick={() => setCardBack(b.id)}
                  data-testid={`cardback-gallery-${b.id}`}
                >
                  <span
                    className="card-back-preview"
                    style={{ background: b.preview }}
                    aria-hidden="true"
                  />
                  <span>{b.label}</span>
                </button>
              );
            })}
            {/* Hidden legacy buttons keep older test ids (`card-back-<id>`)
                addressable so external snapshots / e2e flows don't break.
                Visually hidden but still focusable for backwards compat. */}
            {(["classic-blue", "red-weave", "plain"] as CardBack[]).map((id) => (
              <button
                key={`legacy-${id}`}
                type="button"
                onClick={() => setCardBack(id)}
                data-testid={`card-back-${id}`}
                className="visually-hidden"
                aria-hidden="true"
                tabIndex={-1}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-divider" role="presentation" />

        <div className="settings-field" hidden={!matchesQuery("Card font")}>
          <label className="settings-field-label">{labelNode("Card font")}</label>
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
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              setVolume(next);
              // Same-tab live update — sounds.ts caches the volume in module
              // scope and the `storage` event doesn't fire in the writing tab.
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("cards:volume-change", { detail: next }),
                );
              }
              // Debounced preview tone so the user can hear the new level
              // without firing one beep per drag tick.
              if (volumePreviewTimerRef.current) {
                clearTimeout(volumePreviewTimerRef.current);
              }
              volumePreviewTimerRef.current = setTimeout(() => {
                volumePreviewTimerRef.current = null;
                playSound("card-place");
              }, 80);
            }}
            disabled={!sound}
            className="settings-range"
            data-testid="settings-volume"
            aria-valuetext={`${volume}%`}
          />
        </div>

        <div className="settings-divider" role="presentation" />

        {/* Per-SFX preview buttons — let the user audition each category.
            Disabled when the master toggle is off so we don't surprise them
            with sound when they've explicitly muted. */}
        <div className="settings-field" data-testid="settings-test-sounds">
          <div className="settings-field-label">Test sounds</div>
          <p className="settings-hint">
            Play a one-shot sample of each effect at the current volume.
          </p>
          <div className="settings-row">
            {(
              [
                { id: "card-deal", label: "Card deal" },
                { id: "card-flip", label: "Card flip" },
                { id: "card-place", label: "Card place" },
                { id: "card-shuffle", label: "Card shuffle" },
                { id: "win", label: "Win" },
                { id: "win-fanfare", label: "Win fanfare" },
              ] as { id: SoundName; label: string }[]
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                className="pill"
                onClick={() => playSound(s.id)}
                disabled={!sound}
                data-testid={`settings-test-${s.id}`}
              >
                {s.label}
              </button>
            ))}
          </div>
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
          <button
            type="button"
            className="settings-mini-btn"
            onClick={handleShowHidden}
            data-testid="settings-show-hidden"
          >
            Show hidden games
          </button>
        </div>

        {/* Hidden dev panel — local-only analytics. Renders a quiet
            text-link that pops a panel showing the most recent ring-buffer
            events. No network, no upload, no remote anything. Strictly a
            debug surface. */}
        <div className="settings-row settings-mini-row">
          <button
            type="button"
            className="settings-link settings-link--inline"
            onClick={() => {
              const next = !eventLogOpen;
              setEventLogOpen(next);
              if (next) refreshEventLog();
            }}
            data-testid="analytics-toggle"
            aria-expanded={eventLogOpen}
          >
            {eventLogOpen ? "Hide event log" : "Show event log"}
          </button>
        </div>

        {/* Hidden dev tools — only mounted in dev builds. Provides a
            fault-injection button for verifying the per-page
            <ErrorBoundary> works in production-like conditions. The
            toggle link is small + de-emphasized to match the analytics
            link above. */}
        {isDevBuild && (
          <>
            <div className="settings-row settings-mini-row">
              <button
                type="button"
                className="settings-link settings-link--inline"
                onClick={() => setDevToolsOpen((v) => !v)}
                data-testid="dev-tools-toggle"
                aria-expanded={devToolsOpen}
              >
                {devToolsOpen ? "Hide dev tools" : "Show dev tools"}
              </button>
            </div>
            {devToolsOpen && (
              <div
                className="settings-event-log"
                data-testid="dev-tools-panel"
                aria-label="Developer tools"
              >
                <p className="settings-hint">
                  Internal diagnostics. Only visible in development builds.
                </p>
                <div className="settings-row settings-mini-row">
                  <button
                    type="button"
                    className="settings-mini-btn"
                    onClick={triggerErrorBoundaryTest}
                    data-testid="dev-trigger-error"
                  >
                    Trigger error boundary test
                  </button>
                  <span className="settings-meta">
                    Sets <code>window.__cardsForceError</code> and navigates to{" "}
                    <code>/dev/error-test</code>; the boundary should catch the
                    throw.
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {eventLogOpen && (
          <div
            className="settings-event-log"
            data-testid="analytics-panel"
            aria-label="Local analytics event log"
          >
            <div className="settings-row settings-mini-row">
              <button
                type="button"
                className="settings-mini-btn"
                onClick={refreshEventLog}
                data-testid="analytics-refresh"
              >
                Refresh
              </button>
              <button
                type="button"
                className="settings-mini-btn"
                onClick={() => {
                  clearEvents();
                  refreshEventLog();
                }}
                data-testid="analytics-clear"
              >
                Clear
              </button>
              <span className="settings-meta">
                {eventLog.length} event{eventLog.length === 1 ? "" : "s"} (local-only, never uploaded)
              </span>
            </div>
            {eventLog.length === 0 ? (
              <p className="settings-hint" data-testid="analytics-empty">
                No events recorded yet on this device.
              </p>
            ) : (
              <ol className="settings-event-list">
                {eventLog.map((evt, idx) => (
                  <li
                    key={`${evt.ts}-${idx}`}
                    className="settings-event-item"
                    data-testid={`analytics-event-${idx}`}
                  >
                    <code>
                      {new Date(evt.ts).toISOString()} — {evt.name}
                      {evt.props ? ` ${JSON.stringify(evt.props)}` : ""}
                    </code>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

// Test-only helper: build the export blob synchronously without DOM side
// effects. Re-exported so tests can verify the export shape.
export function _buildExportSnapshot(): ReturnType<typeof exportAll> {
  return exportAll();
}
