import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GomokuTacticState, GomokuTacticAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./GomokuTactic.css";

const SIZE = 9;

export function GomokuTactic({
  state,
  dispatch,
  onGameOver,
}: GameProps<GomokuTacticState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  return (
    <div className="gomoku-tactic">
      <h2>GOMOKU TACTIC</h2>
      <div className="gt-info">
        <span>Moves: <b>{state.moveCount}</b></span>
        {!state.gameOver && <span>Your turn (Black)</span>}
      </div>

      <div className="gt-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 36px)` }}>
        {state.board.map((stone, i) => {
          const isWin = state.winLine?.includes(i) ?? false;
          return (
            <button
              key={i}
              className={`gt-cell${stone === "B" ? " black" : stone === "W" ? " white" : ""}${isWin ? " win" : ""}`}
              onClick={() => dispatch({ type: "place", index: i } as GomokuTacticAction)}
              disabled={state.gameOver || stone !== null}
            >
              {stone === "B" ? "●" : stone === "W" ? "○" : ""}
            </button>
          );
        })}
      </div>

      {state.winner === "B" && <div className="gt-win">Black wins!</div>}
      {state.winner === "W" && <div className="gt-lose">White wins!</div>}
      {state.winner === "draw" && <div className="gt-draw">Draw!</div>}
    </div>
  );
}
