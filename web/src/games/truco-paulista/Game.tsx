import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TrucoPaulistaState } from "./state.js";
import { isTerminal, cardStrength } from "./state.js";
import "./Game.css";

type TrucoPaulistaAction = { type: "play"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Game({ state, dispatch, onGameOver }: GameProps<TrucoPaulistaState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, playerTrick, botTrick, playerScore, botScore, roundsWon, phase, message, finalScores } = state;
  const done = phase === "done";
  const isPlayerTurn = phase === "player-turn";

  return (
    <div className="truco-paulista">
      <div className="tp-header">
        <span>You: {playerScore} pts</span>
        <span>Tricks — You: {roundsWon.player} Bot: {roundsWon.bot}</span>
        <span>Bot: {botScore} pts</span>
      </div>

      <div className="tp-note">Manilha: 4s are highest (♣4 &gt; ♥4 &gt; ♠4 &gt; ♦4)</div>

      <div className="tp-table">
        <div className="tp-played">
          <div className="tp-label">Your card</div>
          <div className={`tp-card${playerTrick ? " played" : " empty"}`}
            style={{ color: playerTrick && (playerTrick.suit === "♥" || playerTrick.suit === "♦") ? "#c62828" : "#333" }}>
            {playerTrick ? `${playerTrick.suit}${rankLabel(playerTrick.rank)}` : "—"}
          </div>
        </div>
        <div className="tp-played">
          <div className="tp-label">Bot card</div>
          <div className={`tp-card${botTrick ? " played bot" : " empty"}`}
            style={{ color: botTrick && (botTrick.suit === "♥" || botTrick.suit === "♦") ? "#c62828" : "#333" }}>
            {botTrick ? `${botTrick.suit}${rankLabel(botTrick.rank)}` : "—"}
          </div>
        </div>
      </div>

      <div className="tp-message">{message}</div>

      {finalScores && <div className="tp-done">Final: You {finalScores.player} — Bot {finalScores.bot}</div>}

      {!done && (
        <>
          <div className="tp-label">Your hand — click to play:</div>
          <div className="tp-hand">
            {playerHand.map(card => {
              const isManilha = card.rank === 4;
              return (
                <div
                  key={card.id}
                  className={`tp-card hand${isManilha ? " manilha" : ""}${!isPlayerTurn ? " disabled" : ""}`}
                  style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                  onClick={() => isPlayerTurn && dispatch({ type: "play", cardId: card.id } as TrucoPaulistaAction)}
                >
                  {card.suit}{rankLabel(card.rank)}
                  {isManilha && <span className="tp-manilha-mark">M</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
