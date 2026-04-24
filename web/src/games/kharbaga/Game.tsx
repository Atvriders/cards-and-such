import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KharbagaState, KharbagaSettings, KharbagaAction } from "./state.js";
import { isTerminal, getLegalMoves } from "./state.js";
import "./Game.css";

export function Kharbaga({
  state,
  dispatch,
  onGameOver,
}: GameProps<KharbagaState, KharbagaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const CELL = 80;
  const selected = state.selected;
  let validTargets = new Set<number>();
  if (selected !== null && state.turn === "white" && state.winner === null) {
    const moves = getLegalMoves(state.board, "white", state.mustContinueFrom);
    for (const m of moves) {
      if (m.from === selected) validTargets.add(m.to);
    }
  }

  function handleClick(pos: number) {
    if (state.winner !== null || state.turn !== "white") return;
    if (validTargets.has(pos)) {
      dispatch({ type: "move", to: pos } satisfies KharbagaAction);
    } else if (state.board[pos] === "white") {
      dispatch({ type: "select", pos } satisfies KharbagaAction);
    }
  }

  let statusText = "";
  let statusClass = "";
  const wCount = state.board.filter((c) => c === "white").length;
  const bCount = state.board.filter((c) => c === "black").length;

  if (state.winner === "white") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.turn === "black") { statusText = "Bot thinking..."; }
  else if (state.mustContinueFrom !== null) { statusText = "Continue capturing!"; }
  else if (selected !== null) { statusText = "Click a highlighted square to move."; }
  else { statusText = "Your turn — select a white piece."; }

  return (
    <div className="kharbaga-game">
      <div className="kharbaga-counts">
        <span>White: {wCount}</span>
        <span>Black: {bCount}</span>
      </div>
      <div className={`kharbaga-status ${statusClass}`}>{statusText}</div>
      <div className="kharbaga-board" style={{ width: CELL * 5, height: CELL * 5 }}>
        {Array.from({ length: 25 }, (_, i) => {
          const r = Math.floor(i / 5);
          const c = i % 5;
          const cell = state.board[i];
          const isSelected = selected === i;
          const isTarget = validTargets.has(i);
          let cls = "kharbaga-cell";
          if (isSelected) cls += " selected";
          else if (isTarget) cls += " target";

          return (
            <div
              key={i}
              className={cls}
              style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}
              onClick={() => handleClick(i)}
            >
              {cell && (
                <div className={`kharbaga-piece ${cell}`}>●</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
