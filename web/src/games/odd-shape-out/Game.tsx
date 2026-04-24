import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OSOState } from "./state.js";
import { isTerminal } from "./state.js";
import type { oddShapeOutSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof oddShapeOutSettings>;

export function OddShapeOut({
  state,
  dispatch,
  onGameOver,
}: GameProps<OSOState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "playing") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    lastRef.current = performance.now();
    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = now - lastRef.current;
      lastRef.current = now;
      dispatch({ type: "tick", elapsed });
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, state.round, dispatch]);

  const pct = Math.max(0, state.timeLeft / state.timeLimit * 100);
  const timerColor = pct > 50 ? "#48bb78" : pct > 25 ? "#f6ad55" : "#fc8181";

  return (
    <div className="oso-game">
      <div className="oso-header">
        <span>Round <strong>{state.round}/20</strong></span>
        <span>Score <strong>{state.score}</strong></span>
        <span>Correct <strong>{state.correct}</strong></span>
      </div>

      {state.phase === "idle" && (
        <div className="oso-center">
          <p className="oso-desc">8 shapes appear. Find the one that doesn't belong — fast!</p>
          <button className="oso-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {state.phase === "playing" && (
        <div className="oso-center">
          <div className="oso-timer-bar">
            <div className="oso-timer-fill" style={{ width: `${pct}%`, background: timerColor }} />
          </div>
          <div className="oso-grid">
            {state.shapes.map((shape, i) => (
              <button
                key={i}
                className="oso-shape-btn"
                onClick={() => dispatch({ type: "pick", index: i })}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div className="oso-center">
          <div className={`oso-result ${state.lastResult === "correct" ? "correct" : "wrong"}`}>
            {state.lastResult === "correct" ? "Correct!" :
             state.lastResult === "timeout" ? "Time's up!" : "Wrong!"}
          </div>
          <div className="oso-grid oso-grid-reveal">
            {state.shapes.map((shape, i) => (
              <div
                key={i}
                className={`oso-shape-reveal${i === state.oddIndex ? " odd" : ""}`}
              >
                {shape}
              </div>
            ))}
          </div>
          <button className="oso-btn-primary" onClick={() => dispatch({ type: "next" })}>
            {state.round >= 20 ? "Finish" : "Next"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="oso-center">
          <div className="oso-result correct">Done!</div>
          <p className="oso-desc">
            Score: <strong>{terminal?.score ?? state.score}</strong><br />
            Correct: <strong>{state.correct}/20</strong>
          </p>
          <button className="oso-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
