import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MancalaState, MancalaSettings } from "./state.js";
import { type MancalaAction, PLAYER0_PITS, PLAYER1_PITS, PLAYER0_STORE, PLAYER1_STORE, isTerminal } from "./state.js";
import "./Game.css";

export function Mancala({
  state,
  dispatch,
  onGameOver,
}: GameProps<MancalaState, MancalaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null;

  function handlePitClick(pit: number) {
    if (!isMyTurn) return;
    if (state.board[pit] === 0) return;
    dispatch({ type: "sow", pit } satisfies MancalaAction);
  }

  let statusText = "";
  let statusClass = "";
  if (state.winner === 0) { statusText = "You win!"; statusClass = "win"; }
  else if (state.winner === 1) { statusText = "Bot wins!"; statusClass = "loss"; }
  else if (state.winner === "draw") { statusText = "Draw!"; statusClass = ""; }
  else if (!isMyTurn) statusText = "Bot is thinking...";
  else statusText = "Your turn — click a pit to sow seeds.";

  // Bot pits displayed left-to-right from player's perspective (reversed)
  const botPitDisplay = [...PLAYER1_PITS].reverse();

  return (
    <div className="mancala">
      <div className={`mancala-status ${statusClass}`}>{statusText}</div>
      <div className="mancala-board">
        {/* Player 0 store on the left */}
        <div className="mancala-store my-store" data-testid="store-0">
          {state.board[PLAYER0_STORE]}
        </div>

        <div className="mancala-pits">
          {/* Bot pits (top row, reversed) */}
          <div className="mancala-row">
            {botPitDisplay.map((pit) => (
              <button
                key={pit}
                className={`mancala-pit bot-pit ${state.board[pit] === 0 ? "empty" : ""}`}
                disabled
                data-testid={`pit-${pit}`}
                aria-label={`bot pit ${pit} (${state.board[pit]} seeds)`}
              >
                {state.board[pit]}
              </button>
            ))}
          </div>

          {/* Player pits (bottom row) */}
          <div className="mancala-row">
            {PLAYER0_PITS.map((pit) => (
              <button
                key={pit}
                className={`mancala-pit ${state.board[pit] === 0 ? "empty" : isMyTurn ? "active" : ""}`}
                onClick={() => handlePitClick(pit)}
                disabled={!isMyTurn || state.board[pit] === 0}
                data-testid={`pit-${pit}`}
                aria-label={`your pit ${pit} (${state.board[pit]} seeds)`}
              >
                {state.board[pit]}
              </button>
            ))}
          </div>
        </div>

        {/* Player 1 store on the right */}
        <div className="mancala-store" data-testid="store-13">
          {state.board[PLAYER1_STORE]}
        </div>
      </div>
      <div style={{ fontSize: "0.8rem", color: "#666" }}>
        Your store: {state.board[PLAYER0_STORE]} | Bot store: {state.board[PLAYER1_STORE]}
      </div>
    </div>
  );
}
