import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BejeweledTwistState, BejeweledTwistAction, BejeweledTwistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["💠","🟧","💚","🩵","⭐","🟪"];

export function BejeweledTwistGame({ state, dispatch, onGameOver }: GameProps<BejeweledTwistState, BejeweledTwistSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as BejeweledTwistAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="bjtwst-wrap">
        <div className="bjtwst-done">
          <h2>Time's Up!</h2>
          <div className="bjtwst-stats">Matches: {state.matches}</div>
          <div className="bjtwst-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bjtwst-wrap">
      <div className="bjtwst-header">
        <span className="bjtwst-info">Matches: {state.matches}</span>
        <span className="bjtwst-timer">{state.ticksRemaining}s</span>
        <span className="bjtwst-score">{state.score} pts</span>
      </div>
      <div className="bjtwst-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`bjtwst-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as BejeweledTwistAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
