import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectPipesState, ConnectPipesSettings } from "./state.js";
import type { ConnectPipesAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function ConnectPipesPro({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConnectPipesState, ConnectPipesSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Build cell color map
  const cellColors: Record<string, string> = {};
  for (const [color, path] of Object.entries(state.paths)) {
    for (const k of path) cellColors[k] = color;
  }

  function handleMouseDown(row: number, col: number) {
    if (state.won) return;
    dispatch({ type: "start", row, col } as ConnectPipesAction);
  }

  function handleMouseEnter(row: number, col: number) {
    if (!state.activeColor || state.won) return;
    dispatch({ type: "extend", row, col } as ConnectPipesAction);
  }

  function handleMouseUp() {
    dispatch({ type: "release" } as ConnectPipesAction);
  }

  return (
    <div className="connect-pipes" onMouseUp={handleMouseUp}>
      <div className="connect-pipes-info">
        <span>{state.size}×{state.size} grid</span>
        <span>Moves: {state.movesMade}</span>
      </div>
      <div className="connect-pipes-status">
        {state.won ? "All pipes connected — You win!" : "Connect matching colored dots"}
      </div>
      <div
        className="connect-pipes-grid"
        style={{ gridTemplateColumns: `repeat(${state.size}, 54px)` }}
      >
        {Array.from({ length: state.size }, (_, row) =>
          Array.from({ length: state.size }, (_, col) => {
            const k = `${row},${col}`;
            const epColor = state.endpoints[k];
            const fillColor = cellColors[k];
            const displayColor = fillColor ?? epColor ?? undefined;
            const isEp = !!epColor;
            return (
              <div
                key={k}
                className={`connect-pipes-cell${isEp ? " endpoint" : ""}`}
                data-color={displayColor}
                onMouseDown={() => handleMouseDown(row, col)}
                onMouseEnter={() => handleMouseEnter(row, col)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
