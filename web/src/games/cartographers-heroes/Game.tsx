import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CartographersHeroesState, CartographersHeroesAction, CartographersHeroesSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function CartographersHeroesGame({ state, dispatch, onGameOver }: GameProps<CartographersHeroesState, CartographersHeroesSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="cth-wrap">
      <header className="cth-head">
        <h2 className="cth-title">Cartographers Heroes</h2>
        <div className="cth-meta">
          <span className="cth-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="cth-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="cth-die-area">
          <div className="cth-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="cth-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="cth-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-cartographers-heroes-mark"
            key={i}
            className={`cth-cell cth-z${cellZone(i)}${filled ? " cth-on" : ""}`}
            disabled={filled || state.phase !== "marking"}
            onClick={() => dispatch({ type: "mark", index: i } as CartographersHeroesAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="cth-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-cartographers-heroes-roll" className="cth-btn cth-btn-primary" onClick={() => dispatch({ type: "roll" } as CartographersHeroesAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-cartographers-heroes-skip" className="cth-btn cth-btn-skip" onClick={() => dispatch({ type: "skip" } as CartographersHeroesAction)}>Skip</button>
        )}
        <button className="cth-btn cth-btn-reset" onClick={() => dispatch({ type: "reset" } as CartographersHeroesAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="cth-done">Final score: <b>{final}</b></div>
      )}
      <div className="cth-rules">Heroes (rolls 5-6) defeat monsters</div>
    </div>
  );
}
