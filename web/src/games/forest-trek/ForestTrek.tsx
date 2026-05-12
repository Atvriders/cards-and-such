import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ForestTrekState, ForestTrekSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ForestTrek.css";

const CELL_ICONS: Record<string, string> = {
  tree: "🌲",
  river: "🌊",
  start: "🏠",
  end: "🏁",
  path: "",
};

export function ForestTrek({ state, dispatch, onGameOver }: GameProps<ForestTrekState, ForestTrekSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="forest-trek">
      <div className="ft-info">Moves: {state.moves}</div>
      <div
        className="ft-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 48px)` }}
      >
        {state.grid.map((cell, idx) => {
          const isPlayer = idx === state.playerPos;
          return (
            <div
              key={idx}
              className={`ft-cell ${cell.type}${isPlayer ? " player" : ""}${cell.visited ? " visited" : ""}`}
            >
              {isPlayer ? "🧭" : CELL_ICONS[cell.type] ?? ""}
            </div>
          );
        })}
      </div>

      <div className={state.won ? "ft-won" : "ft-message"}>{state.message}</div>

      {!state.gameOver && (
        <div className="ft-controls">
          <div className="ft-row">
            <button title="Move up" onClick={() => dispatch({ type: "move", dir: "up" })}>▲</button>
          </div>
          <div className="ft-row">
            <button title="Move left" onClick={() => dispatch({ type: "move", dir: "left" })}>◀</button>
            <button title="Move down" onClick={() => dispatch({ type: "move", dir: "down" })}>▼</button>
            <button title="Move right" onClick={() => dispatch({ type: "move", dir: "right" })}>▶</button>
          </div>
        </div>
      )}

      <button data-testid="hint-target-forest-trek-action" onClick={() => dispatch({ type: "restart" })}>New Trek</button>
    </div>
  );
}
