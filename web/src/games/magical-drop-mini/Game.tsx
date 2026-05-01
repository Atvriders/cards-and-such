import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MagicalDropMiniState, MagicalDropMiniAction, MagicalDropMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🌸","🍀","🌟","🎈","🎀","🌙"];

export function MagicalDropMiniGame({ state, dispatch, onGameOver }: GameProps<MagicalDropMiniState, MagicalDropMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MagicalDropMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="mgcdrp-wrap">
        <div className="mgcdrp-done">
          <h2>Time's Up!</h2>
          <div className="mgcdrp-stats">Matches: {state.matches}</div>
          <div className="mgcdrp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="mgcdrp-wrap">
      <div className="mgcdrp-header">
        <span className="mgcdrp-info">Matches: {state.matches}</span>
        <span className="mgcdrp-timer">{state.ticksRemaining}s</span>
        <span className="mgcdrp-score">{state.score} pts</span>
      </div>
      <div className="mgcdrp-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`mgcdrp-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as MagicalDropMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
