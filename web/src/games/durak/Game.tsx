import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DurakState } from "./state.js";
import { isTerminal, canBeat } from "./state.js";
import "./Game.css";

type DurakAction =
  | { type: "play-attack"; cardId: string }
  | { type: "play-defend"; cardId: string }
  | { type: "take" };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Game({ state, dispatch, onGameOver }: GameProps<DurakState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { playerHand, botHand, deck, trump, attackCard, phase, message, finalScores } = state;
  const done = phase === "done";
  const isAttacking = phase === "player-attack";
  const isDefending = phase === "player-defend";

  return (
    <div className="durak fade-in">
      <div className="durak-header">
        <span>Trump: <strong style={{ color: trump === "♥" || trump === "♦" ? "#c62828" : "#333" }}>{trump}</strong></span>
        <span>Deck: {deck.length}</span>
        <span>Bot hand: {botHand.length} cards</span>
      </div>

      <div className="durak-table">
        <div className="durak-slot">
          <div className="durak-label">Attack card</div>
          <div className={`durak-card${attackCard ? " played" : " empty"}`}
            style={{ color: attackCard && (attackCard.suit === "♥" || attackCard.suit === "♦") ? "#c62828" : "#333" }}>
            {attackCard ? `${attackCard.suit}${rankLabel(attackCard.rank)}` : "—"}
          </div>
        </div>
      </div>

      <div className="durak-message">{message}</div>

      {finalScores && (
        <div className="durak-done bounce-in">
          {finalScores.player > finalScores.bot ? "You WIN — bot is Durak!" : finalScores.player < finalScores.bot ? "You are the Durak (fool)!" : "Draw!"}
        </div>
      )}

      {!done && isDefending && attackCard && (
        <div className="durak-actions">
          <button data-testid="hint-target-durak-action" className="durak-btn danger" onClick={() => dispatch({ type: "take" } as DurakAction)}>
            Take card
          </button>
        </div>
      )}

      {!done && (
        <>
          <div className="durak-label">
            Your hand ({playerHand.length}) — {isAttacking ? "click to attack" : isDefending ? "click to defend" : "waiting…"}:
          </div>
          <div className="durak-hand">
            {playerHand.map(card => {
              const isTrump = card.suit === trump;
              const canPlay = isAttacking || (isDefending && attackCard ? canBeat(attackCard, card, trump) : false);
              return (
                <div
                  key={card.id}
                  className={`durak-card hand${isTrump ? " trump" : ""}${!canPlay ? " disabled" : ""}`}
                  style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                  onClick={() => {
                    if (!canPlay) return;
                    if (isAttacking) dispatch({ type: "play-attack", cardId: card.id } as DurakAction);
                    if (isDefending) dispatch({ type: "play-defend", cardId: card.id } as DurakAction);
                  }}
                >
                  {card.suit}{rankLabel(card.rank)}
                  {isTrump && <span className="durak-trump-mark">★</span>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
