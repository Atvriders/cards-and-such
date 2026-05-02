import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightsOutState, LightsOutSettings } from "./state.js";
import type { LightsOutAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./LightsOut.css";

export function LightsOut({
  state,
  dispatch,
  onGameOver,
}: GameProps<LightsOutState, LightsOutSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  function handlePress(row: number, col: number) {
    if (state.won) return;
    dispatch({ type: "press", row, col } as LightsOutAction);
  }

  const onCount = state.lights.filter(Boolean).length;

  return (
    <div className="lights-out">
      <div className="lights-out-info">
        <span>{state.size}×{state.size} grid</span>
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Lights on: {onCount}</span>
      </div>

      <div className={`lights-out-status ${state.won ? "win" : ""}`}>
        {state.won ? "All lights off — You win!" : "Turn off all the lights"}
      </div>

      <div
        className="lights-out-grid"
        style={{ gridTemplateColumns: `repeat(${state.size}, 64px)` }}
      >
        {Array.from({ length: state.size }, (_, row) =>
          Array.from({ length: state.size }, (_, col) => {
            const idx = row * state.size + col;
            const on = state.lights[idx]!;
            return (
              <button
                key={`${row}-${col}`}
                data-testid={`hint-target-lights-out-${row}-${col}`}
                className={`lights-out-cell ${on ? "on" : "off"}`}
                onClick={() => handlePress(row, col)}
                aria-label={`Light ${row + 1},${col + 1} ${on ? "on" : "off"}`}
                disabled={state.won}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
