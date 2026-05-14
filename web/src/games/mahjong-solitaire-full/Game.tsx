import { useEffect, useMemo, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MahjongState, MahjongAction } from "./state.js";
import { isFree, isTerminal } from "./state.js";
import "./Game.css";

type Settings = { _dummy: boolean };

// Tile rendering geometry (logical px). Real size scales via CSS variables.
const TILE_W = 38;
const TILE_H = 48;
const LAYER_DX = 4; // x offset per layer for the 3D stacked look
const LAYER_DY = 4; // y offset per layer (lifted up)

export function MahjongSolitaireFull({
  state,
  dispatch,
  onGameOver,
}: GameProps<MahjongState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Compute board extents from layout (not just active tiles — the board
  // size should stay stable as tiles are removed so the layout doesn't jump).
  const bounds = useMemo(() => {
    const cols = state.tiles.map((t) => t.pos.col);
    const rows = state.tiles.map((t) => t.pos.row);
    const layers = state.tiles.map((t) => t.pos.layer);
    return {
      minCol: Math.min(...cols),
      maxCol: Math.max(...cols),
      minRow: Math.min(...rows),
      maxRow: Math.max(...rows),
      maxLayer: Math.max(...layers),
    };
  }, [state.tiles]);

  const boardW =
    (bounds.maxCol - bounds.minCol + 2) * TILE_W + bounds.maxLayer * LAYER_DX + 24;
  const boardH =
    (bounds.maxRow - bounds.minRow + 2) * TILE_H + bounds.maxLayer * LAYER_DY + 24;

  // Render order: layer asc (so higher layers paint on top), then row asc.
  const sorted = useMemo(
    () =>
      [...state.tiles].sort((a, b) => {
        if (a.pos.layer !== b.pos.layer) return a.pos.layer - b.pos.layer;
        if (a.pos.row !== b.pos.row) return a.pos.row - b.pos.row;
        return a.pos.col - b.pos.col;
      }),
    [state.tiles],
  );

  // Precompute free-ness once per render for click handling and css class.
  const freeSet = useMemo(() => {
    const s = new Set<number>();
    for (const t of state.tiles) {
      if (!t.removed && isFree(t, state.tiles)) s.add(t.id);
    }
    return s;
  }, [state.tiles]);

  const handleTileClick = (id: number) => {
    if (terminal) return;
    dispatch({ type: "select", id } satisfies MahjongAction);
  };

  const handleDeselect = () => {
    if (terminal) return;
    dispatch({ type: "deselect" } satisfies MahjongAction);
  };

  const freePairs = useMemo(() => {
    let pairs = 0;
    const free = [...freeSet]
      .map((id) => state.tiles.find((t) => t.id === id))
      .filter((t): t is NonNullable<typeof t> => !!t);
    const seen = new Map<string, number>();
    for (const t of free) {
      seen.set(t.matchKey, (seen.get(t.matchKey) ?? 0) + 1);
    }
    for (const count of seen.values()) {
      pairs += Math.floor(count / 2);
    }
    return pairs;
  }, [freeSet, state.tiles]);

  return (
    <div className="mj-full fade-in" data-testid="game-mahjong-solitaire-full">
      <div className="mj-full-info">
        <span className="mj-full-stat pulse" data-testid="mj-full-stat-removed">
          Cleared: {state.removed}/{state.total}
        </span>
        <span className="mj-full-stat" data-testid="mj-full-stat-moves">
          Moves: {state.moves}
        </span>
        <span className="mj-full-stat" data-testid="mj-full-stat-free-pairs">
          Free pairs: {freePairs}
        </span>
        <button
          type="button"
          className="mj-full-btn"
          onClick={handleDeselect}
          disabled={state.selectedId === null || !!terminal}
          title="Deselect the currently selected tile"
          aria-label="Deselect tile"
          data-testid="mj-full-deselect"
        >
          Deselect
        </button>
      </div>

      {terminal && (
        <div
          className={`mj-full-status bounce-in ${state.won ? "won" : "lost"}`}
          data-testid="mj-full-status"
        >
          {state.won
            ? `You cleared the turtle! Score: ${terminal.score}`
            : "No moves left — stuck."}
        </div>
      )}

      <div
        className="mj-full-board"
        style={{ width: boardW, height: boardH }}
        data-testid="mj-full-board"
      >
        {sorted.map((tile) => {
          if (tile.removed) return null;
          const free = freeSet.has(tile.id);
          const { row, col, layer } = tile.pos;
          const x = (col - bounds.minCol) * TILE_W + layer * LAYER_DX + 12;
          const y = (row - bounds.minRow) * TILE_H - layer * LAYER_DY + 12;

          let cls = "mj-full-tile";
          if (tile.selected) cls += " selected";
          else if (free) cls += " free";
          else cls += " blocked";
          cls += ` cat-${tile.category}`;

          return (
            <button
              key={tile.id}
              type="button"
              className={cls}
              style={{
                left: x,
                top: y,
                zIndex: layer * 100 + (tile.selected ? 1000 : row),
              }}
              onClick={() => handleTileClick(tile.id)}
              disabled={!free || !!terminal}
              title={`${tile.face} (${tile.category})`}
              aria-label={`${tile.category} tile ${tile.face}`}
              data-testid={`tile-mahjong-solitaire-full-${tile.id}`}
            >
              <span className="mj-full-glyph">{tile.face}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
