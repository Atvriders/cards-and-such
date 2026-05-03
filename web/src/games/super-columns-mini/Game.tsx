import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SuperColumnsMiniState, SuperColumnsMiniAction, SuperColumnsMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["💎","🔴","🟢","🔵","🟡","🟣"];

export function SuperColumnsMiniGame({ state, dispatch, onGameOver }: GameProps<SuperColumnsMiniState, SuperColumnsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SuperColumnsMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="spcolmn-wrap">
        <div className="spcolmn-done">
          <h2>Time's Up!</h2>
          <div className="spcolmn-stats">Matches: {state.matches}</div>
          <div className="spcolmn-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="spcolmn-wrap">
      <div className="spcolmn-header">
        <span className="spcolmn-info">Matches: {state.matches}</span>
        <span className="spcolmn-timer">{state.ticksRemaining}s</span>
        <span className="spcolmn-score">{state.score} pts</span>
      </div>
      <div className="spcolmn-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-super-columns-mini-action" key={`${r}-${c}`} className={`spcolmn-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as SuperColumnsMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
