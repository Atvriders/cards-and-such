import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarathonState, MarathonAction } from "./state.js";
import { isTerminal, TOTAL_MILES } from "./state.js";
import "./Game.css";

export function MarathonPacer({
  state,
  dispatch,
  onGameOver,
}: GameProps<MarathonState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase === "done") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  const d = (a: MarathonAction) => dispatch(a);

  const energyColor = state.energy >= 60 ? "#43a047" : state.energy >= 30 ? "#ffa726" : "#ef5350";
  const paceMin = Math.floor(state.pace / 60);
  const paceSec = Math.round(state.pace % 60);

  return (
    <div className="mara-wrap">
      <div className="mara-header">
        <span className="mara-title">Marathon Pacer</span>
        <span className="mara-score">Score: {state.score}</span>
      </div>

      <div className="mara-mile-row">
        {Array.from({ length: TOTAL_MILES }, (_, i) => {
          const status = i < state.mile ? "done" : i === state.mile ? "current" : "future";
          return <div key={i} className={`mara-mile-dot ${status}`}>{i + 1}</div>;
        })}
      </div>

      {state.phase === "running" && (
        <>
          <div className="mara-bar-row">
            <span className="mara-bar-label">Mile {state.mile + 1}</span>
            <div className="mara-bar">
              <div className="mara-bar-fill" style={{ width: `${Math.min(100, state.mileProgress)}%`, background: "#1976d2" }} />
            </div>
          </div>
          <div className="mara-bar-row">
            <span className="mara-bar-label">Energy</span>
            <div className="mara-bar">
              <div className="mara-bar-fill" style={{ width: `${state.energy}%`, background: energyColor }} />
            </div>
          </div>
          <div className="mara-stats">
            <span>Pace: {paceMin}:{paceSec.toString().padStart(2, "0")}/mi</span>
            <span>Target: {Math.floor(state.targetPace / 60)}:{Math.round(state.targetPace % 60).toString().padStart(2, "0")}/mi</span>
            <span>Surges: {state.boosts}</span>
          </div>
          <div className="mara-controls">
            <button className="mara-btn surge"
              disabled={state.boosts <= 0 || state.energy < 10}
              onClick={() => d({ type: "surge" })}>
              Surge (-15 energy)
            </button>
            <button data-testid="hint-target-marathon-pacer-action" className="mara-btn recover"
              onClick={() => d({ type: "recover" })}>
              Ease Up (+energy)
            </button>
          </div>
        </>
      )}

      {state.phase === "done" && (
        <div className="mara-done">
          <div className="mara-done-score">Final Score: {state.score}</div>
          <div>{state.score >= 80 ? "Marathon Master!" : state.score >= 50 ? "Strong finish!" : "Keep running!"}</div>
        </div>
      )}
    </div>
  );
}
