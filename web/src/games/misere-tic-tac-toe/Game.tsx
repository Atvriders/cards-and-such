import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./Game.css";

export function MisereTicTacToeGame({
  state, dispatch, onGameOver,
}: GameProps<GameState, GameSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  const status =
    state.phase === "done"
      ? state.result === "P"
        ? "CPU got 3 — you win!"
        : state.result === "C"
        ? "You got 3 — you lose!"
        : "Draw"
      : "Avoid 3-in-a-row of your X!";

  return (
    <div className="misttt-wrap">
      <div className="misttt-header">
        <h2 className="misttt-title">Misere Tic-Tac-Toe</h2>
        <div className="misttt-info">Anti-TTT: 3-in-a-row of YOUR mark = you LOSE</div>
        <div className="misttt-status">{status}</div>
        <div className="misttt-score">Score: {state.score} · Move {state.moves}</div>
      </div>
      <div className="misttt-board" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const v = state.board[i];
          const isLose = state.loseLine?.includes(i);
          return (
            <button
              key={i}
              className={`misttt-cell ${v === "P" ? "misttt-cell-p" : v === "C" ? "misttt-cell-c" : ""} ${isLose ? "misttt-cell-lose" : ""}`}
              disabled={v !== null || state.phase === "done"}
              onClick={() => dispatch({ type: "place", idx: i } as GameAction)}
              aria-label={`cell ${i}`}
            >
              {v === "P" ? "X" : v === "C" ? "O" : ""}
            </button>
          );
        })}
      </div>
      {state.phase === "done" && (
        <div className="misttt-final">
          {state.result === "P" ? "Victory!" : state.result === "C" ? "Defeat" : "Tie"} — {state.score} pts
        </div>
      )}
    </div>
  );
}
