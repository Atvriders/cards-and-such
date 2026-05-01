import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuyoTsuMiniState, PuyoTsuMiniAction, PuyoTsuMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🟣","🟢","🔴","🟡","🔵","🟠"];

export function PuyoTsuMiniGame({ state, dispatch, onGameOver }: GameProps<PuyoTsuMiniState, PuyoTsuMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PuyoTsuMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="pyotsu-wrap">
        <div className="pyotsu-done">
          <h2>Time's Up!</h2>
          <div className="pyotsu-stats">Matches: {state.matches}</div>
          <div className="pyotsu-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="pyotsu-wrap">
      <div className="pyotsu-header">
        <span className="pyotsu-info">Matches: {state.matches}</span>
        <span className="pyotsu-timer">{state.ticksRemaining}s</span>
        <span className="pyotsu-score">{state.score} pts</span>
      </div>
      <div className="pyotsu-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`pyotsu-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PuyoTsuMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
