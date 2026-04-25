import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { InfiniteTTTState, InfiniteTTTSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function InfiniteTTTGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<InfiniteTTTState, InfiniteTTTSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  // Determine oldest pieces (about to disappear)
  const xOldest = state.xMoves.length >= state.maxPerSide ? state.xMoves[0] : null;
  const oOldest = state.oMoves.length >= state.maxPerSide ? state.oMoves[0] : null;

  function handleClick(index: number) {
    if (state.gameOver || state.board[index] !== null) return;
    if (state.settings.opponent === "bot" && state.currentPlayer === "O") return;
    dispatch({ type: "place", index });
    if (state.settings.opponent === "bot" && state.currentPlayer === "X") {
      setTimeout(() => dispatch({ type: "bot-move" }), 300);
    }
  }

  return (
    <div className="ittt-game">
      <div className="ittt-title">Infinite Tic-Tac-Toe</div>
      <div className="ittt-sub">4-in-a-row on 5×5 | oldest piece vanishes after 6 each</div>

      {!state.gameOver && (
        <div className="ittt-turn">
          {state.currentPlayer === "X" ? "Your turn (X)" : state.settings.opponent === "bot" ? "Bot thinking..." : "Player O's turn"}
        </div>
      )}

      <div className="ittt-board">
        {state.board.map((cell, i) => {
          const isFadingX = i === xOldest && cell === "X";
          const isFadingO = i === oOldest && cell === "O";
          return (
            <button
              key={i}
              className={`ittt-cell${cell === "X" ? " x" : cell === "O" ? " o" : ""}${isFadingX || isFadingO ? " fading" : ""}`}
              onClick={() => handleClick(i)}
              disabled={state.gameOver || cell !== null}
            >
              {cell ?? ""}
            </button>
          );
        })}
      </div>

      {state.gameOver && (
        <div className="ittt-result">
          {state.winner === "draw" ? "It's a draw!" : state.winner === "X" ? "X wins!" : "O wins!"}
          <br />
          <span className="ittt-score">Score: {terminal?.score}</span>
        </div>
      )}
    </div>
  );
}
