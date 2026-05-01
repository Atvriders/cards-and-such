import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LuminesMiniState, LuminesMiniAction, LuminesMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🟦","🟥","🟪","🟧"];

export function LuminesMiniGame({ state, dispatch, onGameOver }: GameProps<LuminesMiniState, LuminesMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LuminesMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="lumm3-wrap">
        <div className="lumm3-done">
          <h2>Time's Up!</h2>
          <div className="lumm3-stats">Matches: {state.matches}</div>
          <div className="lumm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="lumm3-wrap">
      <div className="lumm3-header">
        <span className="lumm3-info">Matches: {state.matches}</span>
        <span className="lumm3-timer">{state.ticksRemaining}s</span>
        <span className="lumm3-score">{state.score} pts</span>
      </div>
      <div className="lumm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`lumm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as LuminesMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
