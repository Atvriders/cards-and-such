import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CandyFriendsMiniState, CandyFriendsMiniAction, CandyFriendsMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🐰","🐻","🐱","🐶","🦊","🐼"];

export function CandyFriendsMiniGame({ state, dispatch, onGameOver }: GameProps<CandyFriendsMiniState, CandyFriendsMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CandyFriendsMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="cdfrnd-wrap">
        <div className="cdfrnd-done">
          <h2>Time's Up!</h2>
          <div className="cdfrnd-stats">Matches: {state.matches}</div>
          <div className="cdfrnd-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="cdfrnd-wrap">
      <div className="cdfrnd-header">
        <span className="cdfrnd-info">Matches: {state.matches}</span>
        <span className="cdfrnd-timer">{state.ticksRemaining}s</span>
        <span className="cdfrnd-score">{state.score} pts</span>
      </div>
      <div className="cdfrnd-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`cdfrnd-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as CandyFriendsMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
