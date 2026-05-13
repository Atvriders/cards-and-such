import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxDeluxeState, QwixxDeluxeAction, QwixxDeluxeSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS } from "./state.js";
import "./Game.css";

export function QwixxDeluxeGame({ state, dispatch, onGameOver }: GameProps<QwixxDeluxeState, QwixxDeluxeSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="qdx-wrap">
        <div className="qdx-done bounce-in">
          <h2>Done!</h2>
          <div className="qdx-final">{t?.score ?? state.score} pts</div>
        </div>
      </div>
    );
  }
  return (
    <div className="qdx-wrap fade-in">
      <div className="qdx-info">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</div>
      <div className="qdx-score pulse">{state.score} pts</div>
      {state.lastRoll !== null && state.phase === "marking" && (
        <div className="qdx-die">{state.lastRoll}</div>
      )}
      <div className="qdx-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 44px)` }}>
        {state.cells.map((filled, i) => (
          <button title="Select cell"
            key={i}
            className={`qdx-cell${filled ? " qdx-filled" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as QwixxDeluxeAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      {state.phase === "rolling" && (
        <button data-testid="hint-target-qwixx-deluxe-roll" className="qdx-btn" onClick={() => dispatch({ type: "roll" } as QwixxDeluxeAction)}>Roll</button>
      )}
      {state.phase === "marking" && (
        <button data-testid="hint-target-qwixx-deluxe-skip" className="qdx-btn qdx-alt" onClick={() => dispatch({ type: "skip" } as QwixxDeluxeAction)}>Skip</button>
      )}
    </div>
  );
}
