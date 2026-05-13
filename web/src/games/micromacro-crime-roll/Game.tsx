import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MicromacroCrimeRollState, MicromacroCrimeRollAction, MicromacroCrimeRollSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS } from "./state.js";
import "./Game.css";

export function MicromacroCrimeRollGame({ state, dispatch, onGameOver }: GameProps<MicromacroCrimeRollState, MicromacroCrimeRollSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="rw-wrap">
        <h3 className="rw-title">MicroMacro: Crime Roll</h3>
        <div className="rw-done bounce-in">
          <h2>Done!</h2>
          <div className="rw-final">{t?.score ?? state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="rw-wrap fade-in">
      <h3 className="rw-title">MicroMacro: Crime Roll</h3>
      <div className="rw-info">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</div>
      <div className="rw-score pulse">{state.score} pts</div>
      {state.lastRoll !== null && state.phase === "marking" && (
        <div className="rw-die">{state.lastRoll}</div>
      )}
      <div className="rw-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((filled, i) => (
          <button title="Select cell"
            key={i}
            className={`rw-cell${filled ? " filled" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as MicromacroCrimeRollAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      {state.phase === "rolling" && (
        <button data-testid="hint-target-micromacro-crime-roll-roll" className="rw-btn" onClick={() => dispatch({ type: "roll" } as MicromacroCrimeRollAction)}>Roll</button>
      )}
      {state.phase === "marking" && (
        <button data-testid="hint-target-micromacro-crime-roll-skip" className="rw-btn alt" onClick={() => dispatch({ type: "skip" } as MicromacroCrimeRollAction)}>Skip</button>
      )}
    </div>
  );
}
