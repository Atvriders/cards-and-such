import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BejeweledClassicMiniState, BejeweledClassicMiniAction, BejeweledClassicMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["💎","♦️","♥️","♠️","♣️","🟡"];

export function BejeweledClassicMiniGame({ state, dispatch, onGameOver }: GameProps<BejeweledClassicMiniState, BejeweledClassicMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BejeweledClassicMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="bcmm3-wrap">
        <div className="bcmm3-done">
          <h2>Time's Up!</h2>
          <div className="bcmm3-stats">Matches: {state.matches}</div>
          <div className="bcmm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bcmm3-wrap">
      <div className="bcmm3-header">
        <span className="bcmm3-info">Matches: {state.matches}</span>
        <span className="bcmm3-timer">{state.ticksRemaining}s</span>
        <span className="bcmm3-score">{state.score} pts</span>
      </div>
      <div className="bcmm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`bcmm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as BejeweledClassicMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
