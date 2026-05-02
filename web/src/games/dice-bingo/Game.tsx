import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceBingoState, DiceBingoAction, DiceBingoSettings } from "./state.js";
import { isTerminal, TOTAL_ROUNDS } from "./state.js";
import "./Game.css";

export function DiceBingoGame({ state, dispatch, onGameOver }: GameProps<DiceBingoState, DiceBingoSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="db-wrap"><div className="db-done"><h2>Done!</h2><div>Lines: {state.linesCount}</div><div className="db-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="db-wrap">
      <div className="db-header">
        <span>Round {state.round} / {TOTAL_ROUNDS}</span>
        <span className="db-score">{state.score} pts</span>
        <span>Lines: {state.linesCount}</span>
      </div>
      <div className="db-grid">
        {state.grid.map((v, i) => {
          const m = state.marked[i];
          const matchable = state.phase === "rolled" && state.lastRoll === v && !m;
          return (
            <button key={i}
              className={`db-cell${m ? " marked" : ""}${matchable ? " matchable" : ""}`}
              disabled={!matchable}
              onClick={() => dispatch({ type:"mark", idx:i } as DiceBingoAction)}>
              {v}
            </button>
          );
        })}
      </div>
      {state.phase === "rolling" && (
        <button className="db-btn" data-testid="hint-target-dice-bingo-roll" onClick={() => dispatch({ type:"roll" } as DiceBingoAction)}>Roll</button>
      )}
      {state.phase === "rolled" && (
        <>
          <div className="db-roll">Rolled: {state.lastRoll}</div>
          <button className="db-btn alt" onClick={() => dispatch({ type:"skip" } as DiceBingoAction)}>Skip (no match)</button>
        </>
      )}
    </div>
  );
}
