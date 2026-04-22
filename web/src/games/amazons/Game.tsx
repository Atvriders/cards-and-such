import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AmazonsState, AmazonsSettings } from "./state.js";
import { type AmazonsAction, isTerminal, queenReach, posToRC, rcToPos } from "./state.js";
import "./Game.css";

const SIZE = 10;

export function Amazons({
  state,
  dispatch,
  onGameOver,
}: GameProps<AmazonsState, AmazonsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isHumanTurn = state.turn === 0 && state.winner === null;

  // Compute highlighted cells
  const highlighted = new Set<number>();
  if (isHumanTurn) {
    if (state.phase === "selectQueen") {
      for (let i = 0; i < 100; i++) {
        if (state.board[i] === "Q0") highlighted.add(i);
      }
    } else if (state.phase === "moveQueen" && state.selectedQueen !== null) {
      for (const p of queenReach(state.board, state.selectedQueen)) highlighted.add(p);
    } else if (state.phase === "shootArrow" && state.movedTo !== null) {
      for (const p of queenReach(state.board, state.movedTo, state.selectedQueen)) highlighted.add(p);
    }
  }

  function handleCellClick(pos: number) {
    if (!isHumanTurn) return;
    if (state.phase === "selectQueen") {
      if (state.board[pos] === "Q0") dispatch({ type: "selectQueen", pos } satisfies AmazonsAction);
    } else if (state.phase === "moveQueen") {
      if (highlighted.has(pos)) dispatch({ type: "moveQueen", pos } satisfies AmazonsAction);
      else if (state.board[pos] === "Q0") dispatch({ type: "selectQueen", pos } satisfies AmazonsAction);
    } else if (state.phase === "shootArrow") {
      if (highlighted.has(pos)) dispatch({ type: "shootArrow", pos } satisfies AmazonsAction);
    }
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isHumanTurn) statusText = "Bot thinking...";
  else if (state.phase === "selectQueen") statusText = "Select one of your queens (blue).";
  else if (state.phase === "moveQueen") statusText = "Move the queen to a highlighted cell.";
  else statusText = "Shoot an arrow to a highlighted cell.";

  return (
    <div className="amazons">
      <div className={`amazons-status ${statusClass}`}>{statusText}</div>
      <div className="amazons-board">
        {Array.from({ length: SIZE }, (_, row) =>
          Array.from({ length: SIZE }, (_, col) => {
            const pos = rcToPos(row, col);
            const cell = state.board[pos];
            const isHl = highlighted.has(pos);
            const isSel = pos === state.selectedQueen;
            const isMoved = pos === state.movedTo;
            const isDark = (row + col) % 2 === 1;

            return (
              <div
                key={pos}
                className={`amz-cell ${isDark ? "dark" : "light"} ${isHl ? "highlighted" : ""} ${isSel ? "selected" : ""} ${isMoved ? "moved" : ""}`}
                onClick={() => handleCellClick(pos)}
                data-testid={`amz-${row}-${col}`}
                role="button"
              >
                {cell === "Q0" && <div className="amz-queen human">♛</div>}
                {cell === "Q1" && <div className="amz-queen bot">♛</div>}
                {cell === "arrow" && <div className="amz-arrow">✦</div>}
              </div>
            );
          })
        )}
      </div>
      <div className="amazons-legend">
        <span className="amz-leg human-leg">♛ You (Blue queens)</span>
        <span className="amz-leg bot-leg">♛ Bot (Red queens)</span>
        <span className="amz-leg">✦ Arrow (wall)</span>
      </div>
      <div className="amazons-moves">Moves: {state.movesMade}</div>
    </div>
  );
}
