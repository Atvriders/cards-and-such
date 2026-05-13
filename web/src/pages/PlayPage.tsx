import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "../platform/Skeleton.js";
import { GAMES } from "../games/registry.js";
import { SettingsForm } from "../platform/game-plugin/settings.js";
import { defaultsOf, type SettingSchema, type SettingsOf } from "../platform/game-plugin/types.js";
import { submitScore } from "../platform/game-plugin/submitScore.js";
import { playSound, type SoundName } from "../platform/sounds.js";

/**
 * Platform-wide map from common reducer action types to a platform sound.
 * Inferred from a survey of state.ts files across the 4,505-game registry:
 * roll/deal/draw/flip/play/select/submit/move/place/discard/swap/keep/mark/
 * pop/answer/predict are the high-frequency interactive actions. tick
 * (timers) and pure-navigation (next/restart/reset/skip/score/set) are
 * intentionally omitted so the audio doesn't become noise.
 */
/**
 * Categorical theme defaults — applied to the .play-page CSS variables
 * when the plugin doesn't declare its own `themeOverrides`. Keeps every
 * card category visually distinct without per-game design work.
 */
const CATEGORY_THEMES: Record<string, { feltGradient?: string; accent?: string; bgGradient?: string }> = {
  solitaire: {
    feltGradient: "linear-gradient(135deg, #0b3d2e, #1a6c3f)",
    accent: "rgba(74, 222, 128, 0.45)",
  },
  cards: {
    feltGradient: "linear-gradient(135deg, #14213d, #1d3557)",
    accent: "rgba(96, 165, 250, 0.45)",
  },
  dice: {
    feltGradient: "linear-gradient(135deg, #6b3f1a, #8a5a2b 50%, #4a2810)",
    accent: "rgba(217, 119, 6, 0.45)",
  },
  board: {
    feltGradient: "linear-gradient(135deg, #2a1f3d, #3d2a5a)",
    accent: "rgba(167, 139, 250, 0.45)",
  },
  arcade: {
    feltGradient: "linear-gradient(135deg, #2d1424, #571945)",
    accent: "rgba(244, 114, 182, 0.45)",
  },
};

const ACTION_SOUND_MAP: Record<string, SoundName | undefined> = {
  roll: "dice-roll",
  deal: "card-deal",
  draw: "card-deal",
  flip: "card-flip",
  play: "card-place",
  place: "card-place",
  discard: "card-place",
  move: "card-place",
  select: "button-click",
  submit: "button-click",
  pop: "button-click",
  swap: "button-click",
  keep: "button-click",
  mark: "button-click",
  answer: "button-click",
  predict: "button-click",
};
import { Tutorial } from "../platform/Tutorial.js";
import { tutorialFor, hasSeenTutorial, markTutorialSeen } from "../platform/tutorials.js";
import { Confetti } from "../platform/Confetti.js";
import { emitSparkles } from "../platform/Sparkles.js";
import { HowToPlayModal } from "../platform/HowToPlayModal.js";
import { PageHead } from "../platform/PageHead.js";
import { StarRating, readRating, writeRating } from "../platform/StarRating.js";
import { StatsPanel } from "../platform/StatsPanel.js";
import { ProgressBar, deriveProgress } from "../platform/ProgressBar.js";
import { recordPlayed } from "../platform/quickstart.js";
import { recordGame, loadStats, ACHIEVEMENTS, type Achievement } from "../platform/stats.js";
import { appendTimeHistory, readTimeHistory, toggleFavorite, type TimeHistoryEntry } from "../platform/userdata.js";
import { useFocusTrap } from "../platform/useFocusTrap.js";
import { t } from "../platform/i18n.js";
import { buildShareCardSvg, downloadSvg } from "../platform/svgShare.js";
import { encodeChallenge, MAX_FRIEND_SEED } from "../platform/friendCode.js";
import { encodeQrModules } from "../platform/qr.js";
import { track } from "../platform/analytics.js";
import { useConfirm } from "../platform/ConfirmDialog.js";
import { ErrorBoundary } from "../platform/ErrorBoundary.js";
import { saveReplay, REPLAY_RING_CAP } from "../platform/replays.js";
import { hashStamp, todayStamp } from "./dailyPicker.js";
import "./PlayPage.css";
import "../platform/ErrorBoundary.css";

/** Maximum number of toasts visible at once — older ones drop off. */
const MAX_TOASTS = 3;
/** Auto-dismiss delay for action toasts (ms). */
const TOAST_TTL_MS = 2000;

interface ActionToast {
  id: number;
  message: string;
}

/**
 * Best-effort human label for a dispatched action. Reducers across plugins
 * use a `{ type: string, ...payload }` shape, so we surface the type with
 * any obvious payload bits. Strictly cosmetic — never inspects state.
 */
function describeAction(action: unknown): string | null {
  if (!action || typeof action !== "object") return null;
  const obj = action as Record<string, unknown>;
  const type = typeof obj.type === "string" ? obj.type : null;
  if (!type) return null;
  const pretty = type
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  // A few well-known payload keys that are safe to render.
  const payloadBits: string[] = [];
  if (typeof obj.pips === "number") payloadBits.push(`(${obj.pips})`);
  if (typeof obj.value === "number" || typeof obj.value === "string") payloadBits.push(`= ${String(obj.value)}`);
  return payloadBits.length ? `${pretty} ${payloadBits.join(" ")}` : pretty;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

function readBestTime(gameId: string): number | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem("cards-best-times");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, number>;
    const v = parsed[gameId];
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

function writeBestTime(gameId: string, seconds: number): void {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem("cards-best-times");
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    parsed[gameId] = seconds;
    localStorage.setItem("cards-best-times", JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

/** Per-game "last used" seed cache. Stored under
 *  `cards-last-seed:<gameId>` so re-opening the same game offers the
 *  previously-played seed as the default. Read-only here besides the
 *  `writeLastSeed` writer below. Best-effort — quota / private mode
 *  errors are swallowed so a denied write never breaks gameplay. */
const LS_LAST_SEED_PREFIX = "cards-last-seed:";

function readLastSeed(gameId: string): number | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(`${LS_LAST_SEED_PREFIX}${gameId}`);
    if (!raw) return null;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || Number.isNaN(n) || n < 0) return null;
    return n;
  } catch {
    return null;
  }
}

function writeLastSeed(gameId: string, seed: number): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(`${LS_LAST_SEED_PREFIX}${gameId}`, String(seed));
  } catch {
    /* ignore */
  }
}

function parseSeed(raw: string | null): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const n = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(n) || Number.isNaN(n) || n < 0) return null;
  return n;
}

/** Per-game hint-usage counter. Stored under `cards-hints-used` as a
 *  JSON object mapping gameId → count. Read-only here besides the
 *  `bumpHintsUsed` writer below. */
const LS_HINTS_USED = "cards-hints-used";
/** Per-game undo-usage counter. Stored under `cards-undos-used` as a
 *  JSON object mapping gameId → count. Bumped each time the user
 *  triggers `undo()` (button or Ctrl/Cmd+Z) so the StatsPage drill-down
 *  can surface "Undos used" alongside hints. */
const LS_UNDOS_USED = "cards-undos-used";
const LS_HINTS_ENABLED = "cards-hints-enabled";
/** Settings → Gameplay toggle: when on, the Hint button enforces a short
 *  cooldown between successive presses to discourage accidental spamming.
 *  Default on — power users can disable it from the settings page. */
const LS_HINT_COOLDOWN = "cards-hint-cooldown";
/** Cooldown window applied between successive Hint presses, in milliseconds.
 *  Kept tight enough to not feel punitive but long enough to suppress
 *  accidental double-clicks and speed-runners hammering the button. */
const HINT_COOLDOWN_MS = 3000;
/** Tiny global counter — bumped each time the user copies a friend-mode
 *  link. Pure stats fun, no behavior keys off it. */
const LS_FRIEND_SESSIONS = "cards-friend-sessions";
/** Optional Settings → Gameplay toggle: when on, the Undo button label
 *  shows the current stack depth, e.g. "Undo (3)". Default off so the
 *  toolbar stays compact; opt-in for users who want the visual feedback. */
const LS_SHOW_UNDO_COUNT = "cards-show-undo-count";

/** Maximum number of prior states retained for undo. Pure presentation
 *  state — never touches the reducer. Keeping this bounded means a long
 *  session can't tower memory usage with deep state snapshots. */
const UNDO_STACK_CAP = 20;

function bumpFriendSessions(): void {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(LS_FRIEND_SESSIONS);
    const cur = raw ? Number.parseInt(raw, 10) : 0;
    const next = (Number.isFinite(cur) ? cur : 0) + 1;
    localStorage.setItem(LS_FRIEND_SESSIONS, String(next));
  } catch {
    /* ignore */
  }
}

function readHintsEnabled(): boolean {
  try {
    if (typeof localStorage === "undefined") return true;
    const v = localStorage.getItem(LS_HINTS_ENABLED);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

/** Read the "Hint cooldown" preference from Settings → Gameplay. When on
 *  (the default), successive hint presses are throttled by HINT_COOLDOWN_MS
 *  and the button shows a countdown while disabled. */
function readHintCooldownEnabled(): boolean {
  try {
    if (typeof localStorage === "undefined") return true;
    const v = localStorage.getItem(LS_HINT_COOLDOWN);
    return v === null ? true : v === "true";
  } catch {
    return true;
  }
}

/** Read the "Show undo count" preference from Settings → Gameplay. When
 *  enabled, the Undo button label includes the current stack depth.
 *  Defaults to false so the toolbar stays compact for casual users. */
function readShowUndoCount(): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    const v = localStorage.getItem(LS_SHOW_UNDO_COUNT);
    return v === "true";
  } catch {
    return false;
  }
}

/** Per-game persisted settings, keyed by game id. Stored under
 *  `cards-game-settings:<gameId>` so each game lives in its own slot —
 *  reading is best-effort and silently falls back to the plugin defaults
 *  when the entry is missing or malformed. */
const LS_GAME_SETTINGS_PREFIX = "cards-game-settings:";

function readGameSettings<S extends SettingSchema>(
  gameId: string,
  schema: S,
): SettingsOf<S> {
  const defaults = defaultsOf(schema);
  try {
    if (typeof localStorage === "undefined") return defaults;
    const raw = localStorage.getItem(`${LS_GAME_SETTINGS_PREFIX}${gameId}`);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return defaults;
    // Whitelist keys to the schema so a stale/foreign payload can't
    // smuggle in fields the reducer doesn't expect, and validate each
    // value against its kind so a corrupt entry falls back per-key.
    const merged = { ...defaults } as Record<string, unknown>;
    for (const [key, field] of Object.entries(schema)) {
      const v = parsed[key];
      if (v === undefined) continue;
      if (field.kind === "number" && typeof v === "number" && Number.isFinite(v)) {
        merged[key] = v;
      } else if (field.kind === "boolean" && typeof v === "boolean") {
        merged[key] = v;
      } else if (field.kind === "enum" && typeof v === "string" && field.options.includes(v)) {
        merged[key] = v;
      }
    }
    return merged as SettingsOf<S>;
  } catch {
    return defaults;
  }
}

function writeGameSettings(gameId: string, settings: Record<string, unknown>): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      `${LS_GAME_SETTINGS_PREFIX}${gameId}`,
      JSON.stringify(settings),
    );
  } catch {
    /* ignore — quota / private mode */
  }
}

