import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HarvestDiceGardenState, HarvestDiceGardenAction, HarvestDiceGardenSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function HarvestDiceGardenGame({ state, dispatch, onGameOver }: GameProps<HarvestDiceGardenState, HarvestDiceGardenSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="hdg-wrap">
      <header className="hdg-head">
        <h2 className="hdg-title">Harvest Dice Garden</h2>
        <div className="hdg-meta">
          <span className="hdg-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="hdg-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="hdg-die-area">
          <div className="hdg-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="hdg-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="hdg-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button
            key={i}
            className={`hdg-cell hdg-z${cellZone(i)}${filled ? " hdg-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as HarvestDiceGardenAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="hdg-controls">
        {state.phase === "rolling" && (
          <button className="hdg-btn hdg-btn-primary" onClick={() => dispatch({ type: "roll" } as HarvestDiceGardenAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button className="hdg-btn hdg-btn-skip" onClick={() => dispatch({ type: "skip" } as HarvestDiceGardenAction)}>Skip</button>
        )}
        <button className="hdg-btn hdg-btn-reset" onClick={() => dispatch({ type: "reset" } as HarvestDiceGardenAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="hdg-done">Final score: <b>{final}</b></div>
      )}
      <div className="hdg-rules">Each ripe row: +5</div>
    </div>
  );
}
