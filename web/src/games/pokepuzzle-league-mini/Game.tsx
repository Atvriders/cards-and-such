import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PokepuzzleLeagueMiniState, PokepuzzleLeagueMiniAction, PokepuzzleLeagueMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["⚡","🔥","💧","🌿","🪨","🌬"];

export function PokepuzzleLeagueMiniGame({ state, dispatch, onGameOver }: GameProps<PokepuzzleLeagueMiniState, PokepuzzleLeagueMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PokepuzzleLeagueMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="m3-wrap"><div className="m3-done bounce-in"><h2>Time's Up!</h2><div>Matches: {state.matches}</div><div className="m3-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="m3-wrap">
      <div className="m3-header">
        <span className="m3-info">Matches: {state.matches}</span>
        <span className="m3-timer">{state.ticksRemaining}s</span>
        <span className="m3-score pulse">{state.score} pts</span>
      </div>
      <div className="m3-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-pokepuzzle-league-mini-action" key={`${r}-${c}`} className={`m3-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PokepuzzleLeagueMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
