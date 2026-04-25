import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NumericTTTState, NumericTTTAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./NumericTicTacToe.css";

export function NumericTicTacToe({
  state,
  dispatch,
  onGameOver,
}: GameProps<NumericTTTState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="numeric-ttt">
      <h2>NUMERIC TTT</h2>
      <div className="nttt-rule">3 numbers summing to 15 in a line wins!</div>

      <div className="nttt-pickers">
        <div className="nttt-picker">
          <div className="nttt-picker-label">Your numbers (odd):</div>
          <div className="nttt-nums">
            {state.humanNumbers.map((n) => (
              <button
                key={n}
                className={`nttt-num${state.selectedNumber === n ? " selected" : ""}`}
                onClick={() => dispatch({ type: "selectNumber", number: n } as NumericTTTAction)}
                disabled={state.gameOver || state.currentPlayer !== "human"}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="nttt-picker">
          <div className="nttt-picker-label">AI numbers (even):</div>
          <div className="nttt-nums">
            {state.aiNumbers.map((n) => (
              <span key={n} className="nttt-num ai">{n}</span>
            ))}
          </div>
        </div>
      </div>

      {state.selectedNumber !== null && (
        <div className="nttt-selected">Selected: <b>{state.selectedNumber}</b> — click a cell</div>
      )}

      <div className="nttt-board">
        {state.board.map((cell, i) => (
          <button
            key={i}
            className={`nttt-cell${cell !== null ? (cell % 2 === 1 ? " odd" : " even") : ""}`}
            onClick={() => dispatch({ type: "place", index: i } as NumericTTTAction)}
            disabled={state.gameOver || cell !== null || state.selectedNumber === null}
          >
            {cell !== null ? cell : ""}
          </button>
        ))}
      </div>

      {state.winner === "human" && <div className="nttt-win">You win!</div>}
      {state.winner === "ai" && <div className="nttt-lose">AI wins!</div>}
      {state.winner === "draw" && <div className="nttt-draw">Draw!</div>}
    </div>
  );
}
