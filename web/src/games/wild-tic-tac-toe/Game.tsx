import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { isTerminal, ROWS, COLS } from "./state.js";
import "./Game.css";

export function ConnectGame({
  state, dispatch, onGameOver,
}: GameProps<ConnectState, ConnectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const status =
    state.phase === "done"
      ? state.result === "P"
        ? "You completed a line — you win!"
        : state.result === "C"
        ? "CPU completed a line — you lose"
        : "Draw"
      : `Pick X or O, then place. Currently: ${state.pendingMark}`;

  return (
    <div className="wildttt-wrap">
      <div className="wildttt-header">
        <h2 className="wildttt-title">Wild Tic-Tac-Toe</h2>
        <div className="wildttt-info">Anyone who completes 3 of either symbol wins.</div>
        <div className="wildttt-status">{status}</div>
        <div className="wildttt-score">Score: {state.score}</div>
      </div>

      <div className="wildttt-pick">
        <span className="wildttt-pick-label">Place:</span>
        <button
          className={`wildttt-pickbtn ${state.pendingMark === "X" ? "wildttt-pickbtn-active" : ""}`}
          onClick={() => dispatch({ type: "selectMark", mark: "X" } as ConnectAction)}
          disabled={state.phase === "done"}
        >
          X
        </button>
        <button
          className={`wildttt-pickbtn ${state.pendingMark === "O" ? "wildttt-pickbtn-active" : ""}`}
          onClick={() => dispatch({ type: "selectMark", mark: "O" } as ConnectAction)}
          disabled={state.phase === "done"}
        >
          O
        </button>
      </div>

      <div className="wildttt-board">
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const v = state.board[idx];
          const isWin = state.winLine?.includes(idx);
          return (
            <button
              key={idx}
              className={`wildttt-cell ${v === "X" ? "wildttt-cell-x" : v === "O" ? "wildttt-cell-o" : ""} ${isWin ? "wildttt-cell-win" : ""}`}
              disabled={v !== null || state.phase === "done"}
              onClick={() => dispatch({ type: "place", row: r, col: c } as ConnectAction)}
              aria-label={`r${r}c${c}`}
            >
              {v ?? ""}
            </button>
          );
        })}
      </div>

      {state.phase === "done" && (
        <div className="wildttt-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
