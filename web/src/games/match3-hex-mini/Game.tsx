import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Match3HexMiniState, Match3HexMiniAction, Match3HexMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["⬣","⬢","🔶","🔷","🟧","🟪"];

export function Match3HexMiniGame({ state, dispatch, onGameOver }: GameProps<Match3HexMiniState, Match3HexMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as Match3HexMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="m3hex-wrap">
        <div className="m3hex-done">
          <h2>Time's Up!</h2>
          <div className="m3hex-stats">Matches: {state.matches}</div>
          <div className="m3hex-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="m3hex-wrap">
      <div className="m3hex-header">
        <span className="m3hex-info">Matches: {state.matches}</span>
        <span className="m3hex-timer">{state.ticksRemaining}s</span>
        <span className="m3hex-score">{state.score} pts</span>
      </div>
      <div className="m3hex-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-match3-hex-mini-action" key={`${r}-${c}`} className={`m3hex-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as Match3HexMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
