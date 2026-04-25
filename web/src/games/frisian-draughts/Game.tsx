import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FDState, FDSettings } from "./state.js";
import { type FDAction, getLegalMoves, isTerminal } from "./state.js";
import "./Game.css";

export function FrisianDraughts({
  state,
  dispatch,
  onGameOver,
}: GameProps<FDState, FDSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isPlayerTurn = state.turn === "W" && state.winner === null;
  const legalMoves = isPlayerTurn
    ? getLegalMoves(state.board, "W", state.mustContinueFrom)
    : [];

  let statusText = "";
  let statusClass = "";
  if (state.winner === "W") { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === "B") { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (!isPlayerTurn) statusText = "Bot is thinking…";
  else if (state.selected) statusText = "Click a highlighted destination.";
  else statusText = "Click one of your pieces (white).";

  const selectedTos = state.selected
    ? legalMoves.filter(m => m.from[0]===state.selected![0] && m.from[1]===state.selected![1]).map(m => m.to)
    : [];
  const selectableSources = new Set(legalMoves.map(m => `${m.from[0]},${m.from[1]}`));

  function handleClick(r: number, c: number) {
    if (!isPlayerTurn) return;
    dispatch({ type: "click", row: r, col: c } satisfies FDAction);
  }

  function countW() { let n=0; for(const row of state.board) for(const cell of row) { if(cell?.color==="W") n++; } return n; }
  function countB() { let n=0; for(const row of state.board) for(const cell of row) { if(cell?.color==="B") n++; } return n; }

  return (
    <div className="fd">
      <div className={`fd-status ${statusClass}`}>{statusText}</div>
      <div className="fd-info">
        <span>White (you): {countW()}</span>
        <span>Black (bot): {countB()}</span>
      </div>
      <div className="fd-board">
        {state.board.map((row, r) =>
          row.map((cell, c) => {
            const isDark = (r + c) % 2 === 1;
            const key = `${r},${c}`;
            const isSelected = state.selected?.[0] === r && state.selected?.[1] === c;
            const isTarget = selectedTos.some(([tr,tc]) => tr===r && tc===c);
            const isSelectable = isDark && isPlayerTurn && selectableSources.has(key) && !isSelected;
            return (
              <div
                key={key}
                className={`fd-cell ${isDark ? "dark" : "light"}${isSelected ? " selected" : ""}${isTarget ? " target" : ""}${isSelectable ? " selectable" : ""}`}
                onClick={() => handleClick(r, c)}
              >
                {cell && (
                  <div className={`fd-piece ${cell.color}`}>
                    {cell.king ? "♛" : ""}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <div style={{ fontSize: "0.75rem", color: "#888" }}>
        Frisian: captures orthogonally + diagonally · max capture mandatory
      </div>
    </div>
  );
}
