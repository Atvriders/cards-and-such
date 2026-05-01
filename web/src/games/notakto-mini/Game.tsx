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
      ? state.result === "P"
        ? "CPU made 3-in-a-row — you win!"
        : state.result === "C"
        ? "You made 3-in-a-row — you lose"
        : "Board full — draw"
      : "Avoid making 3-in-a-row of X";

  return (
    <div className="notakto-wrap">
      <div className="notakto-header">
        <h2 className="notakto-title">Notakto (Mini)</h2>
        <div className="notakto-info">Both players place X. Whoever makes {TARGET}-in-a-row LOSES.</div>
        <div className="notakto-status">{status}</div>
        <div className="notakto-score">Score: {state.score}</div>
      </div>
      <div className="notakto-board">
        {Array.from({ length: ROWS * COLS }).map((_, idx) => {
          const r = Math.floor(idx / COLS);
          const c = idx % COLS;
          const v = state.board[idx];
          const isLose = state.loseLine?.includes(idx);
          return (
            <button
              key={idx}
              className={`notakto-cell ${v === "P" ? "notakto-cell-p" : v === "C" ? "notakto-cell-c" : ""} ${isLose ? "notakto-cell-lose" : ""}`}
              disabled={v !== null || state.phase === "done"}
              onClick={() => dispatch({ type: "place", row: r, col: c } as ConnectAction)}
              aria-label={`r${r}c${c}`}
            >
              {v ? "X" : ""}
            </button>
          );
        })}
      </div>
      {state.phase === "done" && (
        <div className="notakto-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
