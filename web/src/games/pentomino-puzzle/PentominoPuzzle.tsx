import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PentominoPuzzleState, PentominoPuzzleSettings, PentominoPuzzleAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./PentominoPuzzle.css";

const PIECE_COLORS = [
  "#e74c3c", "#3498db", "#2ecc71", "#f39c12",
  "#9b59b6", "#1abc9c", "#e67e22", "#34495e",
];

export function PentominoPuzzle({
  state,
  dispatch,
  onGameOver,
}: GameProps<PentominoPuzzleState, PentominoPuzzleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleCellClick(col: number, row: number) {
    if (state.won) return;
    const idx = row * state.cols + col;
    const cellPiece = state.grid[idx];
    if (cellPiece !== -1 && cellPiece !== undefined) {
      dispatch({ type: "removePiece", col, row } as PentominoPuzzleAction);
    } else if (state.selectedPiece !== null) {
      dispatch({ type: "placePiece", col, row } as PentominoPuzzleAction);
    }
  }

  // Determine bounding box of each piece for mini preview
  function getPieceBounds(cells: readonly [number, number][]): { minC: number; minR: number; maxC: number; maxR: number } {
    const minC = Math.min(...cells.map(([c]) => c));
    const minR = Math.min(...cells.map(([, r]) => r));
    const maxC = Math.max(...cells.map(([c]) => c));
    const maxR = Math.max(...cells.map(([, r]) => r));
    return { minC, minR, maxC, maxR };
  }

  return (
    <div className="pentomino-puzzle">
      <div className="pentomino-info">
        <span>Moves: {state.moves}</span>
        <span>Fill the grid with all pieces</span>
      </div>

      <div className={`pentomino-status${state.won ? " win" : ""}`}>
        {state.won ? "Grid filled! Puzzle complete!" : "Select a piece, then click a cell to place it"}
      </div>

      {/* Piece selector */}
      <div className="pentomino-pieces">
        {state.pieces.map((piece) => {
          const { minC, minR, maxC, maxR } = getPieceBounds(piece.cells);
          const w = maxC - minC + 1;
          const h = maxR - minR + 1;
          const cellSet = new Set(piece.cells.map(([c, r]) => `${c - minC},${r - minR}`));
          const color = PIECE_COLORS[(piece.color - 1) % PIECE_COLORS.length]!;
          return (
            <button
              key={piece.id}
              className={`pentomino-piece-btn ${state.selectedPiece === piece.id ? "selected" : ""} ${piece.placed ? "placed" : ""}`}
              onClick={() => {
                if (!piece.placed) dispatch({ type: "selectPiece", pieceId: piece.id } as PentominoPuzzleAction);
              }}
              disabled={piece.placed}
            >
              <div
                className="piece-mini-grid"
                style={{ gridTemplateColumns: `repeat(${w}, 12px)` }}
              >
                {Array.from({ length: h }, (_, r) =>
                  Array.from({ length: w }, (_, c) => (
                    <div
                      key={`${c},${r}`}
                      className={`piece-mini-cell ${cellSet.has(`${c},${r}`) ? "filled" : "empty-mini"}`}
                      style={{ background: cellSet.has(`${c},${r}`) ? color : "transparent" }}
                    />
                  ))
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div
        className="pentomino-grid"
        style={{ gridTemplateColumns: `repeat(${state.cols}, 52px)` }}
      >
        {Array.from({ length: state.rows }, (_, row) =>
          Array.from({ length: state.cols }, (_, col) => {
            const idx = row * state.cols + col;
            const pieceId = state.grid[idx]!;
            const isEmpty = pieceId === -1;
            const color = isEmpty ? undefined : PIECE_COLORS[((state.pieces[pieceId]?.color ?? 1) - 1) % PIECE_COLORS.length];
            return (
              <div
                key={`${row}-${col}`}
                className={`pentomino-cell ${isEmpty ? "empty" : ""}`}
                style={isEmpty ? {} : { background: color }}
                onClick={() => handleCellClick(col, row)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