function bumpHintsUsed(gameId: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(LS_HINTS_USED);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    parsed[gameId] = (parsed[gameId] ?? 0) + 1;
    localStorage.setItem(LS_HINTS_USED, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

/** Per-game undo counter writer. Mirror of {@link bumpHintsUsed} for the
 *  `cards-undos-used` blob. Tolerates a corrupt entry by treating it as
 *  zero so we never throw out of the undo path. */
function bumpUndosUsed(gameId: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(LS_UNDOS_USED);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    if (!parsed || typeof parsed !== "object") {
      localStorage.setItem(LS_UNDOS_USED, JSON.stringify({ [gameId]: 1 }));
      return;
    }
    const cur = typeof parsed[gameId] === "number" && Number.isFinite(parsed[gameId]) ? parsed[gameId] : 0;
    parsed[gameId] = cur + 1;
    localStorage.setItem(LS_UNDOS_USED, JSON.stringify(parsed));
  } catch {
    /* ignore */
  }
}

function HowToPlayContent({ text }: { text: string }): JSX.Element {
  return (
    <div className="how-to-play">
      <h3>How to play</h3>
      {text.split("\n\n").map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

/**
 * Tiny SVG line chart that visualizes the player's last-N finish times for
 * the current game. The most-recent finish is highlighted in the accent
 * color; earlier points use a softer hue so the eye lands on the run that
 * just happened.
 *
 * Renders an inline message when fewer than two entries exist, since a
 * single point can't form a trend. All sizing is in viewBox units so the
 * chart stays crisp at any popover width.
 */
function TimeTrendChart({ history }: { history: TimeHistoryEntry[] }): JSX.Element {
  // Defensive trim — appendTimeHistory caps at 20, but a corrupt blob or a
  // future bump in the limit shouldn't blow the layout out.
  const entries = history.slice(-20);
  const n = entries.length;

  // Best / Avg / Plays summary line — always shown so users get useful
  // numbers even before a trend can be drawn. Plays counts the rendered
  // history slice rather than the full stats blob, so it matches what the
  // chart visualizes one-to-one.
  const best = n > 0 ? Math.min(...entries.map((e) => e.time)) : 0;
  const avg = n > 0 ? entries.reduce((sum, e) => sum + e.time, 0) / n : 0;
  const formatSecs = (s: number): string => `${Math.round(s)}s`;

  if (n < 2) {
    return (
      <div className="play-time-chart-block">
        <div
          className="play-time-chart-empty"
          data-testid="play-time-chart"
          role="img"
          aria-label="Time trend chart"
        >
          Play more to see your trend
        </div>
        {n === 1 && (
          <div className="play-time-stats-line" data-testid="play-time-stats-line">
            Best: {formatSecs(best)} | Avg: {formatSecs(avg)} | Plays: {n}
          </div>
        )}
      </div>
    );
  }

  // Layout in viewBox units so the SVG scales cleanly. The `padX` keeps
  // the first/last marker dots away from the edges; `padY` reserves room
  // for the highlight ring without clipping it.
  const W = 220;
  const H = 60;
  const padX = 6;
  const padY = 8;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const times = entries.map((e) => e.time);
  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  // Avoid a flat-line divide-by-zero — when every play took the same time
  // we still want a visible mid-line, so synthesize a small range.
  const range = maxT - minT || 1;

  // Map index -> x, time -> y (lower time = higher on screen, since faster
  // is "better"; the accent dot stays visually consistent with "good").
  const xAt = (i: number): number => padX + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const yAt = (t: number): number => padY + innerH - ((t - minT) / range) * innerH;

  // For each entry compute the personal best across all *prior* entries
  // (i.e. the standing record going into that run). The first entry has no
  // prior best, so its delta is undefined. This lets every hover dot show
  // how that specific run compared to the player's record at the time, and
  // lets the headline indicator describe the most-recent finish.
  const prevBestAt = (i: number): number | null => {
    if (i <= 0) return null;
    let m = Infinity;
    for (let j = 0; j < i; j += 1) {
      const entry = entries[j];
      if (entry !== undefined) m = Math.min(m, entry.time);
    }
    return Number.isFinite(m) ? m : null;
  };
  const formatDelta = (delta: number): string => {
    // Round to whole seconds so the label matches the chart's formatSecs.
    // A negative delta means faster than the previous best — flip the sign
    // for the human-readable label so the number itself is non-negative.
    const rounded = Math.round(delta);
    if (rounded === 0) return "tied personal best";
    if (rounded < 0) return `-${Math.abs(rounded)}s faster`;
    return `+${rounded}s slower`;
  };

  const points: Array<{ x: number; y: number; e: TimeHistoryEntry; prevBest: number | null }> =
    entries.map((e, i) => ({ x: xAt(i), y: yAt(e.time), e, prevBest: prevBestAt(i) }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  // The current run is the last entry — highlighted in the accent color.
  // Guaranteed non-empty here: the `n < 2` branch above already returned, so
  // `points` has at least two members and `points[lastIdx]` is defined.
  const lastIdx = points.length - 1;
  const lastPoint = points[lastIdx]!;
  const lastDelta =
    lastPoint.prevBest != null ? lastPoint.e.time - lastPoint.prevBest : null;
  // Three-state pace tone: faster (green), tied (neutral), slower (amber).
  // We classify on the rounded value so it agrees with the visible label.
  const lastDeltaTone =
    lastDelta == null
      ? "none"
      : Math.round(lastDelta) < 0
        ? "faster"
        : Math.round(lastDelta) === 0
          ? "tied"
          : "slower";

  return (
    <div className="play-time-chart-block">
      <svg
        className="play-time-chart"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        data-testid="play-time-chart"
        role="img"
        aria-label={`Time trend over last ${n} plays`}
      >
        <path
          d={pathD}
          fill="none"
          stroke="rgba(148, 163, 184, 0.55)"
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => {
          const isCurrent = i === lastIdx;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isCurrent ? 3.2 : 2}
              fill={isCurrent ? "#a78bfa" : "rgba(148, 163, 184, 0.7)"}
              stroke={isCurrent ? "#c7cdfe" : "none"}
              strokeWidth={isCurrent ? 1.2 : 0}
            >
              <title>
                {`${formatSecs(p.e.time)}${typeof p.e.score === "number" ? ` (score ${p.e.score})` : ""}${p.prevBest != null ? ` — ${formatDelta(p.e.time - p.prevBest)} vs personal best` : " — first run"}`}
              </title>
            </circle>
          );
        })}
      </svg>
      {lastDelta != null && (
        <div
          className={`play-time-pace play-time-pace-${lastDeltaTone}`}
          data-testid="play-time-pace"
          data-pace={lastDeltaTone}
          aria-label={`Latest run ${formatDelta(lastDelta)} vs personal best`}
        >
          Latest: {formatDelta(lastDelta)} vs personal best
        </div>
      )}
      <div className="play-time-stats-line" data-testid="play-time-stats-line">
        Best: {formatSecs(best)} | Avg: {formatSecs(avg)} | Plays: {n}
      </div>
    </div>
  );
}

export default function PlayPage(): JSX.Element {
  const { gameId } = useParams<{ gameId: string }>();
  const plugin = useMemo(
    () => GAMES.find((g) => g != null && g.id === gameId),
    [gameId],
  );

  if (!plugin) {
    return (
      <div className="play-not-found" data-testid="game-not-found">
        <PageHead title="Game not found" />
        <p>Unknown game: {gameId}</p>
        <Link to="/">Back to lobby</Link>
      </div>
    );
  }

  return <PlayGame key={plugin.id} plugin={plugin} />;
}

function PlayGame({ plugin }: { plugin: (typeof GAMES)[number] }): JSX.Element {
  const showConfirm = useConfirm();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSeed = parseSeed(searchParams.get("seed"));

  const [settings, setSettings] = useState(() =>
    readGameSettings(plugin.id, plugin.settings),
  );
  const [phase, setPhase] = useState<"setup" | "playing" | "ended">("setup");
  const [seed, setSeed] = useState<number>(
    () => urlSeed ?? readLastSeed(plugin.id) ?? randomSeed(),
  );
  const [state, setState] = useState(() => plugin.initialState(seed, settings));
  // Snapshot of settings at the moment the current game started — used to
  // render the "Restart to apply" banner without mid-game-mutating state.
  // JSON-serialized for cheap structural comparison; settings shapes are
  // always plain primitives + strings so this is safe.
  const [settingsAtGameStart, setSettingsAtGameStart] = useState<string>(
    () => JSON.stringify(settings),
  );
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const settingsModalRef = useRef<HTMLDivElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  // Toggle that the play-board element keys against to (re)trigger a shake
  // animation when the user dispatches a no-op action (reducer returns the
  // same state reference — typically an illegal move).
  const [shakeKey, setShakeKey] = useState(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(() => readBestTime(plugin.id));
  // Per-game time-trend history — last 20 finishes. Populated on every
  // game-end via appendTimeHistory; the info popover renders a tiny SVG
  // chart from this slice.
  const [timeHistory, setTimeHistory] = useState<TimeHistoryEntry[]>(
    () => readTimeHistory(plugin.id),
  );
  const [rating, setRating] = useState<number>(() => readRating(plugin.id));
  // Snapshot of the personal-best time *before* the just-finished game was
  // recorded — used to detect "New record!" and to render the previous best
  // alongside the new one in the win banner.
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Pause is purely a presentation freeze of the elapsed counter — never
  // touches reducer state. Persisted in a ref so re-renders keep value.
  const [paused, setPaused] = useState(false);
  // Unified undo stack. Holds the last UNDO_STACK_CAP `{ state, action }`
  // pairs so any game with a deterministic reducer gets undo "for free"
  // — we snapshot the prior state on every dispatch and roll back via
  // `setState(prev)`. Purely PlayPage-side presentation memory; the
  // reducer and plugin shape are untouched.
  const [undoStack, setUndoStack] = useState<Array<{ state: unknown; action: unknown }>>([]);
  // Redo ring buffer. Mirror of undoStack — every `undo()` peels one frame
  // off undoStack and pushes the *current* state onto redoStack so we can
  // step forward again. A fresh `dispatch` (i.e. a brand-new user action)
  // wipes redoStack: that path branches the timeline, so the previously
  // discarded redo frames are no longer reachable.
  const [redoStack, setRedoStack] = useState<Array<{ state: unknown; action: unknown }>>([]);
  // Rolling action log — last 10 dispatched action types with timestamps.
  // Surfaced under the info popover for debugging + curious users; never
  // observed by the reducer, so plugin shape is unchanged.
  const [actionLog, setActionLog] = useState<Array<{ id: number; type: string; ts: number }>>([]);
  const actionLogIdRef = useRef(0);
  // Replay ring buffer. Holds up to REPLAY_RING_CAP recently dispatched
  // actions for the current seed so the win banner's "Save replay"
  // button can persist a `{seed, actions[]}` snapshot. Cleared whenever
  // a new game starts (startWithSeed / quickstart).
  const replayBufferRef = useRef<unknown[]>([]);
  // Echoes the in-flight save so the button can swap to a "Saved" label
  // briefly. Pure presentation state — never read by the reducer.
  const [replaySaved, setReplaySaved] = useState(false);
  // Whether the Undo button label should include the current depth, e.g.
  // "Undo (3)". Mirrors the Settings → Gameplay toggle and stays in sync
  // via a `storage` listener so toggling the preference from the Settings
  // page (or another tab) updates the toolbar label live.
  const [showUndoCount, setShowUndoCount] = useState<boolean>(() => readShowUndoCount());
  useEffect(() => {
    const refresh = () => setShowUndoCount(readShowUndoCount());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === LS_SHOW_UNDO_COUNT) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // Action toast queue. Each push gets a monotonically increasing id so
  // that React keys stay stable as older toasts fall off the front.
  const [toasts, setToasts] = useState<ActionToast[]>([]);
  const toastIdRef = useRef(0);
  // Celebratory toast surfaced when finishing a game unlocks one or more
  // achievements. Holds the most-recently unlocked entry so the banner
  // shows a single named achievement; auto-dismisses after a few seconds.
  const [playAchievementToast, setPlayAchievementToast] =
    useState<Achievement | null>(null);
  const achievementToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Session metadata for the info popover.
  const [infoOpen, setInfoOpen] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);
  const actionCountRef = useRef(0);
  const infoPopoverRef = useRef<HTMLDivElement | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const playPanelRef = useRef<HTMLElement | null>(null);
  // Seed-picker popover state. The draft is held in a string so partial
  // edits ("12", "") don't immediately reset to NaN; we parse on Apply.
  const [seedPickerOpen, setSeedPickerOpen] = useState(false);
  const [seedDraft, setSeedDraft] = useState<string>(() => String(seed));
  const seedPickerRef = useRef<HTMLDivElement | null>(null);
  const seedPickerBtnRef = useRef<HTMLButtonElement | null>(null);
  // Mobile-only overflow menu (•••) state. Holds the "secondary" toolbar
  // group (info, share-seed, share-friend, fullscreen, settings) which is
  // hidden behind a single button on narrow viewports so the primary
  // controls (undo/redo/hint/restart) stay reachable without horizontal
  // scrolling. On desktop CSS forces the group open and hides the toggle,
  // so this state is only consulted at mobile widths.
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowBtnRef = useRef<HTMLButtonElement | null>(null);
  const overflowMenuRef = useRef<HTMLDivElement | null>(null);

  /**
   * Best-effort fullscreen toggle on the play panel. Browsers vary on the
   * exact API surface — we feature-detect `requestFullscreen` per the
   * standard and silently fall back to a no-op when unavailable (older
   * Safari, locked-down embeds, etc.). Errors during the request are
   * swallowed so a denial doesn't surface as an unhandled rejection.
   */
  const toggleFullscreen = useCallback(() => {
    if (typeof document === "undefined") return;
    const el = playPanelRef.current;
    const docAny = document as Document & { exitFullscreen?: () => Promise<void> };
    if (document.fullscreenElement) {
      if (typeof docAny.exitFullscreen === "function") {
        try {
          void docAny.exitFullscreen();
        } catch {
          /* ignore */
        }
      }
      track("play.fullscreen", { gameId: plugin.id, exit: true });
      return;
    }
    if (!el) return;
    if (typeof el.requestFullscreen === "function") {
      try {
        void el.requestFullscreen();
        track("play.fullscreen", { gameId: plugin.id, exit: false });
      } catch {
        /* ignore — user gesture or permission may have been denied */
      }
    }
  }, [plugin.id]);

  // Plays-this-session counter — bumped each time we transition into
  // "playing", never written to localStorage.
  const [sessionPlays, setSessionPlays] = useState(0);
  // Whether the user has enabled hints in Settings → Gameplay. Read once
  // up-front; settings changes don't take effect mid-game.
  const hintsEnabled = useMemo(() => readHintsEnabled(), []);
  // Whether the user has the hint-button cooldown enabled in Settings →
  // Gameplay. Read once up-front so toggling mid-game doesn't yank the
  // throttle out from under an in-flight countdown. Default true.
  const hintCooldownEnabled = useMemo(() => readHintCooldownEnabled(), []);
  // Remaining seconds on the hint cooldown, or 0 when the button is ready
  // to fire. We store seconds (not ms) so the rendered label is a clean
  // integer without extra rounding in the JSX. Driven by a 1Hz interval
  // started when `showHint` triggers.
  const [hintCooldown, setHintCooldown] = useState(0);

  useFocusTrap(infoPopoverRef, infoOpen);
  useFocusTrap(settingsModalRef, settingsModalOpen);
  useFocusTrap(seedPickerRef, seedPickerOpen);

  // Sync seed draft whenever the seed changes externally (URL, restart,
  // or the user opens the picker on a fresh game) so the input always
  // pre-fills with the current seed.
  useEffect(() => {
    setSeedDraft(String(seed));
  }, [seed]);

  // Esc / outside-click closes the seed picker. Bound at capture so we
  // win against the pause-toggle keydown handler when both are active.
  useEffect(() => {
    if (!seedPickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSeedPickerOpen(false);
        seedPickerBtnRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (seedPickerRef.current?.contains(t)) return;
      if (seedPickerBtnRef.current?.contains(t)) return;
      setSeedPickerOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("mousedown", onDown);
    };
  }, [seedPickerOpen]);

  // Esc / outside-click closes the mobile overflow menu. Mirrors the
  // seed-picker pattern so the same UX expectations apply.
  useEffect(() => {
    if (!overflowOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOverflowOpen(false);
        overflowBtnRef.current?.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (overflowMenuRef.current?.contains(t)) return;
      if (overflowBtnRef.current?.contains(t)) return;
      setOverflowOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("mousedown", onDown);
    };
  }, [overflowOpen]);

  // Persist settings under `cards-game-settings:<gameId>` whenever they
  // change. Writes are best-effort; the helper swallows quota / private
  // mode errors so a denied write never breaks gameplay.
  useEffect(() => {
    writeGameSettings(plugin.id, settings as Record<string, unknown>);
  }, [plugin.id, settings]);

  // Esc closes the settings modal. Bound at capture so we win against the
  // pause-toggle handler when both are theoretically active.
  useEffect(() => {
    if (!settingsModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSettingsModalOpen(false);
        settingsButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [settingsModalOpen]);

  const onRate = useCallback(
    (next: number) => {
      setRating(next);
      writeRating(plugin.id, next);
    },
    [plugin.id],
  );

  // Tick the in-game timer once per second while playing — pausing only
  // freezes this counter, never the underlying reducer state.
  useEffect(() => {
    if (phase !== "playing" || paused) return;
    const id = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [phase, paused]);

  // Hint-button cooldown ticker. Only mounted while a cooldown is active
  // so we don't run a 1Hz interval for the entire session. Each tick
  // decrements the remaining seconds; the effect re-arms naturally on the
  // state change and tears itself down when we hit zero.
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const id = setInterval(() => {
      setHintCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [hintCooldown]);

  const tutorialSteps = useMemo(() => tutorialFor(plugin.id, plugin.category), [plugin.id, plugin.category]);
  // Auto-launch only when the game has an EXPLICIT, hand-written tutorial.
  // The categorical fallback (added so the Help button never returns
  // nothing) is too generic to surface uninvited — it would intercept
  // clicks on every fresh game visit.
  const hasExplicitTutorial = useMemo(() => tutorialFor(plugin.id) != null, [plugin.id]);

  // Auto-launch tutorial for first-time visitors of supported games.
  useEffect(() => {
    if (phase !== "playing") return;
    if (!hasExplicitTutorial) return;
    if (!tutorialSteps || tutorialSteps.length === 0) return;
    if (hasSeenTutorial(plugin.id)) return;
    setTutorialOpen(true);
  }, [phase, plugin.id, tutorialSteps, hasExplicitTutorial]);

  // If the URL ?seed= changes externally (back/forward navigation), adopt it.
  useEffect(() => {
    if (urlSeed != null && urlSeed !== seed) {
      setSeed(urlSeed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSeed]);

  // Quick Start: when arriving via the AppShell lightning button, skip the
  // setup screen and drop the user straight into a fresh game. The flag is
  // also stripped from the URL so a manual reload doesn't loop the same
  // bypass — refreshes behave like a normal visit.
  const quickstartFlag = searchParams.get("quickstart") === "1";
  useEffect(() => {
    if (!quickstartFlag) return;
    if (phase !== "setup") return;
    recordPlayed(plugin.id);
    setState(plugin.initialState(seed, settings));
    setUndoStack([]);
    setFinalScore(null);
    setElapsed(0);
    setShowConfetti(false);
    replayBufferRef.current = [];
    setReplaySaved(false);
    setSettingsAtGameStart(JSON.stringify(settings));
    setPhase("playing");
    track("game.start", { gameId: plugin.id, seed, quickstart: true });
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("quickstart");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickstartFlag]);

  const startWithSeed = useCallback(
    (nextSeed: number) => {
      recordPlayed(plugin.id);
      writeLastSeed(plugin.id, nextSeed);
      setSeed(nextSeed);
      setState(plugin.initialState(nextSeed, settings));
      setUndoStack([]);
      setFinalScore(null);
      setElapsed(0);
      setShowConfetti(false);
      replayBufferRef.current = [];
      setReplaySaved(false);
      setIsNewRecord(false);
      setPreviousBest(null);
      setBannerDismissed(false);
      setPaused(false);
      setToasts([]);
      sessionStartRef.current = new Date();
      actionCountRef.current = 0;
      setSessionPlays((n) => n + 1);
      setSettingsAtGameStart(JSON.stringify(settings));
      setPhase("playing");
      track("game.start", { gameId: plugin.id, seed: nextSeed });
    },
    [plugin, settings],
  );

  const start = useCallback(() => {
    startWithSeed(seed);
  }, [seed, startWithSeed]);

  /**
   * Confirms with the user before discarding meaningful progress. A game
   * counts as "in progress" once it has either run for >30s or accepted
   * more than 5 user actions.
   */
  const confirmIfInProgress = useCallback(async (): Promise<boolean> => {
    if (phase !== "playing") return true;
    const inProgress = elapsed > 30 || actionCountRef.current > 5;
    if (!inProgress) return true;
    return await showConfirm({
      title: "Lose progress?",
      message: "You have an in-progress game. Restarting will discard your current progress.",
      confirmLabel: "Restart",
      danger: true,
    });
  }, [phase, elapsed, showConfirm]);

  const newGame = useCallback(async () => {
    if (!(await confirmIfInProgress())) return;
    startWithSeed(randomSeed());
  }, [startWithSeed, confirmIfInProgress]);

  const replay = useCallback(async () => {
    if (!(await confirmIfInProgress())) return;
    startWithSeed(seed);
  }, [seed, startWithSeed, confirmIfInProgress]);

  // Apply a seed from the picker. Bypasses the in-progress prompt because
  // the user has explicitly opened the picker and clicked Apply — they are
  // intentionally restarting the game.
  const applyPickedSeed = useCallback(
    (next: number) => {
      const safe = Number.isFinite(next) && next >= 0 ? Math.floor(next) : randomSeed();
      startWithSeed(safe);
      setSeedPickerOpen(false);
    },
    [startWithSeed],
  );

  // Step the draft seed by ±1. Operates on the draft string only — the
  // game doesn't restart until the user clicks Apply.
  const stepSeed = useCallback((delta: number) => {
    setSeedDraft((cur) => {
      const n = Number.parseInt(cur, 10);
      const base = Number.isFinite(n) && !Number.isNaN(n) && n >= 0 ? n : 0;
      const next = Math.max(0, base + delta);
      return String(next);
    });
  }, []);

  const pushToast = useCallback((message: string) => {
    if (!message) return;
    const id = ++toastIdRef.current;
    setToasts((cur) => {
      const next = [...cur, { id, message }];
      // Cap stack so spammy actions don't tower up the screen.
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
    window.setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, TOAST_TTL_MS);
  }, []);

  const togglePause = useCallback(() => {
    if (phase !== "playing") return;
    setPaused((p) => !p);
  }, [phase]);

  /**
   * Trigger a hint pulse. Calls `plugin.hint?.(state)` (read-only — never
   * mutates state), then queries the DOM for the returned selector and
   * adds the `hint-pulse` class for ~1.5s (3 pulses by default). No-op
   * if the plugin doesn't define a hint or the selector resolves to
   * nothing on the page.
   */
  const showHint = useCallback(() => {
    if (!hintsEnabled) return;
    if (!plugin.hint) return;
    if (phase !== "playing") return;
    // Throttle successive presses when the user has the cooldown toggle on.
    // The button is also rendered as `disabled` while a cooldown is active,
    // but we double-guard here so any keyboard / programmatic invocation
    // honours the same window.
    if (hintCooldownEnabled && hintCooldown > 0) return;
    let target: ReturnType<NonNullable<typeof plugin.hint>>;
    try {
      target = plugin.hint(state);
    } catch {
      target = null;
    }
    if (!target) {
      pushToast("No hint available");
      return;
    }
    if (typeof document === "undefined") return;
    let el: Element | null = null;
    try {
      el = document.querySelector(target.selector);
    } catch {
      el = null;
    }
    if (!el) {
      pushToast("No hint available");
      return;
    }
    bumpHintsUsed(plugin.id);
    track("play.hint", { gameId: plugin.id });
    // Arm the cooldown only on a hint that actually fires — failed lookups
    // (no target / unmounted selector) above bail before this point so the
    // user isn't punished for a no-op press.
    if (hintCooldownEnabled) {
      setHintCooldown(Math.ceil(HINT_COOLDOWN_MS / 1000));
    }
    // Stagger the pulse if other targets are already animating so a
    // burst of simultaneous hints doesn't flash on the same frame.
    const concurrentBefore = document.querySelectorAll(".hint-pulse").length;
    if (el instanceof HTMLElement) {
      el.style.setProperty("--hint-stagger", `${concurrentBefore * 120}ms`);
    }
    el.classList.add("hint-pulse");

    // Floating "Try this" tooltip — appended to body and positioned over
    // the target element. Auto-dismissed after 2s regardless of pulse
    // duration so it never lingers on long animations.
    let tooltip: HTMLDivElement | null = null;
    let scrollHandler: (() => void) | null = null;
    let resizeHandler: (() => void) | null = null;
    try {
      tooltip = document.createElement("div");
      tooltip.className = "hint-pulse-tooltip";
      tooltip.setAttribute("role", "status");
      tooltip.setAttribute("aria-live", "polite");
      const titleEl = document.createElement("span");
      titleEl.className = "hint-pulse-tooltip-title";
      titleEl.textContent = "💡 Hint";
      const bodyEl = document.createElement("span");
      bodyEl.className = "hint-pulse-tooltip-body";
      bodyEl.textContent = "Try this";
      tooltip.appendChild(titleEl);
      tooltip.appendChild(bodyEl);
      document.body.appendChild(tooltip);

      const positionTooltip = () => {
        if (!tooltip || !el) return;
        const rect = el.getBoundingClientRect();
        const x = rect.left + rect.width / 2 + window.scrollX;
        const y = rect.top + window.scrollY;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      };
      positionTooltip();
      scrollHandler = positionTooltip;
      resizeHandler = positionTooltip;
      window.addEventListener("scroll", scrollHandler, { passive: true });
      window.addEventListener("resize", resizeHandler);
    } catch {
      /* DOM might not be available in unusual environments */
    }

    const tooltipMs = 2000;
    window.setTimeout(() => {
      try {
        if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
        if (resizeHandler) window.removeEventListener("resize", resizeHandler);
        tooltip?.remove();
      } catch {
        /* tooltip may have already been removed */
      }
    }, tooltipMs);

    const ms = 500 * Math.max(1, target.pulses ?? 3);
    window.setTimeout(() => {
      try {
        el?.classList.remove("hint-pulse");
        if (el instanceof HTMLElement) {
          el.style.removeProperty("--hint-stagger");
        }
      } catch {
        /* element may have unmounted */
      }
    }, ms + concurrentBefore * 120);
  }, [hintsEnabled, hintCooldownEnabled, hintCooldown, plugin, phase, state, pushToast]);

  const friendMode = searchParams.get("friend") === "1";

  const shareFriendLink = useCallback(async () => {
    const origin =
      typeof window !== "undefined" && window.location && window.location.origin
        ? window.location.origin
        : "https://cards.waterburp.com";
    const url = `${origin}/play/${plugin.id}?seed=${seed}&friend=1`;
    let copied = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        copied = true;
      }
    } catch {
      copied = false;
    }
    bumpFriendSessions();
    // also reflect the seed in the live URL so a refresh keeps the same hand
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("seed", String(seed));
        return next;
      },
      { replace: true },
    );
    track("friend.share", { gameId: plugin.id, copied });
    pushToast(
      copied
        ? "Link copied — share with a friend (same seed = same hand)"
        : "Could not copy link",
    );
  }, [plugin.id, seed, setSearchParams, pushToast]);

  const shareSeed = useCallback(async () => {
    const origin =
      typeof window !== "undefined" && window.location && window.location.origin
        ? window.location.origin
        : "https://cards.waterburp.com";
    const url = `${origin}/play/${plugin.id}?seed=${seed}`;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
      } else {
        setShareStatus("error");
      }
    } catch {
      setShareStatus("error");
    }
    // also reflect the seed in the live URL so a refresh keeps the same hand
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("seed", String(seed));
        return next;
      },
      { replace: true },
    );
    setTimeout(() => setShareStatus("idle"), 1800);
  }, [plugin.id, seed, setSearchParams]);

  const recordBest = useCallback(
    (seconds: number): { prev: number | null; isRecord: boolean } => {
      const prev = readBestTime(plugin.id);
      const isRecord = prev == null || seconds < prev;
      if (isRecord) {
        writeBestTime(plugin.id, seconds);
        setBestTime(seconds);
      }
      return { prev, isRecord };
    },
    [plugin.id],
  );

  /**
   * Persist the just-finished round via `recordGame`, snapshotting
   * `unlocked` before/after so we can surface a celebratory toast for
   * any achievement that crossed the threshold *during this play*.
   *
   * The diff is the source of truth — we never trust ACHIEVEMENTS order
   * or rely on `recordGame`'s own toast (that path uses the global
   * `useToast` store; this surfaces a play-page-scoped banner with a
   * dedicated test id so e2e tests can assert without coupling to the
   * generic toast queue). Only the most-recent unlock is featured to
   * keep the banner uncluttered when a single play happens to clear
   * several at once.
   */
  const recordWithAchievementToast = useCallback(
    (score: number, won: boolean, time: number) => {
      const before = new Set(loadStats().unlocked);
      const after = recordGame(plugin.id, score, won, time);
      const newlyUnlocked: Achievement[] = [];
      for (const id of after.unlocked) {
        if (before.has(id)) continue;
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) newlyUnlocked.push(ach);
      }
      if (newlyUnlocked.length === 0) return;
      // Show the last new unlock — `recordGame` walks ACHIEVEMENTS in
      // declaration order, so the trailing entry is the "most advanced"
      // one cleared this round. Earlier unlocks still surface via the
      // global toast inside `recordGame`.
      const featured = newlyUnlocked[newlyUnlocked.length - 1]!;
      setPlayAchievementToast(featured);
      try {
        if (typeof window !== "undefined") {
          emitSparkles(window.innerWidth / 2, window.innerHeight / 2);
        }
      } catch {
        /* sparkles unavailable */
      }
      if (achievementToastTimerRef.current) {
        clearTimeout(achievementToastTimerRef.current);
      }
      achievementToastTimerRef.current = setTimeout(() => {
        setPlayAchievementToast(null);
        achievementToastTimerRef.current = null;
      }, 5000);
    },
    [plugin.id],
  );

  // Tear down any in-flight achievement-toast timer on unmount so we
  // don't try to setState on an unmounted PlayPage during fast nav.
  useEffect(() => {
    return () => {
      if (achievementToastTimerRef.current) {
        clearTimeout(achievementToastTimerRef.current);
        achievementToastTimerRef.current = null;
      }
    };
  }, []);

  const dispatch = useCallback(
    (action: unknown) => {
      actionCountRef.current += 1;
      // Infer the action type and play a platform-mapped sound. Keeps
      // games sounding alive without per-game playSound() calls. Skips
      // high-volume timer ticks and pure navigation actions.
      const actionTypeRaw =
        action && typeof action === "object" && typeof (action as { type?: unknown }).type === "string"
          ? ((action as { type: string }).type)
          : "";
      const sound = ACTION_SOUND_MAP[actionTypeRaw];
      if (sound) playSound(sound);
      // Coarse per-game analytics for action mix. Skip high-volume timer
      // ticks and unknown/empty types so the event stream stays useful.
      if (actionTypeRaw && actionTypeRaw !== "tick") {
        track("play.action", { gameId: plugin.id, type: actionTypeRaw });
      }
      // Mobile haptic — a brief 10ms tick on every dispatched action.
      // No-op outside browsers / on devices without a vibration motor.
      try {
        if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
          navigator.vibrate(10);
        }
      } catch { /* some browsers throw on disabled vibrate; ignore */ }
      // Push every dispatched action into the replay ring buffer (cap
      // REPLAY_RING_CAP). Done unconditionally — even reducer no-ops
      // are recorded so the saved replay matches the user's actual
      // input stream.
      {
        const buf = replayBufferRef.current;
        buf.push(action);
        if (buf.length > REPLAY_RING_CAP) {
          buf.splice(0, buf.length - REPLAY_RING_CAP);
        }
      }
      const label = describeAction(action);
      if (label) pushToast(label);
      // Append to the rolling action log (cap = 10) regardless of whether
      // the reducer ends up changing state. Useful as a debugging breadcrumb
      // even when the reducer collapses the action into a no-op.
      const actionType =
        action && typeof action === "object" && typeof (action as { type?: unknown }).type === "string"
          ? ((action as { type: string }).type)
          : "(unknown)";
      setActionLog((prev) => {
        const id = ++actionLogIdRef.current;
        const appended = [...prev, { id, type: actionType, ts: Date.now() }];
        return appended.length > 10 ? appended.slice(appended.length - 10) : appended;
      });
      setState((s: unknown) => {
        const next = plugin.reducer(s, action);
        // Reducer returned same reference → illegal/no-op action.
        // Bump shakeKey so the play-board re-keys its `.shake` class and
        // gives the user immediate visual feedback that the input was
        // rejected. (Lose sound is reserved for terminal-state losses
        // further down; this is just a "nope" cue.)
        if (next === s && action && typeof action === "object" && (action as { type?: unknown }).type !== "tick") {
          setShakeKey((k) => k + 1);
        }
        // Push the prior state onto the unified undo ring buffer (last
        // UNDO_STACK_CAP). Skip when the reducer returned the same
        // reference — those are no-ops and pushing them would let undo
        // "stutter" without visible effect.
        if (next !== s) {
          setUndoStack((prev) => {
            const appended = [...prev, { state: s, action }];
            return appended.length > UNDO_STACK_CAP
              ? appended.slice(appended.length - UNDO_STACK_CAP)
              : appended;
          });
          // Fresh user action → branch the timeline. Any previously-stashed
          // redo frames are no longer reachable, so drop them.
          setRedoStack((prev) => (prev.length === 0 ? prev : []));
        }
        const term = plugin.isTerminal(next);
        if (term) {
          setFinalScore(term.score);
          setPhase("ended");
          setBannerDismissed(false);
          if (term.score > 0) {
            playSound("win");
            playSound("win-fanfare");
            const { prev, isRecord } = recordBest(elapsed);
            setPreviousBest(prev);
            setIsNewRecord(isRecord);
            setShowConfetti(true);
          } else {
            // Zero-score finish — count it as a loss for audio feedback.
            playSound("lose");
            setPreviousBest(null);
            setIsNewRecord(false);
          }
          // Append every finish (win or zero-score loss) to the per-game
          // history so the info popover trend chart reflects all plays.
          setTimeHistory(appendTimeHistory(plugin.id, elapsed, term.score));
          void submitScore(plugin.id, term.score, settings as Record<string, unknown>);
          recordWithAchievementToast(term.score, term.score > 0, elapsed);
          track(term.score > 0 ? "game.win" : "game.lose", {
            gameId: plugin.id,
            score: term.score,
            elapsed,
          });
        }
        return next;
      });
    },
    [plugin, settings, elapsed, recordBest, pushToast, recordWithAchievementToast],
  );

  /**
   * Pop the most-recent prior state off the undo stack and roll the game
   * back. Strictly a presentation-side operation — we never invoke the
   * reducer, so the rollback is identical to whatever shape the reducer
   * produced before the action being undone. Bound to the Undo button
   * and Ctrl/Cmd+Z; both call into this single path.
   */
  const undo = useCallback(() => {
    if (phase !== "playing") return;
    setUndoStack((stack) => {
      if (stack.length === 0) return stack;
      // Non-empty guard above guarantees the indexed read is defined.
      const prev = stack[stack.length - 1]!;
      // Bump the per-game undo counter only when an actual frame is
      // popped — empty-stack invocations are no-ops and shouldn't inflate
      // the StatsPage drill-down. Mirror of `bumpHintsUsed` semantics.
      bumpUndosUsed(plugin.id);
      track("play.undo", { gameId: plugin.id });
      // Snapshot the *current* state onto redoStack before rolling back so
      // a subsequent `redo()` can step forward again. We capture state via
      // the functional setState to avoid stale-closure reads.
      setState((cur: unknown) => {
        setRedoStack((rs) => {
          const appended = [...rs, { state: cur, action: prev.action }];
          return appended.length > UNDO_STACK_CAP
            ? appended.slice(appended.length - UNDO_STACK_CAP)
            : appended;
        });
        return prev.state;
      });
      return stack.slice(0, -1);
    });
  }, [phase, plugin.id]);

  /**
   * Mirror of `undo`: pop the most recent frame off redoStack and restore
   * it, pushing the current state back onto undoStack so undo/redo stay
   * symmetrical. A no-op when redoStack is empty (e.g. immediately after a
   * fresh dispatch, which clears it).
   */
  const redo = useCallback(() => {
    if (phase !== "playing") return;
    setRedoStack((stack) => {
      if (stack.length === 0) return stack;
      // Non-empty guard above guarantees the indexed read is defined.
      const next = stack[stack.length - 1]!;
      track("play.redo", { gameId: plugin.id });
      setState((cur: unknown) => {
        setUndoStack((us) => {
          const appended = [...us, { state: cur, action: next.action }];
          return appended.length > UNDO_STACK_CAP
            ? appended.slice(appended.length - UNDO_STACK_CAP)
            : appended;
        });
        return next.state;
      });
      return stack.slice(0, -1);
    });
  }, [phase, plugin.id]);

  // Ctrl/Cmd+Z triggers undo, Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y trigger redo.
  // We skip when focus is in a text-entry surface (settings inputs,
  // contenteditable) so users editing fields get the browser's native
  // text-undo/redo, not a game rollback.
  useEffect(() => {
    if (phase !== "playing") return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (target?.isContentEditable) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      if (key === "y" && !e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, undo, redo]);

  const onGameOver = useCallback(
    (score: number) => {
      setFinalScore(score);
      setPhase("ended");
      setBannerDismissed(false);
      if (score > 0) {
        playSound("win");
        playSound("win-fanfare");
        const { prev, isRecord } = recordBest(elapsed);
        setPreviousBest(prev);
        setIsNewRecord(isRecord);
        setShowConfetti(true);
      } else {
        setPreviousBest(null);
        setIsNewRecord(false);
      }
      // Append every finish to the per-game history so the info popover
      // trend chart reflects all plays — not just personal-best winners.
      setTimeHistory(appendTimeHistory(plugin.id, elapsed, score));
      void submitScore(plugin.id, score, settings as Record<string, unknown>);
      recordWithAchievementToast(score, score > 0, elapsed);
      track(score > 0 ? "game.win" : "game.lose", {
        gameId: plugin.id,
        score,
        elapsed,
      });
    },
    [plugin.id, settings, elapsed, recordBest, recordWithAchievementToast],
  );

  const showProminentSeed = plugin.id === "klondike" || plugin.id === "freecell" || plugin.id === "spider";
  const progress = useMemo(() => deriveProgress(state), [state]);

  // Have settings drifted from the snapshot taken when the current game
  // started? Settings changes are NEVER applied mid-game (would break
  // determinism / replay) — they take effect only on Restart, so we
  // surface a banner whenever the live `settings` no longer match the
  // snapshot. JSON-string compare is fine: settings are flat primitives.
  const settingsDirty =
    phase === "playing" && JSON.stringify(settings) !== settingsAtGameStart;

  const isWin = phase === "ended" && finalScore !== null && finalScore > 0;
  // A finished round that didn't qualify as a "win" — score 0 or, by
  // convention here, a draw. We treat it as a loss so we can surface an
  // encouragement banner with the same Replay / Lobby affordances as the
  // win path. Anything not a win after the round ends counts.
  const isLoss = phase === "ended" && finalScore !== null && !isWin;
  const showWinBanner = isWin && !bannerDismissed;
  const showLossBanner = isLoss && !bannerDismissed;

  // Rotating pool of encouragement lines for the loss/draw banner. The
  // pick is a stable hash of `${gameId}:${seed}` so the same finished
  // round always shows the same line — no flicker on re-render — but a
  // new game (new seed) produces a new line. Eight phrases keeps the
  // tone varied without becoming gimmicky.
  const lossEncouragement = useMemo(() => {
    const lines = [
      "So close — give it another shot.",
      "Tough break! The next deal is yours.",
      "Every loss sharpens the next win.",
      "Shuffle it off — you've got this.",
      "Not this time, but you're learning the deck.",
      "The cards turn — try again.",
      "One more hand could be the one.",
      "Don't fold now — replay and rally.",
    ];
    const key = `${plugin.id}:${seed}`;
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = (h * 31 + key.charCodeAt(i)) | 0;
    }
    return lines[Math.abs(h) % lines.length];
  }, [plugin.id, seed]);

  const shareToTwitter = useCallback(() => {
    if (typeof window === "undefined") return;
    const origin = window.location?.origin ?? "https://cards.waterburp.com";
    const url = `${origin}/play/${plugin.id}?seed=${seed}`;
    const text = `I just scored ${finalScore ?? 0} on ${plugin.title} in ${formatTime(elapsed)}!${isNewRecord ? " New personal best!" : ""}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }, [plugin.id, plugin.title, seed, finalScore, elapsed, isNewRecord]);

  /**
   * Trigger the browser's native print dialog. The page-level
   * `@media print` rules in PlayPage.css strip the surrounding chrome
   * (header, app-shell nav/footer, sidebars) so the win banner prints
   * clean on a white background. Best-effort: missing `window.print`
   * (jsdom, locked-down embeds) silently no-ops.
   */
  const printScoresheet = useCallback(() => {
    if (typeof window === "undefined") return;
    if (typeof window.print === "function") {
      try {
        window.print();
        track("play.print", { gameId: plugin.id });
      } catch {
        /* user-cancel or pop-up blocker */
      }
    }
  }, [plugin.id]);

  /**
   * Build a 1200×630 share card summarizing the final score and trigger a
   * download as `cards-<gameid>-<timestamp>.svg`. Uses the shared
   * `buildShareCardSvg` helper so the leaderboard ladder export and the
   * win-screen card stay visually consistent.
   */
  const shareImage = useCallback(() => {
    const lines: string[] = [
      `Score: ${finalScore ?? 0}`,
      `Time: ${formatTime(elapsed)}`,
      `Seed: ${seed}`,
    ];
    if (isNewRecord) lines.push("New personal best!");
    const svg = buildShareCardSvg({
      title: plugin.title,
      lines,
      accent: "#c7cdfe",
      date: new Date(),
    });
    downloadSvg(svg, `cards-${plugin.id}-${Date.now()}.svg`);
    track("play.share_image", { gameId: plugin.id });
  }, [plugin.id, plugin.title, seed, finalScore, elapsed, isNewRecord]);

  // Esc dismisses the win banner; Enter triggers Play Again. Listener is
  // only active while the banner is on-screen so we don't intercept keys
  // during normal gameplay.
  useEffect(() => {
    if (!showWinBanner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setBannerDismissed(true);
      } else if (e.key === "Enter") {
        e.preventDefault();
        startWithSeed(randomSeed());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showWinBanner, startWithSeed]);

  // Loss/draw banner keyboard parity: Esc dismisses, Enter replays the
  // *same* seed so the user can immediately retry the round they just
  // lost. Mirrors the win-banner handler above so behaviour stays
  // consistent across end states.
  useEffect(() => {
    if (!showLossBanner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setBannerDismissed(true);
      } else if (e.key === "Enter") {
        e.preventDefault();
        startWithSeed(seed);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showLossBanner, startWithSeed, seed]);

  // Esc closes the info popover (taking precedence over pause toggle so
  // the popover always wins when both are dismissable).
  useEffect(() => {
    if (!infoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setInfoOpen(false);
        infoButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [infoOpen]);

  // Esc toggles pause while the game is in progress and no other modal
  // surface is consuming the key. We avoid binding when typing into a
  // form field so users editing settings or seed inputs aren't surprised.
  useEffect(() => {
    if (phase !== "playing") return;
    if (showWinBanner || infoOpen || helpOpen || tutorialOpen || settingsModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (target?.isContentEditable) return;
      e.preventDefault();
      togglePause();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, showWinBanner, infoOpen, helpOpen, tutorialOpen, settingsModalOpen, togglePause]);

  // Power-user shortcuts: N (new game), R (restart), Shift+R (random seed),
  // D (daily), F (toggle favorite for this game), Shift+F (fullscreen),
  // I (info popover), T (settings popover), = (seed picker). Each handler
  // ignores when typing into a form field or contenteditable surface, when
  // a modifier we don't expect is pressed, and when a modal/banner is
  // already eating keys. R intentionally skips the "dice" category so it
  // doesn't fight the per-game Roll binding.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl/Cmd/Alt combos belong to the dedicated undo/redo handler or the
      // browser — never steal them here. Shift IS allowed because Shift+R
      // is one of our bindings.
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (target?.isContentEditable) return;
      // Don't fight modal/overlay surfaces — they own their own keys.
      if (showWinBanner || showLossBanner || helpOpen || tutorialOpen || settingsModalOpen) return;
      const key = e.key;
      const lower = key.length === 1 ? key.toLowerCase() : key;
      if (lower === "n" && !e.shiftKey) {
        e.preventDefault();
        void newGame();
        return;
      }
      if (lower === "r" && e.shiftKey) {
        e.preventDefault();
        applyPickedSeed(randomSeed());
        return;
      }
      if (lower === "r" && !e.shiftKey) {
        // Skip dice games — R is the per-game Roll binding there.
        if (plugin.category === "dice") return;
        e.preventDefault();
        void replay();
        return;
      }
      if (lower === "d" && !e.shiftKey) {
        e.preventDefault();
        applyPickedSeed(hashStamp(todayStamp()));
        return;
      }
      if (lower === "f" && e.shiftKey) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      if (lower === "f" && !e.shiftKey) {
        e.preventDefault();
        const nowFav = toggleFavorite(plugin.id);
        track("play.favorite", { gameId: plugin.id, favorited: nowFav });
        pushToast(nowFav ? "Added to favorites" : "Removed from favorites");
        return;
      }
      if (lower === "i" && !e.shiftKey) {
        if (seedPickerOpen) return;
        e.preventDefault();
        setInfoOpen((v) => !v);
        return;
      }
      if (lower === "t" && !e.shiftKey) {
        if (infoOpen || seedPickerOpen) return;
        e.preventDefault();
        setSettingsModalOpen((v) => !v);
        return;
      }
      if (key === "=" || key === "+") {
        e.preventDefault();
        setSeedPickerOpen(true);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    plugin.category,
    plugin.id,
    showWinBanner,
    showLossBanner,
    helpOpen,
    tutorialOpen,
    settingsModalOpen,
    infoOpen,
    seedPickerOpen,
    newGame,
    replay,
    applyPickedSeed,
    toggleFullscreen,
    pushToast,
  ]);

  // Delegated sparkle handler — only primary action surfaces (.btn-primary,
  // .play-iconbtn) trigger a burst, so casual UI clicks stay quiet.
  const onPrimaryClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target || typeof target.closest !== "function") return;
    if (target.closest(".btn-primary, .play-iconbtn")) {
      emitSparkles(e.clientX, e.clientY);
    }
  }, []);

  // Per-game CSS-var overrides. When a plugin declares `themeOverrides`, we
  // inject `--theme-felt` / `--theme-accent` / `--theme-bg` directly onto the
  // `.play-page` element (NOT `:root`) so the override stays scoped to this
  // game and the user's ThemePicker selection still owns the rest of the app.
  // Falls back to a categorical default so every game gets a coherent feel.
  const playPageStyle = (() => {
    const ov = plugin.themeOverrides ?? CATEGORY_THEMES[plugin.category];
    if (!ov) return undefined;
    const s: Record<string, string> = {};
    if (ov.feltGradient) s["--theme-felt"] = ov.feltGradient;
    if (ov.accent) s["--theme-accent"] = ov.accent;
    if (ov.bgGradient) s["--theme-bg"] = ov.bgGradient;
    return s as React.CSSProperties;
  })();

  return (
    <div
      className="play-page"
      data-game-id={plugin.id}
      onClick={onPrimaryClick}
      style={playPageStyle}
    >
      <PageHead
        title={`Play ${plugin.title}`}
        description={`Play ${plugin.title} free online — ${plugin.description}`}
        canonical={`https://cards.waterburp.com/play/${plugin.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: plugin.title,
          description: plugin.description,
          genre: plugin.category,
          applicationCategory: "Game",
          operatingSystem: "Web Browser",
          url: `https://cards.waterburp.com/play/${plugin.id}`,
          numberOfPlayers: { "@type": "QuantitativeValue", minValue: plugin.players.min, maxValue: plugin.players.max },
          isAccessibleForFree: true,
          publisher: { "@type": "Organization", name: "Cards and Such" },
        }}
      />
      <header className="play-header">
        <div className="play-header-titleblock">
          <div className="play-header-titlerow">
            <span className={`play-category play-category--${plugin.category}`}>{plugin.category}</span>
            <h1>{plugin.title}</h1>
            <button
              ref={infoButtonRef}
              type="button"
              className="play-info-btn"
              onClick={() => setInfoOpen((v) => !v)}
              aria-label="Session info"
              aria-expanded={infoOpen}
              aria-haspopup="dialog"
              data-testid="play-info-btn"
              title="Session info"
            >
              <span aria-hidden="true">i</span>
            </button>
            {infoOpen && (
              <div
                ref={infoPopoverRef}
                className="play-info-popover"
                role="dialog"
                aria-modal="true"
                aria-label="Session info"
                data-testid="play-info-popover"
                tabIndex={-1}
              >
                <div className="play-info-popover-row">
                  <span className="play-info-label">Seed</span>
                  <code>{seed}</code>
                </div>
                <div className="play-info-popover-row">
                  <span className="play-info-label">Started</span>
                  <span>
                    {sessionStartRef.current
                      ? sessionStartRef.current.toLocaleTimeString()
                      : "—"}
                  </span>
                </div>
                <div className="play-info-popover-row">
                  <span className="play-info-label">Plays this session</span>
                  <span>{sessionPlays}</span>
                </div>
                <div className="play-info-popover-section">
                  <span className="play-info-label">Time trend</span>
                  <TimeTrendChart history={timeHistory} />
                </div>
                <details className="play-info-popover-section play-action-log-details">
                  <summary className="play-info-label" style={{ cursor: "pointer" }}>
                    Action log ({actionLog.length})
                  </summary>
                  <ol
                    className="play-action-log"
                    data-testid="play-action-log"
                    style={{
                      margin: "6px 0 0",
                      padding: 0,
                      listStyle: "none",
                      fontSize: 12,
                      maxHeight: 160,
                      overflowY: "auto",
                    }}
                  >
                    {actionLog.length === 0 && (
                      <li style={{ opacity: 0.6 }}>No actions yet.</li>
                    )}
                    {actionLog
                      .slice()
                      .reverse()
                      .map((entry) => (
                        <li
                          key={entry.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 8,
                            padding: "2px 0",
                          }}
                        >
                          <code style={{ flex: "1 1 auto", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {entry.type}
                          </code>
                          <span style={{ flex: "0 0 auto", opacity: 0.7 }}>
                            {new Date(entry.ts).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                  </ol>
                </details>
                {plugin.howToPlay && (
                  <button
                    type="button"
                    className="play-info-link"
                    onClick={() => {
                      setInfoOpen(false);
                      setHelpOpen(true);
                    }}
                  >
                    How to play
                  </button>
                )}
                <button
                  type="button"
                  className="play-info-close"
                  onClick={() => {
                    setInfoOpen(false);
                    infoButtonRef.current?.focus();
                  }}
                  aria-label="Close session info"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="play-header-actions">
          {(phase === "playing" || phase === "ended") && (
            <span
              className={`play-timer${paused ? " play-timer--paused" : ""}`}
              data-testid="play-timer"
              title={paused ? "Paused" : "Elapsed time"}
              aria-label={`Elapsed time ${formatTime(elapsed)}${paused ? " (paused)" : ""}`}
            >
              <span className="play-timer-current" data-testid="play-timer-current">
                {formatTime(elapsed)}
              </span>
              {bestTime != null && (
                <span
                  className="play-timer-best"
                  data-testid="play-timer-best"
                  title="Personal best"
                >
                  {t("hud.best")} {formatTime(bestTime)}
                </span>
              )}
            </span>
          )}
          {phase === "playing" && (
            <button
              type="button"
              className="play-iconbtn play-pause-btn"
              onClick={togglePause}
              aria-label={paused ? "Resume" : "Pause"}
              aria-pressed={paused}
              title={paused ? "Resume (Esc)" : "Pause (Esc)"}
              data-tooltip={paused ? "Resume" : "Pause"}
              data-testid="play-pause-btn"
            >
              {paused ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false">
                  <path d="M6 4l14 8-14 8z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </button>
          )}
          {phase === "playing" && showProminentSeed && (
            <span
              className="play-seed-display"
              data-testid="seed-display"
              title="Current deal seed"
              aria-label={`Current deal seed ${seed}`}
            >
              #{seed}
            </span>
          )}
          {phase === "playing" && (
            <span className="play-seed-pick-wrap">
              <button
                ref={seedPickerBtnRef}
                type="button"
                className="play-iconbtn play-seed-pick-btn"
                onClick={() => setSeedPickerOpen((v) => !v)}
                title="Pick seed"
                aria-label="Pick seed"
                aria-haspopup="dialog"
                aria-expanded={seedPickerOpen}
                data-tooltip="Pick seed"
                data-testid="play-seed-pick-btn"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="2.5"></circle>
                  <path d="M19 12a7 7 0 0 0-.1-1.2l1.7-1.3-1.5-2.6-2 .8a7 7 0 0 0-2-1.2l-.3-2.1h-3l-.3 2.1a7 7 0 0 0-2 1.2l-2-.8L6 9.5l1.7 1.3A7 7 0 0 0 7.6 12a7 7 0 0 0 .1 1.2L6 14.5l1.5 2.6 2-.8a7 7 0 0 0 2 1.2l.3 2.1h3l.3-2.1a7 7 0 0 0 2-1.2l2 .8 1.5-2.6L19 13.2A7 7 0 0 0 19 12z"></path>
                </svg>
              </button>
              {seedPickerOpen && (
                <div
                  ref={seedPickerRef}
                  className="play-seed-picker"
                  role="dialog"
                  aria-label="Pick seed"
                  data-testid="play-seed-picker"
                >
                  <div className="play-seed-picker-row">
                    <label className="play-seed-picker-label" htmlFor="play-seed-input">
                      Seed
                    </label>
                    <div className="play-seed-picker-input-row">
                      <input
                        id="play-seed-input"
                        className="play-seed-input"
                        data-testid="play-seed-input"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        value={seedDraft}
                        onChange={(e) => setSeedDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const n = Number.parseInt(seedDraft, 10);
                            applyPickedSeed(Number.isFinite(n) && !Number.isNaN(n) ? n : seed);
                          }
                        }}
                      />
                      <span className="play-seed-stepper">
                        <button
                          type="button"
                          className="play-seed-step-btn"
                          onClick={() => stepSeed(1)}
                          aria-label="Increment seed"
                          title="Increment seed"
                          data-testid="play-seed-step-up"
                        >
                          {"▲"}
                        </button>
                        <button
                          type="button"
                          className="play-seed-step-btn"
                          onClick={() => stepSeed(-1)}
                          aria-label="Decrement seed"
                          title="Decrement seed"
                          data-testid="play-seed-step-down"
                        >
                          {"▼"}
                        </button>
                      </span>
                    </div>
                  </div>
                  <div className="play-seed-picker-actions">
                    <button
                      type="button"
                      className="play-seed-picker-action"
                      onClick={() => {
                        const r = randomSeed();
                        setSeedDraft(String(r));
                        applyPickedSeed(r);
                      }}
                      data-testid="play-seed-random"
                    >
                      Random
                    </button>
                    <button
                      type="button"
                      className="play-seed-picker-action"
                      onClick={() => {
                        const ds = hashStamp(todayStamp());
                        setSeedDraft(String(ds));
                        applyPickedSeed(ds);
                      }}
                      data-testid="play-seed-daily"
                    >
                      Daily
                    </button>
                    <button
                      type="button"
                      className="play-seed-picker-action play-seed-picker-apply"
                      onClick={() => {
                        const n = Number.parseInt(seedDraft, 10);
                        applyPickedSeed(Number.isFinite(n) && !Number.isNaN(n) ? n : seed);
                      }}
                      data-testid="play-seed-apply"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </span>
          )}
          {/* Primary toolbar group: high-frequency in-game actions
              (undo / redo / hint / restart). Always visible — both desktop
              and mobile — because these are the controls players reach for
              every move. Restart lives here too so a quick reset is one
              tap away on phones. */}
          <div className="play-toolbar-group play-toolbar-primary" data-testid="play-toolbar-primary">
          {phase === "playing" && (
            <button
              type="button"
              className="play-iconbtn play-undo-btn"
              onClick={undo}
              disabled={undoStack.length === 0}
              title={undoStack.length === 0 ? "Nothing to undo" : "Undo (Ctrl+Z)"}
              aria-label={
                showUndoCount
                  ? `Undo, ${undoStack.length} step${undoStack.length === 1 ? "" : "s"} available`
                  : "Undo"
              }
              aria-keyshortcuts="Control+Z Meta+Z"
              data-tooltip="Undo"
              data-testid="play-undo-btn"
            >
              <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>⟲</span>
              {showUndoCount && (
                <span className="play-hint-btn-label" data-testid="play-undo-btn-label">
                  Undo ({undoStack.length})
                </span>
              )}
            </button>
          )}
          {phase === "playing" && (
            <button
              type="button"
              className="play-iconbtn play-redo-btn"
              onClick={redo}
              disabled={redoStack.length === 0}
              title={redoStack.length === 0 ? "Nothing to redo" : "Redo (Ctrl+Shift+Z / Ctrl+Y)"}
              aria-label={
                showUndoCount
                  ? `Redo, ${redoStack.length} step${redoStack.length === 1 ? "" : "s"} available`
                  : "Redo"
              }
              aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y Meta+Y"
              data-tooltip="Redo"
              data-testid="play-redo-btn"
            >
              <span aria-hidden="true" style={{ fontSize: 16, lineHeight: 1 }}>↻</span>
              {showUndoCount && (
                <span className="play-hint-btn-label" data-testid="play-redo-btn-label">
                  Redo ({redoStack.length})
                </span>
              )}
            </button>
          )}
          {phase === "playing" && hintsEnabled && (
            <button
              type="button"
              className="play-iconbtn play-hint-btn"
              onClick={showHint}
              disabled={!plugin.hint || (hintCooldownEnabled && hintCooldown > 0)}
              // Drop the redundant title="Hint" — the inline label below
              // already says "Hint", so a native tooltip with the same
              // word just renders a floating duplicate. Surface the
              // cooldown / unavailable cases via title so it ADDS info.
              title={
                !plugin.hint
                  ? "No hint available for this game"
                  : hintCooldownEnabled && hintCooldown > 0
                    ? `Ready in ${hintCooldown}s`
                    : undefined
              }
              aria-label={
                hintCooldownEnabled && hintCooldown > 0
                  ? `Hint, available in ${hintCooldown} seconds`
                  : "Hint"
              }
              data-tooltip="Hint"
              data-testid="play-hint-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
                <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"></path>
              </svg>
              <span className="play-hint-btn-label">
                {hintCooldownEnabled && hintCooldown > 0 ? `${hintCooldown}s` : "Hint"}
              </span>
            </button>
          )}
          {phase === "playing" && (
            <button
              type="button"
              className="play-iconbtn"
              onClick={replay}
              title="Restart"
              aria-label="Restart"
              data-tooltip="Restart"
              data-testid="play-restart-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
          )}
          </div>
          {/* Mobile-only overflow toggle. CSS hides the button on viewports
              ≥ 600px and forces the secondary group open inline; below that
              the button reveals the secondary group as a small popover. */}
          {phase === "playing" && (
            <button
              ref={overflowBtnRef}
              type="button"
              className="play-iconbtn play-overflow-btn"
              onClick={() => setOverflowOpen((v) => !v)}
              aria-label="More actions"
              aria-haspopup="menu"
              aria-expanded={overflowOpen}
              data-tooltip="More"
              data-testid="play-overflow-btn"
            >
              <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, letterSpacing: 1 }}>•••</span>
            </button>
          )}
          {/* Secondary toolbar group: lower-frequency actions
              (share / friend / help / settings / setup / fullscreen) that
              players reach for occasionally. Collapsed behind the ••• menu
              on phones; rendered inline on tablet/desktop. */}
          <div
            ref={overflowMenuRef}
            className="play-toolbar-group play-toolbar-secondary"
            data-testid="play-toolbar-secondary"
            data-overflow-open={overflowOpen ? "true" : "false"}
            role="menu"
          >
          {phase === "playing" && (
            <button
              className="play-iconbtn play-share-btn"
              onClick={() => { void shareSeed(); }}
              title={shareStatus === "copied" ? "Seed URL copied!" : "Share seed"}
              aria-label="Share seed"
              data-tooltip={shareStatus === "copied" ? "Copied!" : "Share seed"}
              data-testid="share-seed-btn"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </button>
          )}
          {phase === "playing" && plugin.players.multiplayer && (
            <button
              type="button"
              className="play-iconbtn play-friend-btn"
              onClick={() => { void shareFriendLink(); }}
              title="Play with a friend (copies seeded link)"
              aria-label="Play with a friend"
              data-tooltip="Play with a friend"
              data-testid="play-friend-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="play-hint-btn-label">Friend</span>
            </button>
          )}
          {(plugin.howToPlay || hasExplicitTutorial) && phase === "playing" && (
            <button
              className="play-iconbtn"
              onClick={() => {
                // Prefer the bespoke per-game tutorial when one exists.
                // The categorical fallback added by tutorialFor(id, category)
                // is too generic to surface from the Help button; defer to
                // the HowToPlay modal in that case.
                if (hasExplicitTutorial && tutorialSteps && tutorialSteps.length > 0) setTutorialOpen(true);
                else setHelpOpen(true);
              }}
              title="How to play"
              aria-label="How to play"
              data-tooltip="How to play"
              data-testid="help-btn"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.5 9.5a2.5 2.5 0 1 1 4.5 1.5c-.7.6-2 1.2-2 2.5"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </button>
          )}
          {phase === "playing" && Object.keys(plugin.settings).length > 0 && (
            <button
              ref={settingsButtonRef}
              className={`play-iconbtn play-settings-btn${settingsDirty ? " play-settings-btn--dirty" : ""}`}
              onClick={() => setSettingsModalOpen((v) => !v)}
              title="Game settings"
              aria-label="Game settings"
              aria-haspopup="dialog"
              aria-expanded={settingsModalOpen}
              data-tooltip="Settings"
              data-testid="play-settings-btn"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              {settingsDirty && (
                <span
                  className="play-settings-dot"
                  aria-hidden="true"
                  data-testid="play-settings-dirty-dot"
                />
              )}
            </button>
          )}
          {phase === "playing" && (
            <button
              className="play-iconbtn"
              onClick={() => setPhase("setup")}
              title="Setup screen"
              aria-label="Setup screen"
              data-tooltip="Setup"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M3 6h18"></path>
                <path d="M3 12h18"></path>
                <path d="M3 18h18"></path>
              </svg>
            </button>
          )}
          {phase === "playing" && (
            <button
              type="button"
              className="play-iconbtn play-fullscreen-btn"
              onClick={toggleFullscreen}
              title="Fullscreen"
              aria-label="Fullscreen"
              data-tooltip="Fullscreen"
              data-testid="play-fullscreen-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M4 9V4h5"></path>
                <path d="M20 9V4h-5"></path>
                <path d="M4 15v5h5"></path>
                <path d="M20 15v5h-5"></path>
              </svg>
            </button>
          )}
          </div>
          <Link to="/" className="play-backbtn" title="Back to lobby" aria-label="Back to lobby">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>{t("nav.lobby")}</span>
          </Link>
        </div>
      </header>

      {phase === "playing" && progress && (
        <div
          className="play-progress-row"
          data-testid="play-progress"
          style={{ margin: "0 0 1rem" }}
        >
          <ProgressBar
            value={progress.value}
            max={progress.max}
            label={progress.label}
            testId="play-progress-bar"
          />
        </div>
      )}

      {plugin.howToPlay && (
        <HowToPlayModal
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          title={plugin.title}
          text={plugin.howToPlay}
          pluginId={plugin.id}
          category={plugin.category}
        />
      )}

      {settingsModalOpen && (
        <div
          className="play-settings-backdrop"
          onClick={() => {
            setSettingsModalOpen(false);
            settingsButtonRef.current?.focus();
          }}
          role="presentation"
          data-testid="play-settings-backdrop"
        >
          <div
            ref={settingsModalRef}
            className="play-settings-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${plugin.title} settings`}
            data-testid="play-settings-modal"
            tabIndex={-1}
          >
            <header className="play-settings-modal-header">
              <h2 className="play-settings-modal-title">{plugin.title} settings</h2>
              <button
                type="button"
                className="play-settings-close"
                onClick={() => {
                  setSettingsModalOpen(false);
                  settingsButtonRef.current?.focus();
                }}
                aria-label="Close settings"
                data-testid="play-settings-close"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            {Object.keys(plugin.settings).length === 0 ? (
              <p className="play-settings-empty" data-testid="play-settings-empty">
                This game has no configurable settings.
              </p>
            ) : (
              <div className="play-settings-fields">
                {Object.entries(plugin.settings).map(([key, field]) => {
                  const testId = `play-setting-${key}`;
                  if (field.kind === "boolean") {
                    const checked = (settings as Record<string, boolean>)[key] === true;
                    return (
                      <label
                        key={key}
                        className="play-settings-row play-settings-row--bool"
                      >
                        <span className="play-settings-label">{field.label}</span>
                        <span
                          className={`play-settings-toggle${checked ? " is-on" : ""}`}
                        >
                          <input
                            type="checkbox"
                            data-testid={testId}
                            checked={checked}
                            onChange={(e) =>
                              setSettings((s) =>
                                ({ ...s, [key]: e.target.checked }) as typeof s,
                              )
                            }
                          />
                          <span className="play-settings-toggle-thumb" aria-hidden="true" />
                        </span>
                      </label>
                    );
                  }
                  if (field.kind === "number") {
                    const value = (settings as Record<string, number>)[key];
                    return (
                      <label key={key} className="play-settings-row">
                        <span className="play-settings-label">{field.label}</span>
                        <input
                          type="number"
                          data-testid={testId}
                          min={field.min}
                          max={field.max}
                          step={field.step ?? 1}
                          value={Number.isFinite(value) ? value : field.default}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            if (!Number.isFinite(next)) return;
                            setSettings((s) => ({ ...s, [key]: next }) as typeof s);
                          }}
                        />
                      </label>
                    );
                  }
                  // kind === "enum" → select dropdown
                  const value = String((settings as Record<string, string>)[key]);
                  return (
                    <label key={key} className="play-settings-row">
                      <span className="play-settings-label">{field.label}</span>
                      <select
                        data-testid={testId}
                        value={value}
                        onChange={(e) =>
                          setSettings((s) =>
                            ({ ...s, [key]: e.target.value }) as typeof s,
                          )
                        }
                      >
                        {field.options.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                })}
              </div>
            )}

            {settingsDirty && (
              <div
                className="play-settings-banner"
                role="status"
                aria-live="polite"
                data-testid="play-settings-restart-banner"
              >
                <span>Restart to apply</span>
                <button
                  type="button"
                  className="play-settings-restart-btn"
                  onClick={() => {
                    setSettingsModalOpen(false);
                    void replay();
                  }}
                  data-testid="play-settings-restart-now"
                >
                  Restart now
                </button>
              </div>
            )}

            <footer className="play-settings-footer">
              <button
                type="button"
                className="play-settings-reset"
                onClick={() => setSettings(defaultsOf(plugin.settings))}
                data-testid="play-settings-reset"
              >
                Reset to defaults
              </button>
              {plugin.howToPlay && (
                <button
                  type="button"
                  className="play-settings-howto"
                  onClick={() => {
                    setSettingsModalOpen(false);
                    setHelpOpen(true);
                  }}
                  data-testid="play-settings-howto"
                >
                  How to play
                </button>
              )}
            </footer>
          </div>
        </div>
      )}

      {phase === "setup" && (
        <section className="setup-panel" data-testid="setup-panel">
          {plugin.howToPlay && <HowToPlayContent text={plugin.howToPlay} />}
          <SettingsForm
            schema={plugin.settings}
            values={settings}
            onChange={(k, v) => setSettings((s) => ({ ...s, [k]: v } as typeof s))}
          />
          <button onClick={start} className="start-btn" data-testid="start-game">Start playing</button>
        </section>
      )}

      {phase === "playing" && friendMode && plugin.players.multiplayer && (
        <div
          className="play-friend-banner"
          data-testid="play-friend-banner"
          role="status"
          aria-live="polite"
        >
          Friend mode — same seed, you both see the same hand. Take turns and
          compare scores.
          {(() => {
            // Compress the current {gameId, seed & 0xffff} into a 6-char
            // friend code so it can be read aloud or texted instead of a
            // full URL. encodeChallenge returns null when the game isn't
            // in the dictionary; we just hide the line in that case.
            const code = encodeChallenge({
              gameId: plugin.id,
              seed: seed & MAX_FRIEND_SEED,
            });
            if (!code) return null;
            return (
              <>
                {" "}
                Or share this code:{" "}
                <button
                  type="button"
                  className="play-friend-code"
                  data-testid="play-friend-code"
                  title="Copy friend code"
                  aria-label={`Copy friend code ${code}`}
                  onClick={() => {
                    track("friend.copy_code", { gameId: plugin.id });
                    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                      void navigator.clipboard
                        .writeText(code)
                        .then(() => pushToast(`Code copied: ${code}`))
                        .catch(() => pushToast("Could not copy code"));
                    } else {
                      pushToast(code);
                    }
                  }}
                >
                  <code>{code}</code>
                </button>
              </>
            );
          })()}
          {(() => {
            // Render a small QR code of the friend URL so a phone can
            // scan straight into the seeded game. Encoder caps at QR
            // version 10 (~213 byte chars) which comfortably fits the
            // canonical share URL format.
            const origin =
              typeof window !== "undefined" && window.location && window.location.origin
                ? window.location.origin
                : "https://cards.waterburp.com";
            const url = `${origin}/play/${plugin.id}?seed=${seed}&friend=1`;
            const qr = encodeQrModules(url);
            if (!qr) return null;
            const px = 3;
            const margin = 2;
            const total = (qr.size + margin * 2) * px;
            const rects: JSX.Element[] = [];
            for (let r = 0; r < qr.size; r++) {
              const row = qr.modules[r];
              if (!row) continue;
              for (let c = 0; c < qr.size; c++) {
                if (!row[c]) continue;
                rects.push(
                  <rect
                    key={`${r}-${c}`}
                    x={(c + margin) * px}
                    y={(r + margin) * px}
                    width={px}
                    height={px}
                    fill="#000"
                  />,
                );
              }
            }
            return (
              <svg
                className="play-friend-qr"
                data-testid="play-friend-qr"
                role="img"
                aria-label={`QR code for ${url}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${total} ${total}`}
                width={total}
                height={total}
                shapeRendering="crispEdges"
              >
                <title>Scan to open this seeded game on another device</title>
                <rect width={total} height={total} fill="#fff" />
                {rects}
              </svg>
            );
          })()}
        </div>
      )}

      {phase === "playing" && (
        <div className="play-with-sidebar">
          <section
            ref={playPanelRef}
            className={`play-panel play-board${paused ? " play-panel--paused" : ""}${shakeKey > 0 ? (shakeKey % 2 === 0 ? " play-board--shake-a" : " play-board--shake-b") : ""}`}
          >
            {/* Suspense fallback shows a skeleton "loading game…" card while
                the active plugin's component module finishes loading. Most
                plugins are eagerly imported today, but games that use
                React.lazy or trigger a suspending data read still benefit
                here, and the boundary keeps render-time fallbacks scoped
                to the play panel rather than blanking the whole page.
                We also explicitly guard for an undefined `plugin.component`
                — a registry entry that's still resolving its import will
                hand us `undefined`, in which case rendering the skeleton
                directly avoids tripping React with `<undefined />`. */}
            {plugin.component ? (
              <ErrorBoundary
                scope="play-surface"
                title="This game hit a snag"
                hint="The play surface crashed, but the rest of the app is still running. Reload to try again or report the bug below."
              >
                <Suspense fallback={<GameLoadingSkeleton gameTitle={plugin.title} />}>
                  {/* Keyed by plugin.id so the mount fade-in fires fresh on every
                      game switch. `data-game` exposes the id for engines/CSS
                      to scope per-game tweaks. */}
                  <div className="game-mount fade-in" key={plugin.id} data-game={plugin.id}>
                    <plugin.component state={state} settings={settings} dispatch={dispatch} onGameOver={onGameOver} seed={seed} />
                  </div>
                </Suspense>
              </ErrorBoundary>
            ) : (
              <GameLoadingSkeleton gameTitle={plugin.title} />
            )}
            {paused && (
              <div className="play-paused-overlay" data-testid="play-paused-overlay" role="status" aria-live="polite">
                <div className="play-paused-card">
                  <div className="play-paused-title">Paused</div>
                  <div className="play-paused-hint">Press <kbd>Esc</kbd> or click Resume</div>
                  <button
                    type="button"
                    className="play-share-pill"
                    onClick={togglePause}
                  >
                    Resume
                  </button>
                </div>
              </div>
            )}
          </section>
          <StatsPanel gameId={plugin.id} bestTime={bestTime} />
        </div>
      )}

      {phase === "playing" && toasts.length > 0 && (
        <div
          className="play-toasts"
          data-testid="play-toasts"
          role="status"
          aria-live="polite"
        >
          {toasts.map((toast, idx) => (
            <div
              key={toast.id}
              className="play-toast"
              data-testid={`play-toast-${idx}`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}

      {playAchievementToast && (
        <button
          type="button"
          className="play-achievement-toast"
          data-testid="play-achievement-toast"
          role="status"
          aria-live="polite"
          aria-label={`Achievement unlocked: ${playAchievementToast.title}. ${playAchievementToast.description}. Press to dismiss.`}
          title={playAchievementToast.description}
          onClick={() => {
            // Tap to dismiss — useful on touch where the 5s auto-hide
            // can feel slow once the user has already seen the unlock.
            // Cancels the pending timer so a queued setState doesn't try
            // to clobber state on an already-dismissed toast.
            if (achievementToastTimerRef.current) {
              clearTimeout(achievementToastTimerRef.current);
              achievementToastTimerRef.current = null;
            }
            setPlayAchievementToast(null);
          }}
        >
          <span className="play-achievement-toast-sparkle" aria-hidden="true">
            ✨
          </span>
          <span className="play-achievement-toast-text">
            Achievement unlocked: {playAchievementToast.title}
          </span>
          <span className="play-achievement-toast-sparkle" aria-hidden="true">
            ✨
          </span>
        </button>
      )}

      {phase === "playing" && tutorialOpen && tutorialSteps && tutorialSteps.length > 0 && (
        <Tutorial
          steps={tutorialSteps}
          onComplete={() => {
            setTutorialOpen(false);
            markTutorialSeen(plugin.id);
          }}
          onSkip={() => {
            setTutorialOpen(false);
            markTutorialSeen(plugin.id);
          }}
        />
      )}

      {showWinBanner && (
        <div
          className="win-banner-backdrop"
          data-testid="win-banner-backdrop"
          onClick={() => setBannerDismissed(true)}
          role="presentation"
        />
      )}

      {showLossBanner && (
        <div
          className="win-banner-backdrop loss-banner-backdrop"
          data-testid="loss-banner-backdrop"
          onClick={() => setBannerDismissed(true)}
          role="presentation"
        />
      )}

      {phase === "ended" && finalScore !== null && (
        <section
          className={`end-panel${isWin ? " end-panel--win" : ""}${isLoss ? " end-panel--loss" : ""}${(showWinBanner || showLossBanner) ? " end-panel--banner" : ""}`}
          data-testid="end-panel"
          data-win={isWin ? "true" : "false"}
          role={(showWinBanner || showLossBanner) ? "dialog" : undefined}
          aria-modal={(showWinBanner || showLossBanner) ? "true" : undefined}
          aria-label={showWinBanner ? "You won" : showLossBanner ? "Game over" : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {isWin ? (
            <div className="win-banner-headline" data-testid="win-banner">
              <span className="win-banner-emoji" aria-hidden="true">🎉</span>
              <h2 className="win-banner-title">You won!</h2>
              <span className="win-banner-emoji" aria-hidden="true">🎉</span>
            </div>
          ) : (
            <div
              className="loss-banner-headline"
              data-testid="end-banner-loss"
              role="status"
              aria-live="polite"
            >
              <h2 className="loss-banner-title">{t("hud.game_over")}</h2>
              <p
                className="loss-banner-encouragement"
                data-testid="end-banner-loss-encouragement"
              >
                {lossEncouragement}
              </p>
            </div>
          )}

          <div
            className={`final-score${isWin ? " final-score--win" : ""}`}
            data-testid="final-score"
            aria-label={`Final score ${finalScore}`}
          >
            {finalScore}
          </div>
          <div className="final-score-label">{t("hud.score")}</div>

          <dl className="end-stats" data-testid="end-stats">
            <div className="end-stats-row">
              <dt>{t("hud.time")}</dt>
              <dd data-testid="end-stats-time">{formatTime(elapsed)}</dd>
            </div>
            {isWin && (
              <div className="end-stats-row">
                <dt>{t("hud.best")}</dt>
                <dd data-testid="end-stats-best">
                  {bestTime != null ? formatTime(bestTime) : "—"}
                  {isNewRecord && (
                    <span className="end-stats-record" data-testid="end-stats-record">
                      New record!
                      {previousBest != null && (
                        <span className="end-stats-prev"> (was {formatTime(previousBest)})</span>
                      )}
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>

          <div className="end-seed" data-testid="end-seed">Seed: <code>{seed}</code></div>

          <div className="end-actions">
            <button
              onClick={newGame}
              className="play-again-btn play-again-btn--big"
              data-testid="new-game-btn"
              autoFocus={showWinBanner}
            >
              {t("hud.new_game")}
            </button>
            <button
              onClick={replay}
              className="play-again-btn play-replay-btn play-again-btn--big"
              data-testid="replay-btn"
              autoFocus={showLossBanner}
            >
              {t("hud.replay")}
            </button>
            <Link
              to="/"
              className="play-share-pill end-back-btn"
              data-testid="end-back-btn"
            >
              {t("nav.lobby")}
            </Link>
          </div>

          <div className="end-share-row" data-testid="end-share-row">
            <button
              type="button"
              onClick={shareToTwitter}
              className="play-share-pill end-share-twitter"
              data-testid="end-share-twitter"
              aria-label="Share on Twitter"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" focusable="false">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Tweet
            </button>
            <button
              type="button"
              onClick={() => { void shareSeed(); }}
              className="play-share-pill"
              data-testid="share-seed-end-btn"
            >
              {shareStatus === "copied" ? "Copied!" : shareStatus === "error" ? "Copy failed" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={shareImage}
              className="play-share-pill play-share-image-btn"
              data-testid="play-share-image-btn"
              aria-label="Download share image"
              title="Download a 1200×630 share card"
            >
              Save image
            </button>
            <button
              type="button"
              onClick={printScoresheet}
              className="play-share-pill play-print-btn"
              data-testid="play-print-btn"
              aria-label="Print scoresheet"
              title="Print a clean scoresheet"
            >
              Print
            </button>
            {isWin && (
              <button
                type="button"
                onClick={() => {
                  saveReplay({
                    gameId: plugin.id,
                    seed,
                    actions: replayBufferRef.current,
                  });
                  setReplaySaved(true);
                  track("play.replay_saved", { gameId: plugin.id, seed });
                }}
                className="play-share-pill"
                data-testid="play-save-replay"
                aria-label="Save replay"
                title="Store this game's seed and recent actions to your replays"
              >
                {replaySaved ? "Replay saved" : "Save replay"}
              </button>
            )}
          </div>

          <StatsPanel gameId={plugin.id} bestTime={bestTime} />
          <EndRatingBlock
            rating={rating}
            onRate={onRate}
            title={plugin.title}
          />

          {showWinBanner && (
            <p className="win-banner-hint" data-testid="win-banner-hint">
              Press <kbd>Enter</kbd> to play again, <kbd>Esc</kbd> to dismiss
            </p>
          )}
          {showLossBanner && (
            <p
              className="win-banner-hint loss-banner-hint"
              data-testid="loss-banner-hint"
            >
              Press <kbd>Enter</kbd> to replay, <kbd>Esc</kbd> to dismiss
            </p>
          )}
        </section>
      )}

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  );
}

/**
 * "Rate this game" block on the win/end screen. New ratings show the
 * 5-star widget; once the user has rated, we shrink to a static
 * read-only display with an "Update" link that pops the editor back so
 * they can tweak without losing the original value.
 *
 * The StarRating widget itself owns the brief "Saved" toast that fires
 * after each commit — this component only handles the show/edit
 * state and the prompt copy.
 */
function EndRatingBlock({
  rating,
  onRate,
  title,
}: {
  rating: number;
  onRate: (next: number) => void;
  title: string;
}): JSX.Element {
  const [editing, setEditing] = useState(rating === 0);
  // Keep the editor open after a fresh rate so the StarRating's
  // built-in "Saved" toast can play in-place; the parent state already
  // tracks the value, but we don't want to immediately collapse the
  // widget on the same render that fired the change.
  const handle = useCallback(
    (next: number) => {
      onRate(next);
      // Closing on 0 (cleared) returns the user to the prompt; any
      // ≥ 1 rating leaves the editor visible long enough for the
      // saved-toast to surface, then the user can step away on their
      // own — they're not forced into an extra click cycle.
      if (next === 0) setEditing(true);
    },
    [onRate],
  );
  const showEditor = editing || rating === 0;
  return (
    <div className="end-rating" data-testid="end-rating">
      <p className="end-rating-prompt">Rate this game</p>
      {showEditor ? (
        <StarRating
          value={rating}
          onChange={handle}
          testId="end-rating-stars"
          ariaLabel={`Rate ${title}`}
        />
      ) : (
        <>
          <StarRating
            value={rating}
            readOnly
            testId="end-rating-stars-readonly"
            ariaLabel={`Your rating for ${title}: ${rating} of 5 stars`}
          />
          <p className="end-rating-thanks" data-testid="end-rating-thanks">
            You rated this {rating} star{rating === 1 ? "" : "s"}.{" "}
            <button
              type="button"
              className="end-rating-update"
              onClick={() => setEditing(true)}
              data-testid="end-rating-update"
            >
              Update
            </button>
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Pool of bite-sized "tip of the day" lines surfaced under the loading
 * skeleton. Twelve entries so a date-seeded index lands on a stable choice
 * for the whole calendar day — refreshing the page won't churn the tip
 * mid-load and confuse anyone who was reading it.
 */
const PLAY_LOADING_TIPS: readonly string[] = [
  "Tip: Press ? on most games to peek the rules without leaving play.",
  "Tip: Star a game from the lobby to pin it to your favorites row.",
  "Tip: Daily challenges share the same seed worldwide — race friends fairly.",
  "Tip: Most games remember your last settings — tweak once, play often.",
  "Tip: Replays auto-save locally; revisit them from the Stats panel.",
  "Tip: Tap and hold a card in many games for a closer look.",
  "Tip: Hit Esc to bail out of a turn and rethink without losing progress.",
  "Tip: Achievements unlock as you play — check the Stats panel for hints.",
  "Tip: Use the share button to challenge a friend with the same setup.",
  "Tip: Sound effects can be muted from the gear icon if you're at work.",
  "Tip: Many race games support keyboard shortcuts — try arrow keys first.",
  "Tip: Your time history graphs trends so you can chase a personal best.",
];

/**
 * Suspense fallback shown while a lazily-loaded game component is fetching.
 *
 * Sized to roughly mirror a real play panel — header line, status row,
 * playfield rectangle — so the layout doesn't jump when the real game
 * mounts. Three card-shaped shimmer blocks evoke a fanned deck so users
 * have a visual cue beyond the polite "Loading <gameTitle>…" caption
 * picked up by screen readers. When `gameTitle` is supplied (always the
 * case for routed plays — the URL gameId is resolved against the
 * registry before this skeleton renders) we surface it so the user
 * sees which game is being prepared rather than a generic stand-in.
 *
 * Below the deck we surface a tip line (rotated daily via `todayStamp`'s
 * hash) and a "Still loading…" notice that flips on after 3s if the
 * plugin still hasn't mounted — a gentle reassurance for slow networks
 * without spamming the screen during the common fast-path.
 */
function GameLoadingSkeleton({ gameTitle }: { gameTitle?: string }): JSX.Element {
  const caption = gameTitle ? `Loading ${gameTitle}…` : "Loading game…";
  const tip = useMemo(() => {
    // Seed by date so the tip is stable across reloads within a day —
    // hashStamp is already used for daily-pick determinism elsewhere.
    const idx = hashStamp(todayStamp()) % PLAY_LOADING_TIPS.length;
    return PLAY_LOADING_TIPS[idx];
  }, []);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setStuck(true), 3000);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div
      className="play-game-loading"
      data-testid="play-loading-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="play-game-loading-caption">{caption}</div>
      <div className="play-game-loading-deck" aria-hidden="true">
        <Skeleton variant="rect" className="play-game-loading-card play-game-loading-card--back" />
        <Skeleton variant="rect" className="play-game-loading-card play-game-loading-card--mid" />
        <Skeleton variant="rect" className="play-game-loading-card play-game-loading-card--front" />
      </div>
      <div className="play-game-loading-row">
        <Skeleton variant="text-line" width={80} />
        <Skeleton variant="text-line" width={80} />
        <Skeleton variant="text-line" width={80} />
      </div>
      <div className="play-game-loading-tip" data-testid="play-loading-tip">
        {tip}
      </div>
      {stuck && (
        <div
          className="play-game-loading-stuck"
          data-testid="play-loading-stuck"
          role="alert"
        >
          Still loading…
        </div>
      )}
    </div>
  );
}
