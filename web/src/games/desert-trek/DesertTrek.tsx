import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DesertTrekState, DesertTrekSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./DesertTrek.css";

const CELL_ICONS: Record<string, string> = {
  dune: "⛰️",
  oasis: "🌴",
  quicksand: "🏜️",
  start: "🏕️",
  end: "🏁",
  sand: "",
};

export function DesertTrek({ state, dispatch, onGameOver }: GameProps<DesertTrekState, DesertTrekSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="desert-trek">
      <div className="dt-info">
        <span>Moves: {state.moves}</span>
        <span>Water: {"💧".repeat(Math.max(0, state.water))}/{state.maxWater}</span>
      </div>

      <div
        className="dt-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 48px)` }}
      >
        {state.grid.map((cell, idx) => {
          const isPlayer = idx === state.playerPos;
          return (
            <div key={idx} className={`dt-cell ${cell}${isPlayer ? " player" : ""}`}>
              {isPlayer ? "🐪" : CELL_ICONS[cell] ?? ""}
            </div>
          );
        })}
      </div>

      <div className={state.won ? "dt-won" : state.gameOver ? "dt-dead" : "dt-message"}>
        {state.message}
      </div>

      {!state.gameOver && (
        <div className="dt-controls">
          <div className="dt-row">
            <button onClick={() => dispatch({ type: "move", dir: "up" })}>▲</button>
          </div>
          <div className="dt-row">
            <button onClick={() => dispatch({ type: "move", dir: "left" })}>◀</button>
            <button onClick={() => dispatch({ type: "move", dir: "down" })}>▼</button>
            <button onClick={() => dispatch({ type: "move", dir: "right" })}>▶</button>
          </div>
        </div>
      )}

      <button data-testid="hint-target-desert-trek-action" onClick={() => dispatch({ type: "restart" })}>New Desert</button>
    </div>
  );
}
