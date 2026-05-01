import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BejeweledBlitzState, BejeweledBlitzAction, BejeweledBlitzSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["💎","🔴","🟢","🔵","🟡","🟣"];

export function BejeweledBlitzGame({ state, dispatch, onGameOver }: GameProps<BejeweledBlitzState, BejeweledBlitzSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BejeweledBlitzAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="bejm3-wrap">
        <div className="bejm3-done">
          <h2>Time's Up!</h2>
          <div className="bejm3-stats">Matches: {state.matches}</div>
          <div className="bejm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bejm3-wrap">
      <div className="bejm3-header">
        <span className="bejm3-info">Matches: {state.matches}</span>
        <span className="bejm3-timer">{state.ticksRemaining}s</span>
        <span className="bejm3-score">{state.score} pts</span>
      </div>
      <div className="bejm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`bejm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as BejeweledBlitzAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
