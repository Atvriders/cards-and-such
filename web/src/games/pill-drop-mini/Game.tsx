import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PillDropMiniState, PillDropMiniAction, PillDropMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["💊","🟣","🟡","🔵","🔴","🟢"];

export function PillDropMiniGame({ state, dispatch, onGameOver }: GameProps<PillDropMiniState, PillDropMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PillDropMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="pdmm3-wrap">
        <div className="pdmm3-done">
          <h2>Time's Up!</h2>
          <div className="pdmm3-stats">Matches: {state.matches}</div>
          <div className="pdmm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="pdmm3-wrap">
      <div className="pdmm3-header">
        <span className="pdmm3-info">Matches: {state.matches}</span>
        <span className="pdmm3-timer">{state.ticksRemaining}s</span>
        <span className="pdmm3-score">{state.score} pts</span>
      </div>
      <div className="pdmm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`pdmm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PillDropMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
