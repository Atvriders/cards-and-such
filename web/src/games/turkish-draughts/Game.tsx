import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TurkishDraughtsState, TurkishDraughtsSettings, TurkishDraughtsAction } from "./state.js";
import { isTerminal, getLegalMoves } from "./state.js";
import "./Game.css";

export function TurkishDraughts({
  state,
  dispatch,
  onGameOver,
}: GameProps<TurkishDraughtsState, TurkishDraughtsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const CELL = 62;

  // Compute valid targets for selected piece
  const selected = state.selected;
  let validTargets = new Set<number>();
  if (selected !== null && state.turn === "white" && state.winner === null) {
    const moves = getLegalMoves(state.board, "white", state.mustContinueFrom);
    for (const m of moves) {
      if (m.from === selected) validTargets.add(m.to);
    }
  }

  function handleCellClick(pos: number) {
    if (state.winner !== null || state.turn !== "white") return;
    if (validTargets.has(pos)) {
      dispatch({ type: "move", to: pos } satisfies TurkishDraughtsAction);
    } else {
      const p = state.board[pos];
      if (p && p.color === "white") {
        dispatch({ type: "select", pos } satisfies TurkishDraughtsAction);
      }
    }
  }

  let statusText = "";
  let statusClass = "";
  const wCount = state.board.filter((p) => p?.color === "white").length;
  const bCount = state.board.filter((p) => p?.color === "black").length;

  if (state.winner === "white") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.turn === "black") { statusText = "Bot thinking..."; }
  else if (state.mustContinueFrom !== null) { statusText = "Continue capturing!"; }
  else if (selected !== null) { statusText = "Click a highlighted square to move."; }
  else { statusText = "Your turn — select a white piece."; }

  return (
    <div className="turkdraughts-game">
      <div className="turkdraughts-counts">
        <span>White: {wCount}</span>
        <span>Black: {bCount}</span>
      </div>
      <div className={`turkdraughts-status ${statusClass}`}>{statusText}</div>
      <div
        className="turkdraughts-board"
        style={{ width: CELL * 8, height: CELL * 8 }}
      >
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const piece = state.board[i];
          const isSelected = selected === i;
          const isTarget = validTargets.has(i);

          let cellClass = "turkdraughts-cell";
          if (isSelected) cellClass += " selected";
          else if (isTarget) cellClass += " target";

          return (
            <div
              key={i}
              className={cellClass}
              style={{ width: CELL, height: CELL, left: c * CELL, top: r * CELL }}
              onClick={() => handleCellClick(i)}
            >
              {piece && (
                <div
                  className={`turkdraughts-piece ${piece.color}${piece.king ? " king" : ""}`}
                >
                  {piece.king ? "♛" : "●"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
