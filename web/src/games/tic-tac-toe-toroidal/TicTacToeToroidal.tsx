import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ToroidalTTTState, ToroidalTTTAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./TicTacToeToroidal.css";

export function TicTacToeToroidal({
  state,
  dispatch,
  onGameOver,
}: GameProps<ToroidalTTTState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="toroidal-ttt">
      <h2>TOROIDAL TTT</h2>
      <div className="ttt-subtitle">Board wraps around — edges connect!</div>

      <div className="ttt-board">
        {state.board.map((cell, i) => (
          <button
            key={i}
            className={`ttt-cell${cell === "X" ? " x" : cell === "O" ? " o" : ""}`}
            onClick={() => dispatch({ type: "place", index: i } as ToroidalTTTAction)}
            disabled={state.gameOver || cell !== null}
          >
            {cell ?? ""}
          </button>
        ))}
      </div>

      {!state.gameOver && (
        <div className="ttt-status">Your turn (X)</div>
      )}

      {state.winner === "X" && <div className="ttt-win">You win!</div>}
      {state.winner === "O" && <div className="ttt-lose">AI wins!</div>}
      {state.winner === "draw" && <div className="ttt-draw">Draw!</div>}

      <div className="ttt-hint">Wrap lines count too: corners connect across the board!</div>
    </div>
  );
}
