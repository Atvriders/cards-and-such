import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PuzzleQuestMiniState, PuzzleQuestMiniAction, PuzzleQuestMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["⚔️","🛡️","💰","💎","📜","🏹"];

export function PuzzleQuestMiniGame({ state, dispatch, onGameOver }: GameProps<PuzzleQuestMiniState, PuzzleQuestMiniSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PuzzleQuestMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return (
      <div className="pzqst-wrap">
        <div className="pzqst-done">
          <h2>Time's Up!</h2>
          <div className="pzqst-stats">Matches: {state.matches}</div>
          <div className="pzqst-final">{state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="pzqst-wrap">
      <div className="pzqst-header">
        <span className="pzqst-info">Matches: {state.matches}</span>
        <span className="pzqst-timer">{state.ticksRemaining}s</span>
        <span className="pzqst-score">{state.score} pts</span>
      </div>
      <div className="pzqst-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button data-testid="hint-target-puzzle-quest-mini-action" key={`${r}-${c}`} className={`pzqst-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as PuzzleQuestMiniAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
