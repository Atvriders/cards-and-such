import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VolcanoEscapeState, VolcanoEscapeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./VolcanoEscape.css";

export function VolcanoEscape({ state, dispatch, onGameOver }: GameProps<VolcanoEscapeState, VolcanoEscapeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const lavaSet = new Set(state.lavaBlobs.map(b => `${b.row},${b.col}`));

  return (
    <div className="volcano-escape">
      <div className="ve-stats">Ticks survived: {state.tick}</div>

      <div className="ve-board">
        {Array.from({ length: state.rows }, (_, row) =>
          Array.from({ length: state.cols }, (_, col) => {
            const isPlayer = row === state.playerRow && col === state.playerCol;
            const isLava = lavaSet.has(`${row},${col}`);
            const isExit = row === 0;
            return (
              <div
                key={`${row}-${col}`}
                className={`ve-cell${isExit ? " exit" : ""}${isLava ? " lava" : ""}${isPlayer ? " player" : ""}`}
              >
                {isPlayer ? "🏃" : isLava ? "🌋" : isExit ? "🚪" : ""}
              </div>
            );
          })
        )}
      </div>

      <div className={state.escaped ? "ve-win" : state.gameOver ? "ve-dead" : "ve-message"}>
        {state.message}
      </div>

      {!state.gameOver && (
        <>
          <div className="ve-controls">
            <div className="ve-row">
              <button onClick={() => dispatch({ type: "move", dir: "up" })}>▲</button>
            </div>
            <div className="ve-row">
              <button onClick={() => dispatch({ type: "move", dir: "left" })}>◀</button>
              <button onClick={() => dispatch({ type: "move", dir: "down" })}>▼</button>
              <button onClick={() => dispatch({ type: "move", dir: "right" })}>▶</button>
            </div>
          </div>
          <button onClick={() => dispatch({ type: "tick" })}>Advance Lava ⏩</button>
        </>
      )}

      <button onClick={() => dispatch({ type: "restart" })}>New Escape</button>
    </div>
  );
}
