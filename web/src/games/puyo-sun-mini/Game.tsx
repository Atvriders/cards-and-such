import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuyoSunMiniState, PuyoSunMiniAction, PuyoSunMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["☀️","🌙","⭐","✨","🌟","🌞"];

export function PuyoSunMiniGame({ state, dispatch, onGameOver }: GameProps<PuyoSunMiniState, PuyoSunMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PuyoSunMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="pyosun-wrap">
        <div className="pyosun-done">
          <h2>Time's Up!</h2>
          <div className="pyosun-stats">Matches: {state.matches}</div>
          <div className="pyosun-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="pyosun-wrap">
      <div className="pyosun-header">
        <span className="pyosun-info">Matches: {state.matches}</span>
        <span className="pyosun-timer">{state.ticksRemaining}s</span>
        <span className="pyosun-score">{state.score} pts</span>
      </div>
      <div className="pyosun-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-puyo-sun-mini-action" key={`${r}-${c}`} className={`pyosun-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PuyoSunMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
