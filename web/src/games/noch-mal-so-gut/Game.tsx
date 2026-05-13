import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NochMalSoGutState, NochMalSoGutAction, NochMalSoGutSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function NochMalSoGutGame({ state, dispatch, onGameOver }: GameProps<NochMalSoGutState, NochMalSoGutSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="nms-wrap fade-in">
      <header className="nms-head">
        <h2 className="nms-title">Noch Mal So Gut</h2>
        <div className="nms-meta">
          <span className="nms-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="nms-meta-score pulse">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="nms-die-area">
          <div className="nms-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="nms-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="nms-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button title="Select cell" data-testid="hint-target-noch-mal-so-gut-mark"
            key={i}
            className={`nms-cell nms-z${cellZone(i)}${filled ? " nms-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as NochMalSoGutAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="nms-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-noch-mal-so-gut-roll" className="nms-btn nms-btn-primary" onClick={() => dispatch({ type: "roll" } as NochMalSoGutAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-noch-mal-so-gut-skip" className="nms-btn nms-btn-skip" onClick={() => dispatch({ type: "skip" } as NochMalSoGutAction)}>Skip</button>
        )}
        <button className="nms-btn nms-btn-reset" onClick={() => dispatch({ type: "reset" } as NochMalSoGutAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="nms-done bounce-in">Final score: <b>{final}</b></div>
      )}
      <div className="nms-rules">Sequel: every 4th cell: +2 token</div>
    </div>
  );
}
