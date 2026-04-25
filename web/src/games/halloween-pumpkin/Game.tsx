import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HalloweenPumpkinState, HalloweenPumpkinSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HalloweenPumpkinGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<HalloweenPumpkinState, HalloweenPumpkinSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function accuracy(): number {
    let correct = 0;
    for (let i = 0; i < state.target.length; i++) {
      if (state.carved[i] === state.target[i]) correct++;
    }
    return Math.round((correct / state.target.length) * 100);
  }

  return (
    <div className="hp-game">
      <div className="hp-title">Halloween Pumpkin</div>
      <div className="hp-subtitle">Carve the pumpkin to match the stencil!</div>

      <div className="hp-panels">
        <div className="hp-panel">
          <div className="hp-label">Stencil</div>
          <div className="hp-grid" style={{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }}>
            {state.target.map((carved, i) => (
              <div key={i} className={`hp-cell target ${carved ? "carved" : ""}`} />
            ))}
          </div>
        </div>

        <div className="hp-panel">
          <div className="hp-label">Your Pumpkin</div>
          <div className="hp-grid" style={{ gridTemplateColumns: `repeat(${state.size}, 1fr)` }}>
            {state.carved.map((carved, i) => (
              <div
                key={i}
                className={`hp-cell yours ${carved ? "carved" : ""}`}
                onClick={() => !state.over && dispatch({ type: "carve", index: i })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="hp-stats">
        <span>Moves: {state.moves}</span>
        {state.over && <span>Accuracy: {accuracy()}%</span>}
      </div>

      {!state.over && (
        <button className="hp-btn" onClick={() => dispatch({ type: "submit" })}>
          Submit Carving
        </button>
      )}

      {state.over && (
        <div className="hp-result">
          Score: {state.score} — Accuracy: {accuracy()}%
        </div>
      )}
    </div>
  );
}
