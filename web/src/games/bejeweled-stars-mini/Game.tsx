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
      <div className="bjstr-wrap">
        <div className="bjstr-done">
          <h2>Time's Up!</h2>
          <div className="bjstr-stats">Matches: {state.matches}</div>
          <div className="bjstr-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bjstr-wrap">
      <div className="bjstr-header">
        <span className="bjstr-info">Matches: {state.matches}</span>
        <span className="bjstr-timer">{state.ticksRemaining}s</span>
        <span className="bjstr-score">{state.score} pts</span>
      </div>
      <div className="bjstr-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-bejeweled-stars-mini-action" key={`${r}-${c}`} className={`bjstr-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as BejeweledStarsMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
