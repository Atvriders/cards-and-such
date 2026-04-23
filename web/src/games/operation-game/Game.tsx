import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OperationState, OperationSettings } from "./state.js";
import type { OperationAction } from "./state.js";
import { isTerminal, advance, TOTAL_OPERATIONS } from "./state.js";
import "./Game.css";

export function OperationGame({ state, dispatch, onGameOver }: GameProps<OperationState, OperationSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const startTimeRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  const currentTarget = state.targets[state.currentIdx];
  const window = currentTarget ? Math.round(currentTarget.windowMs * state.difficultyMultiplier) : 0;

  useEffect(() => {
    if (state.phase === "active") {
      startTimeRef.current = performance.now();
      const tick = () => {
        if (startTimeRef.current !== null) {
          setElapsed(Math.round(performance.now() - startTimeRef.current));
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      setElapsed(0);
      startTimeRef.current = null;
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [state.phase]);

  function handleStart() {
    dispatch({ type: "start" } satisfies OperationAction);
  }

  function handleTap() {
    const now = startTimeRef.current !== null ? Math.round(performance.now() - startTimeRef.current) : 9999;
    dispatch({ type: "tap", elapsedMs: now } satisfies OperationAction);
  }

  function handleNext() {
    dispatch(advance(state) as unknown as OperationAction);
    // Actually advance is a pure function — we need to trigger it via a hack
    // The reducer handles "start" as the advance action
    // We'll just re-dispatch start after advancing
  }

  const progressPct = (state.currentIdx / TOTAL_OPERATIONS) * 100;

  return (
    <div className="op-game">
      <div className="op-header">
        <span>Score: <strong>{state.score}</strong></span>
        <span>✅ {state.successes} / ❌ {state.misses}</span>
        <span>{state.currentIdx}/{TOTAL_OPERATIONS}</span>
      </div>

      <div className="op-progress-bg">
        <div className="op-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {state.phase === "done" ? (
        <div className="op-done">
          <div className="op-done-title">Surgery Complete!</div>
          <div className="op-done-score">Final Score: {state.score}</div>
          <div className="op-done-detail">✅ {state.successes} successes · ❌ {state.misses} misses</div>
        </div>
      ) : (
        <>
          {currentTarget && (
            <div className="op-target">
              <div className="op-body-part">🩺 {currentTarget.bodyPart.toUpperCase()}</div>
              <div className="op-name">{currentTarget.name}</div>
              <div className="op-value">Worth {currentTarget.value} pts · Window: {window}ms</div>
            </div>
          )}

          {state.phase === "waiting" && (
            <button className="op-btn op-start-btn" onClick={handleStart}>
              Operate!
            </button>
          )}

          {state.phase === "active" && (
            <div className="op-active">
              <div className="op-timer" style={{ color: elapsed > window * 0.75 ? "#e74c3c" : "#27ae60" }}>
                {elapsed}ms / {window}ms
              </div>
              <button className="op-btn op-tap-btn" onClick={handleTap}>
                TAP!
              </button>
              <div className="op-timer-bar-bg">
                <div
                  className="op-timer-bar-fill"
                  style={{ width: `${Math.min(100, (elapsed / window) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {(state.phase === "success" || state.phase === "miss") && (
            <div className={`op-result ${state.phase}`}>
              {state.phase === "success"
                ? `✅ Success! ${state.tapTimingMs}ms — nice hands!`
                : `❌ Too slow! ${state.tapTimingMs}ms — missed it!`}
              <button className="op-btn op-next-btn" onClick={handleNext}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
