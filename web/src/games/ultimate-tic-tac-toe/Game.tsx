import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { UltimateTTTState, UltimateTTTSettings } from "./state.js";
import type { UltimateTTTAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function UltimateTicTacToe({
  state,
  dispatch,
  onGameOver,
}: GameProps<UltimateTTTState, UltimateTTTSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleMove(board: number, cell: number) {
    if (state.winner) return;
    dispatch({ type: "move", board, cell } as UltimateTTTAction);
  }

  const statusText = state.winner
    ? state.winner === "X" ? "X wins!" : state.winner === "O" ? "O wins!" : "Draw!"
    : `${state.currentPlayer}'s turn${state.nextBoard !== null ? ` — play in board ${state.nextBoard + 1}` : " — any open board"}`;

  const statusClass = state.winner === "X" ? " win" : state.winner === "O" ? " lose" : state.winner === "draw" ? " draw" : "";

  return (
    <div className="ultimate-ttt">
      <div className="ultimate-ttt-info">
        <span>You = X, AI = O</span>
        <span>Mode: vs {state.settings.opponent}</span>
      </div>
      <div className={`ultimate-ttt-status${statusClass}`}>{statusText}</div>
      <div className="ultimate-ttt-meta">
        {Array.from({ length: 9 }, (_, bIdx) => {
          const winner = state.boardWinners[bIdx];
          const isActive = state.winner === null && (state.nextBoard === null || state.nextBoard === bIdx) && winner === null;
          const wonClass = winner === "X" ? " won-x" : winner === "O" ? " won-o" : winner === "draw" ? " won-draw" : "";
          return (
            <div key={bIdx} className={`ultimate-ttt-miniboard${isActive ? " active" : ""}${wonClass}`}>
              {Array.from({ length: 9 }, (_, cIdx) => {
                const val = state.boards[bIdx]![cIdx];
                return (
                  <button
                    key={cIdx}
                    className={`ultimate-ttt-cell${val === "X" ? " x" : val === "O" ? " o" : ""}`}
                    onClick={() => handleMove(bIdx, cIdx)}
                    disabled={!!state.winner || !isActive || val !== null}
                    aria-label={`Board ${bIdx+1} cell ${cIdx+1}`}
                  >
                    {val ?? ""}
                  </button>
                );
              })}
              {winner && (
                <div className="ultimate-ttt-board-overlay">
                  {winner === "draw" ? "=" : winner}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
