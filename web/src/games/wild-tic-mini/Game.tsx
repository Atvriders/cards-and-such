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
      ? state.result === "P" ? "Win!" : state.result === "C" ? "Lose" : "Draw"
      : `Place: ${state.pendingMark}`;

  return (
    <div className="wildmini-wrap">
      <div className="wildmini-bar">
        <span className="wildmini-status">{status}</span>
        <span className="wildmini-score">{state.score}</span>
      </div>
      <div className="wildmini-pick">
        <button
          className={`wildmini-pickbtn ${state.pendingMark === "X" ? "wildmini-pickbtn-active" : ""}`}
          onClick={() => dispatch({ type: "selectMark", mark: "X" } as ConnectAction)}
          disabled={state.phase === "done"}
        >X</button>
        <button
          className={`wildmini-pickbtn ${state.pendingMark === "O" ? "wildmini-pickbtn-active" : ""}`}
          onClick={() => dispatch({ type: "selectMark", mark: "O" } as ConnectAction)}
          disabled={state.phase === "done"}
        >O</button>
      </div>
      <div className="wildmini-board">
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const v = state.board[idx];
          const isWin = state.winLine?.includes(idx);
          return (
            <button
              key={idx}
              className={`wildmini-cell ${v === "X" ? "wildmini-cell-x" : v === "O" ? "wildmini-cell-o" : ""} ${isWin ? "wildmini-cell-win" : ""}`}
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
        <div className="wildmini-final">
          {state.result === "P" ? "Win!" : state.result === "C" ? "Lose" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
