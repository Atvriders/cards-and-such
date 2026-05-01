import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BejeweledStarsMiniState, BejeweledStarsMiniAction, BejeweledStarsMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["⭐","🌟","✨","💫","🌠","☀️"];

export function BejeweledStarsMiniGame({ state, dispatch, onGameOver }: GameProps<BejeweledStarsMiniState, BejeweledStarsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BejeweledStarsMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="bsmm3-wrap">
        <div className="bsmm3-done">
          <h2>Time's Up!</h2>
          <div className="bsmm3-stats">Matches: {state.matches}</div>
          <div className="bsmm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bsmm3-wrap">
      <div className="bsmm3-header">
        <span className="bsmm3-info">Matches: {state.matches}</span>
        <span className="bsmm3-timer">{state.ticksRemaining}s</span>
        <span className="bsmm3-score">{state.score} pts</span>
      </div>
      <div className="bsmm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`bsmm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as BejeweledStarsMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
