import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GomokuState, GomokuSettings } from "./state.js";
import { type GomokuAction, isTerminal } from "./state.js";
import type { Coord } from "../../engines/grid/index.js";
import "./Game.css";

export function Gomoku({
  state,
  dispatch,
  onGameOver,
}: GameProps<GomokuState, GomokuSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === "B" && state.winner === null;
  const winSet = new Set((state.winningLine ?? []).map((c) => `${c.row},${c.col}`));

  function handleClick(c: Coord) {
    if (!isMyTurn) return;
    dispatch({ type: "place", at: c } satisfies GomokuAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === "B") { statusText = "You win! (Black)"; statusClass = "win"; }
  else if (state.winner === "W") { statusText = "Bot wins! (White)"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; }
  else if (!isMyTurn) statusText = "Bot thinking... (White)";
  else statusText = "Your turn — place a Black stone.";

  const size = state.grid.rows;

  return (
    <div className="gomoku">
      <div className={`gomoku-status ${statusClass}`}>{statusText}</div>
      <div className="gomoku-board-wrap">
        <div
          className="gomoku-board"
          style={{ gridTemplateColumns: `repeat(${size}, 36px)`, gridTemplateRows: `repeat(${size}, 36px)` }}
        >
          {[...state.grid.coords()].map((c) => {
            const val = state.grid.get(c);
            const key = `${c.row},${c.col}`;
            const isWin = winSet.has(key);
            const isEdgeR = c.col === size - 1;
            const isEdgeB = c.row === size - 1;
            return (
              <div
                key={key}
                className="gomoku-cell"
                onClick={() => handleClick(c)}
                data-testid={`gomoku-${c.row}-${c.col}`}
                role="button"
                aria-label={`row ${c.row + 1} col ${c.col + 1}`}
              >
                {!isEdgeR && <div className="gomoku-line-h" />}
                {!isEdgeB && <div className="gomoku-line-v" />}
                {val !== null ? (
                  <div className={`gomoku-stone ${val === "B" ? "black" : "white"} ${isWin ? "win-stone" : ""}`} />
                ) : isMyTurn ? (
                  <div className="gomoku-hover-dot" />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
