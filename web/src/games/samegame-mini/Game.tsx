import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SamegameMiniState, SamegameMiniAction, SamegameMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🟥","🟦","🟩","🟨","🟪"];

export function SamegameMiniGame({ state, dispatch, onGameOver }: GameProps<SamegameMiniState, SamegameMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SamegameMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="samm3-wrap">
        <div className="samm3-done">
          <h2>Time's Up!</h2>
          <div className="samm3-stats">Matches: {state.matches}</div>
          <div className="samm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="samm3-wrap">
      <div className="samm3-header">
        <span className="samm3-info">Matches: {state.matches}</span>
        <span className="samm3-timer">{state.ticksRemaining}s</span>
        <span className="samm3-score">{state.score} pts</span>
      </div>
      <div className="samm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`samm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as SamegameMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
