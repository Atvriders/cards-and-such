import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CandyJellyMiniState, CandyJellyMiniAction, CandyJellyMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🍇","🍓","🫐","🍑","🍋","🍊"];

export function CandyJellyMiniGame({ state, dispatch, onGameOver }: GameProps<CandyJellyMiniState, CandyJellyMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CandyJellyMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="cdjly-wrap">
        <div className="cdjly-done">
          <h2>Time's Up!</h2>
          <div className="cdjly-stats">Matches: {state.matches}</div>
          <div className="cdjly-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="cdjly-wrap">
      <div className="cdjly-header">
        <span className="cdjly-info">Matches: {state.matches}</span>
        <span className="cdjly-timer">{state.ticksRemaining}s</span>
        <span className="cdjly-score">{state.score} pts</span>
      </div>
      <div className="cdjly-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`cdjly-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as CandyJellyMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
