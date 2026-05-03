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
      <div className="plldrp-wrap">
        <div className="plldrp-done">
          <h2>Time's Up!</h2>
          <div className="plldrp-stats">Matches: {state.matches}</div>
          <div className="plldrp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="plldrp-wrap">
      <div className="plldrp-header">
        <span className="plldrp-info">Matches: {state.matches}</span>
        <span className="plldrp-timer">{state.ticksRemaining}s</span>
        <span className="plldrp-score">{state.score} pts</span>
      </div>
      <div className="plldrp-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-pill-drop-mini-action" key={`${r}-${c}`} className={`plldrp-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PillDropMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
