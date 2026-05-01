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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (state.phase !== "playing" || state.turn !== "P") return;
      if (/^[1-9]$/.test(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        const r = Math.floor(idx / COLS);
        const c = idx % COLS;
        if (idx < ROWS * COLS && state.board[idx] === null) {
          e.preventDefault();
          dispatch({ type: "place", row: r, col: c } as ConnectAction);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.phase, state.turn, state.board]);

  const status =
    state.phase === "done"
      ? state.result === "P"
        ? "You won!"
        : state.result === "C"
        ? "CPU won"
        : "Draw"
      : state.turn === "P"
      ? "Your turn (X)"
      : "CPU thinking...";

  return (
    <div className="tttclassic-wrap">
      <div className="tttclassic-header">
        <h2 className="tttclassic-title">Tic-Tac-Toe</h2>
        <div className="tttclassic-status">{status}</div>
        <div className="tttclassic-score">Score: {state.score}</div>
      </div>
      <div className="tttclassic-board">
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const v = state.board[idx];
          const isWin = state.winLine?.includes(idx);
          return (
            <button
              key={idx}
              className={`tttclassic-cell ${v === "P" ? "tttclassic-cell-x" : v === "C" ? "tttclassic-cell-o" : ""} ${isWin ? "tttclassic-cell-win" : ""}`}
              disabled={v !== null || state.phase === "done"}
              onClick={() => dispatch({ type: "place", row: r, col: c } as ConnectAction)}
              aria-label={`Row ${r + 1} column ${c + 1} (key ${idx + 1})${v ? `, ${v === "P" ? "X" : "O"}` : ", empty"}`}
            >
              {v === "P" ? "X" : v === "C" ? "O" : ""}
            </button>
          );
        })}
      </div>
      {state.phase === "done" && (
        <div className="tttclassic-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
