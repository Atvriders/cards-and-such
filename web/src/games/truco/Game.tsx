import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrucoState } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type TrucoAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Game({ state, dispatch, onGameOver }: GameProps<TrucoState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, playerTrick, botTrick, playerScore, botScore, roundsWon, phase, message, finalScores } = state;
  const done = phase === "done";
  const isPlayerTurn = phase === "player-turn";

  return (
    <div className="truco">
      <div className="truco-header">
        <span>You: {playerScore} pts</span>
        <span>Tricks this hand — You: {roundsWon.player} Bot: {roundsWon.bot}</span>
        <span>Bot: {botScore} pts</span>
      </div>

      <div className="truco-table">
        <div className="truco-played">
          <div className="truco-label">Your card</div>
          <div className={`truco-card${playerTrick ? " played" : " empty"}`}>
            {playerTrick ? `${playerTrick.suit}${rankLabel(playerTrick.rank)}` : "—"}
          </div>
        </div>
        <div className="truco-played">
          <div className="truco-label">Bot card</div>
          <div className={`truco-card${botTrick ? " played bot" : " empty"}`}>
            {botTrick ? `${botTrick.suit}${rankLabel(botTrick.rank)}` : "—"}
          </div>
        </div>
      </div>

      <div className="truco-message">{message}</div>

      {finalScores && (
        <div className="truco-done">
          Final: You {finalScores.player} — Bot {finalScores.bot}
        </div>
      )}

      {!done && (
        <>
          <div className="truco-label">Your hand ({playerHand.length} cards) — click to play:</div>
          <div data-testid="hint-target-truco-hand" className="truco-hand">
            {playerHand.map(card => (
              <div
                key={card.id}
                className={`truco-card hand${!isPlayerTurn ? " disabled" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => isPlayerTurn && dispatch({ type: "play", cardId: card.id } as TrucoAction)}
              >
                {card.suit}{rankLabel(card.rank)}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
