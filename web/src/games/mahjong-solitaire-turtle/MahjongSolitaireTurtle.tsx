import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MahjongSolitaireState, MahjongAction } from "./state.js";
import { isFree, isTerminal } from "./state.js";
import "./MahjongSolitaireTurtle.css";

type Settings = Record<string, never>;

const TILE_W = 38;
const TILE_H = 46;
const LAYER_OFFSET = 3; // px offset per layer (3D effect)

export function MahjongSolitaireTurtle({
  state,
  dispatch,
  onGameOver,
}: GameProps<MahjongSolitaireState, Settings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Compute board extents
  const activeTiles = state.tiles.filter((t) => !t.removed);
  const minCol = Math.min(...activeTiles.map((t) => t.pos.col), 0);
  const maxCol = Math.max(...activeTiles.map((t) => t.pos.col), 0);
  const minRow = Math.min(...activeTiles.map((t) => t.pos.row), 0);
  const maxRow = Math.max(...activeTiles.map((t) => t.pos.row), 0);
  const maxLayer = Math.max(...activeTiles.map((t) => t.pos.layer), 0);

  const boardW = (maxCol - minCol + 2) * TILE_W + maxLayer * LAYER_OFFSET + 20;
  const boardH = (maxRow - minRow + 2) * TILE_H + maxLayer * LAYER_OFFSET + 20;

  // Sort: lower layers first so higher layers render on top
  const sorted = [...state.tiles].sort((a, b) => a.pos.layer - b.pos.layer);

  const handleClick = (id: number) => {
    if (terminal) return;
    dispatch({ type: "select" as const, id } as MahjongAction);
  };

  return (
    <div className="mahjong-turtle">
      <div className="mahjong-info">
        <span>Removed: {state.removed}/{state.total}</span>
        <span>Moves: {state.moves}</span>
      </div>

      {terminal && (
        <div className={`mahjong-status ${state.won ? "won" : "lost"}`}>
          {state.won ? `You win! Score: ${terminal.score}` : `No moves left. Score: ${terminal.score}`}
        </div>
      )}

      <div className="mahjong-board" style={{ width: boardW, height: boardH, position: "relative" }}>
        {sorted.map((tile) => {
          if (tile.removed) return null;
          const free = isFree(tile, state.tiles);
          const { row, col, layer } = tile.pos;
          const x = (col - minCol) * TILE_W + layer * LAYER_OFFSET + 10;
          const y = (row - minRow) * TILE_H - layer * LAYER_OFFSET + 10;

          let cls = "mahjong-tile";
          if (tile.selected) cls += " selected";
          else if (free) cls += " free";
          else cls += " blocked";

          return (
            <button
              key={tile.id}
              className={cls}
              style={{ left: x, top: y, zIndex: layer * 10 + (tile.selected ? 100 : 0) }}
              onClick={() => handleClick(tile.id)}
              disabled={!free || !!terminal}
              aria-label={`${tile.face} tile`}
            >
              {tile.face}
            </button>
          );
        })}
      </div>
    </div>
  );
}
