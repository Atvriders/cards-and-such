import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "../platform/Skeleton.js";
import { GAMES } from "../games/registry.js";
import { SettingsForm } from "../platform/game-plugin/settings.js";
import { defaultsOf, type SettingSchema, type SettingsOf } from "../platform/game-plugin/types.js";
import { submitScore } from "../platform/game-plugin/submitScore.js";
import { playSound } from "../platform/sounds.js";
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
import { useFocusTrap } from "../platform/useFocusTrap.js";
import { t } from "../platform/i18n.js";
import "./PlayPage.css";

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
const LS_HINTS_ENABLED = "cards-hints-enabled";
/** Tiny global counter — bumped each time the user copies a friend-mode
 *  link. Pure stats fun, no behavior keys off it. */
const LS_FRIEND_SESSIONS = "cards-friend-sessions";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSeed = parseSeed(searchParams.get("seed"));

  const [settings, setSettings] = useState(() =>
    readGameSettings(plugin.id, plugin.settings),
  );
  const [phase, setPhase] = useState<"setup" | "playing" | "ended">("setup");
  const [seed, setSeed] = useState<number>(() => urlSeed ?? randomSeed());
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
  const [elapsed, setElapsed] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(() => readBestTime(plugin.id));
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
  // Action toast queue. Each push gets a monotonically increasing id so
  // that React keys stay stable as older toasts fall off the front.
  const [toasts, setToasts] = useState<ActionToast[]>([]);
  const toastIdRef = useRef(0);
  // Session metadata for the info popover.
  const [infoOpen, setInfoOpen] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);
  const actionCountRef = useRef(0);
  const infoPopoverRef = useRef<HTMLDivElement | null>(null);
  const infoButtonRef = useRef<HTMLButtonElement | null>(null);
  const playPanelRef = useRef<HTMLElement | null>(null);

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
      return;
    }
    if (!el) return;
    if (typeof el.requestFullscreen === "function") {
      try {
        void el.requestFullscreen();
      } catch {
        /* ignore — user gesture or permission may have been denied */
      }
    }
  }, []);

  // Plays-this-session counter — bumped each time we transition into
  // "playing", never written to localStorage.
  const [sessionPlays, setSessionPlays] = useState(0);
  // Whether the user has enabled hints in Settings → Gameplay. Read once
  // up-front; settings changes don't take effect mid-game.
  const hintsEnabled = useMemo(() => readHintsEnabled(), []);

  useFocusTrap(infoPopoverRef, infoOpen);
  useFocusTrap(settingsModalRef, settingsModalOpen);

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

  const tutorialSteps = useMemo(() => tutorialFor(plugin.id), [plugin.id]);

  // Auto-launch tutorial for first-time visitors of supported games.
  useEffect(() => {
    if (phase !== "playing") return;
    if (!tutorialSteps || tutorialSteps.length === 0) return;
    if (hasSeenTutorial(plugin.id)) return;
    setTutorialOpen(true);
  }, [phase, plugin.id, tutorialSteps]);

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
    setFinalScore(null);
    setElapsed(0);
    setShowConfetti(false);
    setSettingsAtGameStart(JSON.stringify(settings));
    setPhase("playing");
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
      setSeed(nextSeed);
      setState(plugin.initialState(nextSeed, settings));
      setFinalScore(null);
      setElapsed(0);
      setShowConfetti(false);
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
  const confirmIfInProgress = useCallback((): boolean => {
    if (phase !== "playing") return true;
    const inProgress = elapsed > 30 || actionCountRef.current > 5;
    if (!inProgress) return true;
    if (typeof window === "undefined" || typeof window.confirm !== "function") return true;
    return window.confirm("Lose progress?");
  }, [phase, elapsed]);

  const newGame = useCallback(() => {
    if (!confirmIfInProgress()) return;
    startWithSeed(randomSeed());
  }, [startWithSeed, confirmIfInProgress]);

  const replay = useCallback(() => {
    if (!confirmIfInProgress()) return;
    startWithSeed(seed);
  }, [seed, startWithSeed, confirmIfInProgress]);

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
    el.classList.add("hint-pulse");
    const ms = 500 * Math.max(1, target.pulses ?? 3);
    window.setTimeout(() => {
      try {
        el?.classList.remove("hint-pulse");
      } catch {
        /* element may have unmounted */
      }
    }, ms);
  }, [hintsEnabled, plugin, phase, state, pushToast]);

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

  const dispatch = useCallback(
    (action: unknown) => {
      actionCountRef.current += 1;
      const label = describeAction(action);
      if (label) pushToast(label);
      setState((s: unknown) => {
        const next = plugin.reducer(s, action);
        const term = plugin.isTerminal(next);
        if (term) {
          setFinalScore(term.score);
          setPhase("ended");
          setBannerDismissed(false);
          if (term.score > 0) {
            playSound("win");
            const { prev, isRecord } = recordBest(elapsed);
            setPreviousBest(prev);
            setIsNewRecord(isRecord);
            setShowConfetti(true);
          } else {
            setPreviousBest(null);
            setIsNewRecord(false);
          }
          void submitScore(plugin.id, term.score, settings as Record<string, unknown>);
        }
        return next;
      });
    },
    [plugin, settings, elapsed, recordBest, pushToast],
  );

  const onGameOver = useCallback(
    (score: number) => {
      setFinalScore(score);
      setPhase("ended");
      setBannerDismissed(false);
      if (score > 0) {
        playSound("win");
        const { prev, isRecord } = recordBest(elapsed);
        setPreviousBest(prev);
        setIsNewRecord(isRecord);
        setShowConfetti(true);
      } else {
        setPreviousBest(null);
        setIsNewRecord(false);
      }
      void submitScore(plugin.id, score, settings as Record<string, unknown>);
    },
    [plugin.id, settings, elapsed, recordBest],
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
  const showWinBanner = isWin && !bannerDismissed;

  const shareToTwitter = useCallback(() => {
    if (typeof window === "undefined") return;
    const origin = window.location?.origin ?? "https://cards.waterburp.com";
    const url = `${origin}/play/${plugin.id}?seed=${seed}`;
    const text = `I just scored ${finalScore ?? 0} on ${plugin.title} in ${formatTime(elapsed)}!${isNewRecord ? " New personal best!" : ""}`;
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
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

  // Delegated sparkle handler — only primary action surfaces (.btn-primary,
  // .play-iconbtn) trigger a burst, so casual UI clicks stay quiet.
  const onPrimaryClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (!target || typeof target.closest !== "function") return;
    if (target.closest(".btn-primary, .play-iconbtn")) {
      emitSparkles(e.clientX, e.clientY);
    }
  }, []);

  return (
    <div className="play-page" data-game-id={plugin.id} onClick={onPrimaryClick}>
      <PageHead
        title={`Play ${plugin.title}`}
        description={`Play ${plugin.title} free online — ${plugin.description}`}
        canonical={`https://cards.waterburp.com/play/${plugin.id}`}
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
          {phase === "playing" && hintsEnabled && (
            <button
              type="button"
              className="play-iconbtn play-hint-btn"
              onClick={showHint}
              disabled={!plugin.hint}
              title={plugin.hint ? "Hint" : "No hint available for this game"}
              aria-label="Hint"
              data-tooltip="Hint"
              data-testid="play-hint-btn"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M9 18h6"></path>
                <path d="M10 22h4"></path>
                <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2z"></path>
              </svg>
              <span className="play-hint-btn-label">Hint</span>
            </button>
          )}
          {(plugin.howToPlay || tutorialSteps) && phase === "playing" && (
            <button
              className="play-iconbtn"
              onClick={() => {
                if (tutorialSteps && tutorialSteps.length > 0) setTutorialOpen(true);
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
                    replay();
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
        </div>
      )}

      {phase === "playing" && (
        <div className="play-with-sidebar">
          <section
            ref={playPanelRef}
            className={`play-panel play-board${paused ? " play-panel--paused" : ""}`}
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
              <Suspense fallback={<GameLoadingSkeleton />}>
                <plugin.component state={state} settings={settings} dispatch={dispatch} onGameOver={onGameOver} seed={seed} />
              </Suspense>
            ) : (
              <GameLoadingSkeleton />
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

      {phase === "ended" && finalScore !== null && (
        <section
          className={`end-panel${isWin ? " end-panel--win" : ""}${showWinBanner ? " end-panel--banner" : ""}`}
          data-testid="end-panel"
          data-win={isWin ? "true" : "false"}
          role={showWinBanner ? "dialog" : undefined}
          aria-modal={showWinBanner ? "true" : undefined}
          aria-label={showWinBanner ? "You won" : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {isWin ? (
            <div className="win-banner-headline" data-testid="win-banner">
              <span className="win-banner-emoji" aria-hidden="true">🎉</span>
              <h2 className="win-banner-title">You won!</h2>
              <span className="win-banner-emoji" aria-hidden="true">🎉</span>
            </div>
          ) : (
            <h2>{t("hud.game_over")}</h2>
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
 * Suspense fallback shown while a lazily-loaded game component is fetching.
 *
 * Sized to roughly mirror a real play panel — header line, status row,
 * playfield rectangle — so the layout doesn't jump when the real game
 * mounts. Three card-shaped shimmer blocks evoke a fanned deck so users
 * have a visual cue beyond the polite "Loading game…" caption picked up
 * by screen readers.
 */
function GameLoadingSkeleton(): JSX.Element {
  return (
    <div
      className="play-game-loading"
      data-testid="play-loading-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="play-game-loading-caption">Loading game…</div>
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
    </div>
  );
}
