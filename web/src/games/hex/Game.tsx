import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HexState, HexSettings } from "./state.js";
import { type HexAction, isTerminal, hexNeighbors } from "./state.js";
import "./Game.css";

export function Hex({
  state,
  dispatch,
  onGameOver,
}: GameProps<HexState, HexSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const size = state.grid.rows;

  function handleClick(row: number, col: number) {
    if (!isMyTurn) return;
    dispatch({ type: "place", at: { row, col } } satisfies HexAction);
  }

  function handleSwap() {
    dispatch({ type: "swap" } satisfies HexAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! (Black — top↔bottom)"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins! (White — left↔right)"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot thinking... (White)";
  else statusText = "Your turn — place a Black stone.";

  const canSwap = state.settings.swapRule && state.turn === 0 && state.movesMade === 1 && !state.swapped;

  // Build hex grid with offset rendering
  // Each cell is a hexagon using CSS; we use a simple offset grid display
  const cellSize = size <= 9 ? 44 : size <= 11 ? 38 : 32;
  const offsetX = cellSize / 2;

  return (
    <div className="hex-game">
      <div className={`hex-status ${statusClass}`}>{statusText}</div>
      {canSwap && (
        <button className="hex-swap-btn" onClick={handleSwap}>
          Use Swap Rule (take White's position)
        </button>
      )}
      <div className="hex-legend">
        <span className="hex-legend-black">■ Black: top → bottom</span>
        <span className="hex-legend-white">■ White: left → right</span>
      </div>
      <div className="hex-board-wrap">
        <svg
          className="hex-svg"
          width={cellSize * size + offsetX * (size - 1) + 20}
          height={cellSize * size * 0.87 + 20}
          style={{ overflow: "visible" }}
        >
          {/* Edge labels */}
          <text x={10} y={12} className="hex-edge-label" fill="#333">Top (Black)</text>
          {Array.from({ length: size }, (_, row) =>
            Array.from({ length: size }, (_, col) => {
              const val = state.grid.get({ row, col });
              const cx = 10 + col * cellSize + row * offsetX;
              const cy = 10 + row * cellSize * 0.87;
              const key = `${row},${col}`;
              const isEmpty = val === null;
              const fill = val === 0 ? "#222" : val === 1 ? "#eee" : isMyTurn ? "#c8a96e" : "#b89050";
              const stroke = isEmpty ? "#8b6020" : "none";
              const r = cellSize * 0.42;

              // Hexagon points
              const points = Array.from({ length: 6 }, (_, i) => {
                const angle = (Math.PI / 3) * i - Math.PI / 6;
                return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
              }).join(" ");

              return (
                <polygon
                  key={key}
                  points={points}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={1.5}
                  onClick={() => handleClick(row, col)}
                  style={{ cursor: isEmpty && isMyTurn ? "pointer" : "default" }}
                  data-testid={`hex-${row}-${col}`}
                />
              );
            })
          )}
        </svg>
      </div>
      <div className="hex-score">
        Moves made: {state.movesMade}
      </div>
    </div>
  );
}

// Suppress unused import warning
void hexNeighbors;
