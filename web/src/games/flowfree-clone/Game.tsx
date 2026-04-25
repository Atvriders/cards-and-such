import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorFlowState, ColorFlowSettings } from "./state.js";
import type { ColorFlowAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ColorFlow({
  state,
  dispatch,
  onGameOver,
}: GameProps<ColorFlowState, ColorFlowSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const cellColors: Record<string, string> = {};
  for (const [color, path] of Object.entries(state.paths)) {
    for (const k of path) cellColors[k] = color;
  }

  return (
    <div
      className="color-flow"
      onMouseUp={() => dispatch({ type: "release" } as ColorFlowAction)}
    >
      <div className="color-flow-info">
        <span>{state.size}×{state.size}</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className={`color-flow-status${state.won ? " win" : ""}`}>
        {state.won ? "All flows connected — You win!" : "Connect matching colors and fill every cell"}
      </div>
      <div
        className="color-flow-grid"
        style={{ gridTemplateColumns: `repeat(${state.size}, 58px)` }}
      >
        {Array.from({ length: state.size }, (_, row) =>
          Array.from({ length: state.size }, (_, col) => {
            const k = `${row},${col}`;
            const epColor = state.endpoints[k];
            const fillColor = cellColors[k];
            return (
              <div
                key={k}
                className="color-flow-cell"
                data-color={fillColor ?? undefined}
                onMouseDown={() => {
                  if (!state.won && epColor) dispatch({ type: "start", row, col } as ColorFlowAction);
                }}
                onMouseEnter={() => {
                  if (!state.won && state.activeColor) dispatch({ type: "extend", row, col } as ColorFlowAction);
                }}
              >
                {epColor && <div className="color-flow-dot" data-color={epColor} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
