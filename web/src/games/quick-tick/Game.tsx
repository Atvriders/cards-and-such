import { useEffect, useRef, useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuickTickState, QuickTickSettings } from "./state.js";
import { isTerminal, TOTAL_TICKS, POINTS_PERFECT, POINTS_GOOD, HIT_PERFECT, HIT_GOOD } from "./state.js";
import "./Game.css";

const TICK_INTERVAL = 1000; // ms between ticks

export function QuickTickGame({ state, dispatch, onGameOver }: GameProps<QuickTickState, QuickTickSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [tickFlash, setTickFlash] = useState(false);
  const [barProgress, setBarProgress] = useState(0);
  const [resultClass, setResultClass] = useState<"" | "perfect" | "good" | "miss">("");
  const tickMomentRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const barRafRef = useRef<number | null>(null);

  const clearAll = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (barRafRef.current) { cancelAnimationFrame(barRafRef.current); barRafRef.current = null; }
  }, []);

  useEffect(() => {
    if (state.phase !== "ticking") { clearAll(); return; }

    // Start periodic ticking
    const startTime = Date.now();
    tickMomentRef.current = startTime + TICK_INTERVAL;

    const updateBar = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / TICK_INTERVAL, 1);
      setBarProgress(progress * 100);
      if (progress < 1) {
        barRafRef.current = requestAnimationFrame(updateBar);
      } else {
        setTickFlash(true);
        setTimeout(() => setTickFlash(false), 150);
      }
    };
    barRafRef.current = requestAnimationFrame(updateBar);

    intervalRef.current = setInterval(() => {
      // Missed tap — advance
      tickMomentRef.current = Date.now() + TICK_INTERVAL;
      setResultClass("miss");
      setBarProgress(0);
      dispatch({ type: "advance" });
    }, TICK_INTERVAL + 200); // slight grace

    return clearAll;
  }, [state.phase, state.tickNumber, clearAll, dispatch]);

  useEffect(() => {
    setResultClass("");
  }, [state.tickNumber]);

  function handleTap() {
    if (state.phase !== "ticking") return;
    const now = Date.now();
    const tickMoment = tickMomentRef.current ?? now;
    const delta = now - tickMoment;
    const abs = Math.abs(delta);
    const rc: "perfect" | "good" | "miss" = abs <= HIT_PERFECT ? "perfect" : abs <= HIT_GOOD ? "good" : "miss";
    setResultClass(rc);
    clearAll();
    dispatch({ type: "tap", timingMs: delta });
  }

  const feedbackText = resultClass === "perfect" ? `PERFECT! +${POINTS_PERFECT}`
    : resultClass === "good" ? `Good! +${POINTS_GOOD}`
    : resultClass === "miss" && state.lastPoints === 0 ? "Miss! +0"
    : "";

  return (
    <div className="quick-tick">
      <div className="qt-score pulse">Score: {state.score} / {TOTAL_TICKS * POINTS_PERFECT}</div>
      <div className="qt-progress">Tick {Math.min(state.tickNumber + 1, TOTAL_TICKS)} of {TOTAL_TICKS}</div>

      {state.phase === "waiting" && (
        <div className="qt-controls">
          <button onClick={() => dispatch({ type: "start" })}>Start Game</button>
        </div>
      )}

      {state.phase === "ticking" && (
        <div className="qt-clock-area">
          <div className="qt-bar"><div className="qt-bar-fill" style={{ width: `${barProgress}%` }} /></div>
          <div
            className={`qt-clock${tickFlash ? " tick" : ""}`}
            onClick={handleTap}
          >
            <span className="qt-clock-inner">TAP!</span>
          </div>
          <div className={`qt-feedback ${resultClass}`}>{feedbackText}</div>
          {state.lastTiming !== null && (
            <div className="qt-timing">{state.lastTiming > 0 ? "+" : ""}{state.lastTiming}ms</div>
          )}
        </div>
      )}

      {state.phase === "done" && (
        <>
          <div className="qt-done bounce-in">Done! Final Score: {state.score}</div>
          <div className="qt-controls">
            <button onClick={() => dispatch({ type: "newGame" })}>Play Again</button>
          </div>
        </>
      )}

      <div className="qt-hint">
        Click the clock exactly when the bar fills up. ±{HIT_PERFECT}ms = perfect ({POINTS_PERFECT}pts), ±{HIT_GOOD}ms = good ({POINTS_GOOD}pts).
      </div>
    </div>
  );
}
