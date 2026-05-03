import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrozenRiverState, FrozenRiverSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./FrozenRiver.css";

const TILE_ICONS: Record<string, string> = {
  hole: "💧",
  rock: "🪨",
  crack: "❄️",
  start: "🏠",
  end: "🏁",
  ice: "",
};

export function FrozenRiver({ state, dispatch, onGameOver }: GameProps<FrozenRiverState, FrozenRiverSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="frozen-river">
      <div className="fr-info">Steps: {state.steps}</div>
      <div
        className="fr-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 46px)` }}
      >
        {state.grid.map((tile, idx) => {
          const isPlayer = idx === state.playerPos;
          return (
            <div key={idx} className={`fr-cell ${tile}${isPlayer ? " player" : ""}`}>
              {isPlayer ? "🧊" : TILE_ICONS[tile] ?? ""}
            </div>
          );
        })}
      </div>

      <div className={state.won ? "fr-won" : state.fell ? "fr-fell" : "fr-message"}>
        {state.message}
      </div>

      {!state.gameOver && (
        <div className="fr-controls">
          <div className="fr-row">
            <button onClick={() => dispatch({ type: "move", dir: "up" })}>▲</button>
          </div>
          <div className="fr-row">
            <button onClick={() => dispatch({ type: "move", dir: "left" })}>◀</button>
            <button onClick={() => dispatch({ type: "move", dir: "down" })}>▼</button>
            <button onClick={() => dispatch({ type: "move", dir: "right" })}>▶</button>
          </div>
        </div>
      )}

      <button data-testid="hint-target-frozen-river-action" onClick={() => dispatch({ type: "restart" })}>New River</button>
    </div>
  );
}
