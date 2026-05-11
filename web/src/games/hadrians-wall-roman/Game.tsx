import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HadriansWallRomanState, HadriansWallRomanAction, HadriansWallRomanSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function HadriansWallRomanGame({ state, dispatch, onGameOver }: GameProps<HadriansWallRomanState, HadriansWallRomanSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="hwr-wrap">
      <header className="hwr-head">
        <h2 className="hwr-title">Hadrian's Wall Roman</h2>
        <div className="hwr-meta">
          <span className="hwr-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="hwr-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="hwr-die-area">
          <div className="hwr-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="hwr-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="hwr-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-hadrians-wall-roman-mark"
            key={i}
            className={`hwr-cell hwr-z${cellZone(i)}${filled ? " hwr-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as HadriansWallRomanAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="hwr-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-hadrians-wall-roman-roll" className="hwr-btn hwr-btn-primary" onClick={() => dispatch({ type: "roll" } as HadriansWallRomanAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-hadrians-wall-roman-skip" className="hwr-btn hwr-btn-skip" onClick={() => dispatch({ type: "skip" } as HadriansWallRomanAction)}>Skip</button>
        )}
        <button className="hwr-btn hwr-btn-reset" onClick={() => dispatch({ type: "reset" } as HadriansWallRomanAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="hwr-done">Final score: <b>{final}</b></div>
      )}
      <div className="hwr-rules">Roll 6: legion bonus +3</div>
    </div>
  );
}
