import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KalahState, KalahSettings } from "./state.js";
import { type KalahAction, P0_PITS, P1_PITS, P0_STORE, P1_STORE, isTerminal } from "./state.js";
import "./Game.css";

export function Kalah({ state, dispatch, onGameOver }: GameProps<KalahState, KalahSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; statusClass = ""; }
  else if (!isMyTurn) statusText = "Bot is thinking...";
  else statusText = "Your turn — click a pit to sow.";

  const botPitDisplay = [...P1_PITS].reverse();

  function handleClick(pit: number) {
    if (!isMyTurn || state.board[pit] === 0) return;
    dispatch({ type: "sow", pit } satisfies KalahAction);
  }

  return (
    <div className="kalah">
      <div className={`kalah-status ${statusClass}`}>{statusText}</div>
      <div className="kalah-board">
        <div className="kalah-store my-store" data-testid="store-0">{state.board[P0_STORE]}</div>
        <div className="kalah-pits">
          <div className="kalah-row">
            {botPitDisplay.map((pit) => (
              <button key={pit} className={`kalah-pit bot-pit${state.board[pit] === 0 ? " empty" : ""}`}
                disabled data-testid={`pit-${pit}`}>
                {state.board[pit]}
              </button>
            ))}
          </div>
          <div className="kalah-row">
            {P0_PITS.map((pit) => (
              <button key={pit}
                className={`kalah-pit${state.board[pit] === 0 ? " empty" : isMyTurn ? " active" : ""}`}
                onClick={() => handleClick(pit)}
                disabled={!isMyTurn || state.board[pit] === 0}
                data-testid={`pit-${pit}`}>
                {state.board[pit]}
              </button>
            ))}
          </div>
        </div>
        <div className="kalah-store" data-testid="store-13">{state.board[P1_STORE]}</div>
      </div>
      <div className="kalah-score">Your store: {state.board[P0_STORE]} | Bot store: {state.board[P1_STORE]}</div>
    </div>
  );
}
