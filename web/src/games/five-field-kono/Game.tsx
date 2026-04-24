import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveFieldKonoState, FiveFieldKonoSettings, FiveFieldKonoAction } from "./state.js";
import { isTerminal, getLegalMoves, SIZE } from "./state.js";
import "./Game.css";

export function FiveFieldKono({
  state,
  dispatch,
  onGameOver,
}: GameProps<FiveFieldKonoState, FiveFieldKonoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const CELL = 80;
  const selected = state.selected;

  let validTargets = new Set<number>();
  if (selected !== null && state.turn === "white" && state.winner === null) {
    const moves = getLegalMoves(state.board, "white");
    for (const m of moves) {
      if (m.from === selected) validTargets.add(m.to);
    }
  }

  function handleClick(pos: number) {
    if (state.winner !== null || state.turn !== "white") return;
    if (validTargets.has(pos)) {
      dispatch({ type: "move", to: pos } satisfies FiveFieldKonoAction);
    } else if (state.board[pos] === "white") {
      dispatch({ type: "select", pos } satisfies FiveFieldKonoAction);
    }
  }

  let statusText = "";
  let statusClass = "";
  const wCount = state.board.filter((c) => c === "white").length;
  const bCount = state.board.filter((c) => c === "black").length;

  if (state.winner === "white") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "black") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.turn === "black") { statusText = "Bot thinking..."; }
  else if (selected !== null) { statusText = "Click a highlighted square to move."; }
  else { statusText = "Your turn — select a white piece."; }

  return (
    <div className="fivefieldkono-game">
      <div className="fivefieldkono-counts">
        <span>White: {wCount}</span>
        <span>Black: {bCount}</span>
      </div>
      <div className={`fivefieldkono-status ${statusClass}`}>{statusText}</div>
      <div className="fivefieldkono-board" style={{ width: CELL * SIZE, height: CELL * SIZE }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const r = Math.floor(i / SIZE);
          const c = i % SIZE;
          const cell = state.board[i];
          const isSelected = selected === i;
          const isTarget = validTargets.has(i);
          const isCapture = isTarget && cell !== null && cell !== "white";
          let cls = "fivefieldkono-cell";
          if (isSelected) cls += " selected";
          else if (isCapture) cls += " capture";
          else if (isTarget) cls += " target";

          return (
            <div
              key={i}
              className={cls}
              style={{ left: c * CELL, top: r * CELL, width: CELL, height: CELL }}
              onClick={() => handleClick(i)}
            >
              {cell && (
                <div className={`fivefieldkono-piece ${cell}`}>●</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
