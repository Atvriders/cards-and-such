import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlokusDuoState, BlokusDuoSettings } from "./state.js";
import { type BlokusDuoAction, isTerminal, PIECES, pieceOrientations, BOARD_SIZE, canPlace } from "./state.js";
import "./Game.css";

const CELL_SIZE = 30;

export function BlokusDuo({
  state,
  dispatch,
  onGameOver,
}: GameProps<BlokusDuoState, BlokusDuoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [hoverPos, setHoverPos] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;

  // Selected piece orientation
  const selPiece = state.selectedPiece !== null ? PIECES[state.selectedPiece] : null;
  const selOri = selPiece
    ? pieceOrientations(selPiece)[state.selectedOriIdx] ?? null
    : null;

  // Preview cells
  const previewCells = new Set<string>();
  const previewValid = hoverPos && selOri
    ? canPlace(state.board, selOri, hoverPos.row, hoverPos.col, 0, state.hasPlaced[0])
    : false;

  if (hoverPos && selOri) {
    for (const [dr, dc] of selOri) {
      previewCells.add(`${hoverPos.row + dr},${hoverPos.col + dc}`);
    }
  }

  function handleCellClick(row: number, col: number) {
    if (!isHumanTurn || !selOri) return;
    dispatch({ type: "placePiece", row, col } satisfies BlokusDuoAction);
    setHoverPos(null);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win! (fewer remaining squares)"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; }
  else if (!isHumanTurn) statusText = "Bot thinking...";
  else if (state.selectedPiece === null) statusText = "Select a piece from the tray below.";
  else statusText = "Click the board to place. Rotate piece with button.";

  return (
    <div className="blokus">
      <div className={`blokus-status ${statusClass}`}>{statusText}</div>
      <div className="blokus-score">
        <span>Your remaining squares: {state.remaining[0].reduce((s, id) => s + PIECES[id]!.squares.length, 0)}</span>
        <span>Bot remaining: {state.remaining[1].reduce((s, id) => s + PIECES[id]!.squares.length, 0)}</span>
      </div>
      <div className="blokus-board-wrap">
        <div
          className="blokus-board"
          style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`, gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)` }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const idx = row * BOARD_SIZE + col;
              const cell = state.board[idx];
              const key = `${row},${col}`;
              const isPrev = previewCells.has(key);
              const isStart0 = row === 4 && col === 4;
              const isStart1 = row === 9 && col === 9;

              let bg = "var(--board-bg)";
              if (cell === 0) bg = "#2244cc";
              else if (cell === 1) bg = "#cc2222";
              else if (isPrev) bg = previewValid ? "rgba(34, 68, 204, 0.5)" : "rgba(200, 50, 50, 0.4)";
              else if (isStart0) bg = "rgba(34, 68, 204, 0.2)";
              else if (isStart1) bg = "rgba(204, 34, 34, 0.2)";

              return (
                <div
                  key={key}
                  className="blokus-cell"
                  style={{ background: bg }}
                  onClick={() => handleCellClick(row, col)}
                  onMouseEnter={() => setHoverPos({ row, col })}
                  onMouseLeave={() => setHoverPos(null)}
                  data-testid={`blk-${row}-${col}`}
                  role="button"
                />
              );
            })
          )}
        </div>
      </div>
      {isHumanTurn && state.selectedPiece !== null && (
        <button
          className="blokus-rotate-btn"
          onClick={() => dispatch({ type: "rotatePiece" } satisfies BlokusDuoAction)}
        >
          ↻ Rotate Piece
        </button>
      )}
      <div className="blokus-tray">
        <div className="blokus-tray-label">Your pieces ({state.remaining[0].length} left):</div>
        <div className="blokus-pieces">
          {state.remaining[0].map((id) => {
            const piece = PIECES[id]!;
            const ori = pieceOrientations(piece)[0]!;
            const maxR = Math.max(...ori.map(([r]) => r));
            const maxC = Math.max(...ori.map(([, c]) => c));
            const isSelected = state.selectedPiece === id;
            return (
              <div
                key={id}
                className={`blokus-piece-btn ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  if (!isHumanTurn) return;
                  dispatch({ type: "selectPiece", pieceId: id } satisfies BlokusDuoAction);
                }}
                title={piece.name}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${maxC + 1}, 10px)`,
                    gridTemplateRows: `repeat(${maxR + 1}, 10px)`,
                    gap: "1px",
                    position: "relative",
                    width: `${(maxC + 1) * 11}px`,
                    height: `${(maxR + 1) * 11}px`,
                  }}
                >
                  {ori.map(([r, c], i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${c * 11}px`,
                        top: `${r * 11}px`,
                        width: "10px",
                        height: "10px",
                        background: isSelected ? "#4466ee" : "#2244cc",
                        borderRadius: "1px",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
