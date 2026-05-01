import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConnectState, ConnectAction, ConnectSettings } from "./state.js";
import { isTerminal, ROWS, COLS, TARGET } from "./state.js";
import "./Game.css";

export function ConnectGame({
  state, dispatch, onGameOver,
}: GameProps<ConnectState, ConnectSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const status =
    state.phase === "done"
      ? state.result === "P" ? "You won!" : state.result === "C" ? "CPU won" : "Draw"
      : "Your move (X)";

  return (
    <div className="ttt4cl-wrap">
      <div className="ttt4cl-header">
        <h2 className="ttt4cl-title">4×4 · Connect-Line</h2>
        <div className="ttt4cl-info">{TARGET}-in-a-row wins (any direction)</div>
        <div className="ttt4cl-status">{status}</div>
        <div className="ttt4cl-score">Score: {state.score}</div>
      </div>
      <div className="ttt4cl-board">
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const v = state.board[idx];
          const isWin = state.winLine?.includes(idx);
          return (
            <button
              key={idx}
              className={`ttt4cl-cell ${v === "P" ? "ttt4cl-cell-x" : v === "C" ? "ttt4cl-cell-o" : ""} ${isWin ? "ttt4cl-cell-win" : ""}`}
              disabled={v !== null || state.phase === "done"}
              onClick={() => dispatch({ type: "place", row: r, col: c } as ConnectAction)}
              aria-label={`r${r}c${c}`}
            >
              {v === "P" ? "X" : v === "C" ? "O" : ""}
            </button>
          );
        })}
      </div>
      {state.phase === "done" && (
        <div className="ttt4cl-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
