import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QwixxGemixxtState, QwixxGemixxtAction, QwixxGemixxtSettings } from "./state.js";
import { isTerminal, GRID_SIZE, TOTAL_ROLLS, cellZone } from "./state.js";
import "./Game.css";

export function QwixxGemixxtGame({ state, dispatch, onGameOver }: GameProps<QwixxGemixxtState, QwixxGemixxtSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const final = t?.score ?? state.score;
  return (
    <div className="qgx-wrap">
      <header className="qgx-head">
        <h2 className="qgx-title">Qwixx Gemixxt</h2>
        <div className="qgx-meta">
          <span className="qgx-meta-roll">Roll {state.rolls + (state.phase === "marking" ? 1 : 0)} / {TOTAL_ROLLS}</span>
          <span className="qgx-meta-score">{state.score} pts</span>
        </div>
      </header>
      {state.phase === "marking" && state.lastRoll !== null && (
        <div className="qgx-die-area">
          <div className="qgx-die" aria-label={`Die showing ${state.lastRoll}`}>{state.lastRoll}</div>
          <div className="qgx-hint">Pick a cell to mark, or Skip.</div>
        </div>
      )}
      <div className="qgx-grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 56px)` }}>
        {state.cells.map((filled, i) => (
          <button data-testid="hint-target-qwixx-gemixxt-mark"
            key={i}
            className={`qgx-cell qgx-z${cellZone(i)}${filled ? " qgx-on" : ""}`}
            disabled={filled || state.phase !== "marking" || state.phase === "done"}
            onClick={() => dispatch({ type: "mark", index: i } as QwixxGemixxtAction)}
          >{filled ? state.cellValues[i] : ""}</button>
        ))}
      </div>
      <div className="qgx-controls">
        {state.phase === "rolling" && (
          <button data-testid="hint-target-qwixx-gemixxt-roll" className="qgx-btn qgx-btn-primary" onClick={() => dispatch({ type: "roll" } as QwixxGemixxtAction)}>Roll</button>
        )}
        {state.phase === "marking" && (
          <button data-testid="hint-target-qwixx-gemixxt-skip" className="qgx-btn qgx-btn-skip" onClick={() => dispatch({ type: "skip" } as QwixxGemixxtAction)}>Skip</button>
        )}
        <button className="qgx-btn qgx-btn-reset" onClick={() => dispatch({ type: "reset" } as QwixxGemixxtAction)}>Reset</button>
      </div>
      {state.phase === "done" && (
        <div className="qgx-done">Final score: <b>{final}</b></div>
      )}
      <div className="qgx-rules">Same color = bonus +3</div>
    </div>
  );
}
