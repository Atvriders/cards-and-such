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
      <div className="smgam-wrap">
        <div className="smgam-done">
          <h2>Time's Up!</h2>
          <div className="smgam-stats">Matches: {state.matches}</div>
          <div className="smgam-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="smgam-wrap">
      <div className="smgam-header">
        <span className="smgam-info">Matches: {state.matches}</span>
        <span className="smgam-timer">{state.ticksRemaining}s</span>
        <span className="smgam-score">{state.score} pts</span>
      </div>
      <div className="smgam-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-samegame-mini-action" key={`${r}-${c}`} className={`smgam-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as SamegameMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
