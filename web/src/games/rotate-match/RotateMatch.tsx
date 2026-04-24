import { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RotateMatchState, RotateMatchSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./RotateMatch.css";

const TILE_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];

export function RotateMatch({ state, dispatch }: GameProps<RotateMatchState, RotateMatchSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [hoveredBlock, setHoveredBlock] = useState<[number, number] | null>(null);

  function handleCellClick(r: number, c: number, dir: "cw" | "ccw") {
    if (state.over) return;
    // The top-left of the 2×2 block
    const br = Math.min(r, SIZE - 2);
    const bc = Math.min(c, SIZE - 2);
    dispatch({ type: "rotate", row: br, col: bc, dir });
  }

  return (
    <div className="rotatematch-game">
      <div className="rotatematch-header">
        <span>Score: {state.score}</span>
        <span>Moves: {state.moves} / {state.maxMoves}</span>
      </div>

      <div
        className="rotatematch-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 52px)` }}
      >
        {Array.from({ length: SIZE }, (_, r) =>
          Array.from({ length: SIZE }, (_, c) => {
            const color = state.grid[r]![c]!;
            const inBlock = hoveredBlock && r >= hoveredBlock[0] && r <= hoveredBlock[0] + 1
              && c >= hoveredBlock[1] && c <= hoveredBlock[1] + 1;
            return (
              <div
                key={`${r},${c}`}
                className="rotatematch-cell"
                style={{
                  background: TILE_COLORS[color % TILE_COLORS.length],
                  filter: inBlock ? "brightness(1.4)" : undefined,
                }}
                onMouseEnter={() => setHoveredBlock([Math.min(r, SIZE - 2), Math.min(c, SIZE - 2)])}
                onMouseLeave={() => setHoveredBlock(null)}
                onClick={() => handleCellClick(r, c, "cw")}
                onContextMenu={(e) => { e.preventDefault(); handleCellClick(r, c, "ccw"); }}
              />
            );
          })
        )}
      </div>

      <div className="rotatematch-controls">
        Left-click: rotate CW &nbsp;|&nbsp; Right-click: rotate CCW
      </div>

      {terminal && (
        <div className="rotatematch-overlay">
          <h2>Game Over</h2>
          <p>Final Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
