import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Match3TriangleMiniState, Match3TriangleMiniAction, Match3TriangleMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🔺","🔻","🔼","🔽","▲","▼"];

export function Match3TriangleMiniGame({ state, dispatch, onGameOver }: GameProps<Match3TriangleMiniState, Match3TriangleMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as Match3TriangleMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="m3tri-wrap">
        <div className="m3tri-done">
          <h2>Time's Up!</h2>
          <div className="m3tri-stats">Matches: {state.matches}</div>
          <div className="m3tri-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="m3tri-wrap">
      <div className="m3tri-header">
        <span className="m3tri-info">Matches: {state.matches}</span>
        <span className="m3tri-timer">{state.ticksRemaining}s</span>
        <span className="m3tri-score">{state.score} pts</span>
      </div>
      <div className="m3tri-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`m3tri-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as Match3TriangleMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
