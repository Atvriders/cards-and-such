import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Skeleton } from "../platform/Skeleton.js";
import { GAMES } from "../games/registry.js";
import { SettingsForm } from "../platform/game-plugin/settings.js";
import { defaultsOf } from "../platform/game-plugin/types.js";
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
import { t } from "../platform/i18n.js";
import "./PlayPage.css";

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

  const [settings, setSettings] = useState(() => defaultsOf(plugin.settings));
  const [phase, setPhase] = useState<"setup" | "playing" | "ended">("setup");
  const [seed, setSeed] = useState<number>(() => urlSeed ?? randomSeed());
  const [state, setState] = useState(() => plugin.initialState(seed, settings));
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number | null>(() => readBestTime(plugin.id));
  const [rating, setRating] = useState<number>(() => readRating(plugin.id));

  const onRate = useCallback(
    (next: number) => {
      setRating(next);
      writeRating(plugin.id, next);
    },
    [plugin.id],
  );

  // Tick the in-game timer once per second while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

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
      setPhase("playing");
    },
    [plugin, settings],
  );

  const start = useCallback(() => {
    startWithSeed(seed);
  }, [seed, startWithSeed]);

  const newGame = useCallback(() => {
    startWithSeed(randomSeed());
  }, [startWithSeed]);

  const replay = useCallback(() => {
    startWithSeed(seed);
  }, [seed, startWithSeed]);

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
    (seconds: number) => {
      const prev = readBestTime(plugin.id);
      if (prev == null || seconds < prev) {
        writeBestTime(plugin.id, seconds);
        setBestTime(seconds);
      }
    },
    [plugin.id],
  );

  const dispatch = useCallback(
    (action: unknown) => {
      setState((s: unknown) => {
        const next = plugin.reducer(s, action);
        const term = plugin.isTerminal(next);
        if (term) {
          setFinalScore(term.score);
          setPhase("ended");
          if (term.score > 0) {
            playSound("win");
            recordBest(elapsed);
            setShowConfetti(true);
          }
          void submitScore(plugin.id, term.score, settings as Record<string, unknown>);
        }
        return next;
      });
    },
    [plugin, settings, elapsed, recordBest],
  );

  const onGameOver = useCallback(
    (score: number) => {
      setFinalScore(score);
      setPhase("ended");
      if (score > 0) {
        playSound("win");
        recordBest(elapsed);
        setShowConfetti(true);
      }
      void submitScore(plugin.id, score, settings as Record<string, unknown>);
    },
    [plugin.id, settings, elapsed, recordBest],
  );

  const showProminentSeed = plugin.id === "klondike" || plugin.id === "freecell" || plugin.id === "spider";
  const progress = useMemo(() => deriveProgress(state), [state]);

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
          <span className={`play-category play-category--${plugin.category}`}>{plugin.category}</span>
          <h1>{plugin.title}</h1>
        </div>
        <div className="play-header-actions">
          {(phase === "playing" || phase === "ended") && (
            <span
              className="play-timer"
              data-testid="play-timer"
              title="Elapsed time"
              aria-label={`Elapsed time ${formatTime(elapsed)}`}
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
          {phase === "playing" && (
            <button
              className="play-iconbtn"
              onClick={() => setPhase("setup")}
              title="Settings"
              aria-label="Settings"
              data-tooltip="Settings"
              type="button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
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

      {phase === "setup" && (
        <section className="setup-panel" data-testid="setup-panel">
          {plugin.howToPlay && <HowToPlayContent text={plugin.howToPlay} />}
          <SettingsForm
            schema={plugin.settings}
            values={settings}
            onChange={(k, v) => setSettings((s) => ({ ...s, [k]: v } as typeof s))}
          />
          <button onClick={start} className="start-btn" data-testid="start-game">Start</button>
        </section>
      )}

      {phase === "playing" && (
        <div className="play-with-sidebar">
          <section className="play-panel">
            {/* Suspense fallback shows a skeleton "loading game…" card while
                the active plugin's component module finishes loading. Most
                plugins are eagerly imported today, but games that use
                React.lazy or trigger a suspending data read still benefit
                here, and the boundary keeps render-time fallbacks scoped
                to the play panel rather than blanking the whole page. */}
            <Suspense fallback={<GameLoadingSkeleton />}>
              <plugin.component state={state} settings={settings} dispatch={dispatch} onGameOver={onGameOver} seed={seed} />
            </Suspense>
          </section>
          <StatsPanel gameId={plugin.id} bestTime={bestTime} />
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

      {phase === "ended" && finalScore !== null && (
        <section className="end-panel" data-testid="end-panel">
          <h2>{t("hud.game_over")}</h2>
          <div className="final-score">{t("hud.score")}: {finalScore}</div>
          <div className="end-seed" data-testid="end-seed">Seed: <code>{seed}</code></div>
          <div className="end-actions">
            <button onClick={newGame} className="play-again-btn" data-testid="new-game-btn">{t("hud.new_game")}</button>
            <button onClick={replay} className="play-again-btn play-replay-btn" data-testid="replay-btn">{t("hud.replay")}</button>
            <button
              onClick={() => { void shareSeed(); }}
              className="play-share-pill"
              data-testid="share-seed-end-btn"
              type="button"
            >
              {shareStatus === "copied" ? "Copied!" : shareStatus === "error" ? "Copy failed" : "Share Seed"}
            </button>
          </div>
          <StatsPanel gameId={plugin.id} bestTime={bestTime} />
          <div className="end-rating" data-testid="end-rating">
            <p className="end-rating-prompt">Rate this game</p>
            <StarRating
              value={rating}
              onChange={onRate}
              testId="end-rating-stars"
              ariaLabel={`Rate ${plugin.title}`}
            />
            {rating > 0 && (
              <p className="end-rating-thanks" data-testid="end-rating-thanks">
                Thanks — you rated this {rating} star{rating === 1 ? "" : "s"}.
              </p>
            )}
          </div>
        </section>
      )}

      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
    </div>
  );
}

/**
 * Suspense fallback shown while a lazily-loaded game component is fetching.
 *
 * Sized to roughly mirror a real play panel — header line, status row,
 * playfield rectangle — so the layout doesn't jump when the real game
 * mounts. Includes a polite "Loading game…" caption for screen readers.
 */
function GameLoadingSkeleton(): JSX.Element {
  return (
    <div className="play-game-loading" data-testid="play-game-loading" role="status" aria-live="polite">
      <div className="play-game-loading-caption">Loading game…</div>
      <div className="play-game-loading-row">
        <Skeleton variant="text-line" width={120} />
        <Skeleton variant="text-line" width={64} />
      </div>
      <Skeleton variant="rect" width="100%" height={320} />
      <div className="play-game-loading-row">
        <Skeleton variant="text-line" width={80} />
        <Skeleton variant="text-line" width={80} />
        <Skeleton variant="text-line" width={80} />
      </div>
    </div>
  );
}
