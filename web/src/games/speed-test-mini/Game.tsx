import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpeedTestState } from "./state.js";
import { isTerminal, averageMs, calcScore } from "./state.js";
import "./Game.css";

const STORAGE_KEY = "speed-test-mini.bestMs";
const ARENA_W = 480;
const ARENA_H = 320;
const TARGET_SIZE = 64;

function readBest(): number | null {
  try {
    const raw =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
  } catch {
    return null;
  }
}

function writeBest(ms: number): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, String(Math.round(ms)));
    }
  } catch {
    // ignore quota / disabled storage
  }
}

// Empty settings type for plugins with no user settings.
type SpeedTestSettings = Record<string, never>;

export function SpeedTestGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpeedTestState, SpeedTestSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const bestLoadedRef = useRef(false);
  const bestPersistedRef = useRef(false);

  // Load stored best once.
  useEffect(() => {
    if (bestLoadedRef.current) return;
    bestLoadedRef.current = true;
    const stored = readBest();
    if (stored !== null) {
      dispatch({ type: "setBest", best: stored });
    }
  }, [dispatch]);

  // Schedule next target appearance whenever we enter the "waiting" phase.
  useEffect(() => {
    if (state.phase !== "waiting") return;
    if (state.trial >= state.totalTrials) return;
    const delay = state.pendingDelay;
    const handle = window.setTimeout(() => {
      dispatch({ type: "appear", now: performance.now() });
    }, delay);
    return () => window.clearTimeout(handle);
  }, [state.phase, state.pendingDelay, state.trial, state.totalTrials, dispatch]);

  const avg = averageMs(state);
  const isNewBest =
    terminal !== null && avg > 0 && (state.best === null || avg < state.best);

  // Persist best and notify the harness on game over.
  useEffect(() => {
    if (!terminal || bestPersistedRef.current) return;
    bestPersistedRef.current = true;
    if (avg > 0 && (state.best === null || avg < state.best)) {
      writeBest(avg);
      dispatch({ type: "setBest", best: avg });
    }
    onGameOver(terminal.score);
  }, [terminal, avg, state.best, dispatch, onGameOver]);

  const handleArenaClick = () => {
    if (state.phase === "ready") {
      dispatch({ type: "click", now: performance.now() });
    }
    // Clicks during "waiting" or "ended" are ignored (no penalty per spec).
  };

  let phaseClass = "speed-test-arena--waiting";
  if (state.phase === "ready") phaseClass = "speed-test-arena--ready";
  if (state.phase === "ended") phaseClass = "speed-test-arena--ended";

  let prompt: string | null = null;
  if (state.phase === "waiting" && state.trial < state.totalTrials) {
    prompt = "Wait for the green target...";
  }

  return (
    <div className="speed-test-root">
      <div className="speed-test-info">
        <span>
          Trial: <strong>{Math.min(state.trial + (terminal ? 0 : 1), state.totalTrials)}/{state.totalTrials}</strong>
        </span>
        {avg > 0 && (
          <span>
            Avg: <strong>{avg} ms</strong>
          </span>
        )}
        <span>
          Best: <strong>{state.best !== null ? `${state.best} ms` : "—"}</strong>
        </span>
      </div>

      {terminal ? (
        <div
          className={
            "speed-test-summary" +
            (isNewBest ? " speed-test-summary--new-best" : "")
          }
        >
          <div>Done! Average reaction time: {avg} ms over {state.totalTrials} trials</div>
          <div>
            {isNewBest
              ? `New best! (was ${state.best !== null ? `${state.best} ms` : "—"})`
              : `Best: ${state.best !== null ? `${state.best} ms` : "—"}`}
          </div>
          <div>Score: {calcScore(state)}</div>
        </div>
      ) : (
        <div
          className={`speed-test-arena ${phaseClass}`}
          onClick={handleArenaClick}
          role="button"
          aria-label="Reaction speed arena"
        >
          {prompt && <div className="speed-test-prompt">{prompt}</div>}
          {state.target && state.phase === "ready" && (
            <div
              className="speed-test-target"
              style={{
                left: state.target.x * ARENA_W - TARGET_SIZE / 2,
                top: state.target.y * ARENA_H - TARGET_SIZE / 2,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
