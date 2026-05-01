import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CandySodaMiniState, CandySodaMiniAction, CandySodaMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🥤","🧃","🍾","🍹","🍸","🥛"];

export function CandySodaMiniGame({ state, dispatch, onGameOver }: GameProps<CandySodaMiniState, CandySodaMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CandySodaMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="csmm3-wrap">
        <div className="csmm3-done">
          <h2>Time's Up!</h2>
          <div className="csmm3-stats">Matches: {state.matches}</div>
          <div className="csmm3-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="csmm3-wrap">
      <div className="csmm3-header">
        <span className="csmm3-info">Matches: {state.matches}</span>
        <span className="csmm3-timer">{state.ticksRemaining}s</span>
        <span className="csmm3-score">{state.score} pts</span>
      </div>
      <div className="csmm3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`csmm3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as CandySodaMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
