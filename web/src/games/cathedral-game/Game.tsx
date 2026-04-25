import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CathedralState, CathedralSettings } from "./state.js";
import { type CathedralAction, BOARD, BASE_PIECES, getShape, canPlace, isTerminal } from "./state.js";
import "./Game.css";

export function CathedralGame({ state, dispatch, onGameOver }: GameProps<CathedralState, CathedralSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);

  const isMyTurn = state.turn === 0 && state.winner === null && state.phase !== "done";

  let statusText = "", statusClass = "";
  if (state.winner === 0) { statusText = "You win! More territory claimed!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw — equal territory!"; }
  else if (!isMyTurn) statusText = "Bot is placing...";
  else if (state.selectedPiece === null) statusText = "Select a piece from the right panel.";
  else statusText = "Click the board to place. Press Rotate to spin piece.";

  // Compute hover preview cells
  const hoverCells = new Set<number>();
  let hoverValid = false;
  if (isMyTurn && state.selectedPiece !== null && hoverCell !== null) {
    const shape = getShape(state.p0Pieces[state.selectedPiece]!.pieceIdx, state.selectedRotation);
    hoverValid = canPlace(state.board, shape, hoverCell.r, hoverCell.c, "p0");
    for (const [dr, dc] of shape) {
      const r = hoverCell.r + dr, c = hoverCell.c + dc;
      if (r >= 0 && r < BOARD && c >= 0 && c < BOARD) hoverCells.add(r * BOARD + c);
    }
  }

  function handleCellClick(r: number, c: number) {
    if (!isMyTurn || state.selectedPiece === null) return;
    dispatch({ type: "place", row: r, col: c } satisfies CathedralAction);
  }

  const p0Territory = state.board.filter((c) => c === "p0").length;
  const p1Territory = state.board.filter((c) => c === "p1").length;

  return (
    <div className="cathedral-game">
      <div className={`cathedral-status ${statusClass}`}>{statusText}</div>
      <div className="cathedral-layout">
        <div className="cathedral-board">
          {Array.from({ length: BOARD * BOARD }, (_, i) => {
            const r = Math.floor(i / BOARD), c = i % BOARD;
            const cell = state.board[i];
            let cls = "cath-cell";
            if (cell === "cathedral") cls += " cathedral";
            else if (cell === "p0") cls += " p0";
            else if (cell === "p1") cls += " p1";
            else if (hoverCells.has(i) && hoverValid) cls += " hover-valid";
            return (
              <div key={i} className={cls}
                onClick={() => handleCellClick(r, c)}
                onMouseEnter={() => setHoverCell({ r, c })}
                onMouseLeave={() => setHoverCell(null)}
                data-testid={`cell-${r}-${c}`}>
                {cell === "cathedral" ? "†" : cell === "p0" ? "●" : cell === "p1" ? "○" : ""}
              </div>
            );
          })}
        </div>
        <div className="cathedral-sidebar">
          <h4>Your Pieces (Blue)</h4>
          {state.p0Pieces.map((ps, i) => {
            const piece = BASE_PIECES[ps.pieceIdx]!;
            return (
              <button key={i}
                className={`piece-btn${ps.placed ? " placed" : state.selectedPiece === i ? " selected" : ""}`}
                disabled={ps.placed || !isMyTurn}
                onClick={() => dispatch({ type: "selectPiece", idx: i } satisfies CathedralAction)}>
                {piece.name.toUpperCase()} ({piece.shape.length} sq)
              </button>
            );
          })}
          {state.selectedPiece !== null && isMyTurn && (
            <button className="rotate-btn" onClick={() => dispatch({ type: "rotatePiece" } satisfies CathedralAction)}>
              Rotate ({state.selectedRotation * 90}°)
            </button>
          )}
        </div>
      </div>
      <div className="cathedral-score">
        Your territory: {p0Territory} | Bot territory: {p1Territory}
      </div>
    </div>
  );
}
