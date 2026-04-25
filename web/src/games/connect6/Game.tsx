import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Connect6State, Connect6Settings } from "./state.js";
import { type Connect6Action, SIZE, isTerminal } from "./state.js";
import "./Game.css";

export function Connect6({ state, dispatch, onGameOver }: GameProps<Connect6State, Connect6Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;
  const lastPlacedSet = new Set(state.lastPlaced);

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win — 6 in a row!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins — 6 in a row!"; statusClass = "loss"; }
  else if (!isMyTurn) statusText = "Bot is placing stones...";
  else statusText = `Your turn — place stone ${3 - state.stonesLeft}/2 (${state.stonesLeft === 1 && state.moveCount === 0 ? "1 stone first move" : `${state.stonesLeft} stone${state.stonesLeft > 1 ? "s" : ""} remaining`})`;

  function handleClick(i: number) {
    if (!isMyTurn || state.board[i] !== null) return;
    dispatch({ type: "place", cell: i } satisfies Connect6Action);
  }

  return (
    <div className="connect6">
      <div className={`connect6-status ${statusClass}`}>{statusText}</div>
      <div className="connect6-grid">
        {state.board.map((cell, i) => (
          <div key={i} className="connect6-cell" onClick={() => handleClick(i)} data-testid={`cell-${i}`}>
            {cell !== null && (
              <div className={`connect6-stone ${cell === 0 ? "black" : "white"}${lastPlacedSet.has(i) ? " last" : ""}`} />
            )}
          </div>
        ))}
      </div>
      <div className="connect6-info">You: Black ● | Bot: White ○ | First move: 1 stone, then 2 per turn</div>
    </div>
  );
}
