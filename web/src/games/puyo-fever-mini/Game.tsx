import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuyoFeverMiniState, PuyoFeverMiniAction, PuyoFeverMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🔥","💥","⚡","💫","🌟","✨"];

export function PuyoFeverMiniGame({ state, dispatch, onGameOver }: GameProps<PuyoFeverMiniState, PuyoFeverMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PuyoFeverMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="pyofvr-wrap">
        <div className="pyofvr-done">
          <h2>Time's Up!</h2>
          <div className="pyofvr-stats">Matches: {state.matches}</div>
          <div className="pyofvr-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="pyofvr-wrap">
      <div className="pyofvr-header">
        <span className="pyofvr-info">Matches: {state.matches}</span>
        <span className="pyofvr-timer">{state.ticksRemaining}s</span>
        <span className="pyofvr-score">{state.score} pts</span>
      </div>
      <div className="pyofvr-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`pyofvr-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PuyoFeverMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
