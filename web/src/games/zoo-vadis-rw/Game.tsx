import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZooVadisRwState, ZooVadisRwAction, ZooVadisRwSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS } from "./state.js";
import "./Game.css";

export function ZooVadisRwGame({ state, dispatch, onGameOver }: GameProps<ZooVadisRwState, ZooVadisRwSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="rw-wrap">
        <h3 className="rw-title">Zoo Vadis: R&W</h3>
        <div className="rw-done">
          <h2>Done!</h2>
          <div className="rw-final">{t?.score ?? state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="rw-wrap">
      <h3 className="rw-title">Zoo Vadis: R&W</h3>
      <div className="rw-info">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</div>
      <div className="rw-score">{state.score} pts</div>
      {state.lastRoll !== null && state.phase === "marking" && (
        <div className="rw-die">{state.lastRoll}</div>
      )}
      <div className="rw-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`rw-cell${filled ? " filled" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as ZooVadisRwAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      {state.phase === "rolling" && (
        <button className="rw-btn" onClick={() => dispatch({ type: "roll" } as ZooVadisRwAction)}>Roll</button>
      )}
      {state.phase === "marking" && (
        <button className="rw-btn alt" onClick={() => dispatch({ type: "skip" } as ZooVadisRwAction)}>Skip</button>
      )}
    </div>
  );
}
