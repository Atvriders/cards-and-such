import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ConquianState } from "./state.js";
import { isTerminal, isValidMeld, findMelds } from "./state.js";
import "./Conquian.css";

type ConquianAction =
  | { type: "take" }
  | { type: "pass" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Conquian({
  state,
  dispatch,
  onGameOver,
}: GameProps<ConquianState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { playerHand, botHand, discard, playerMelds, botMelds, drawnCard, phase, message, winner } = state;
  const done = phase === "done";
  const topDiscard = discard[discard.length - 1];

  const selectedCards = playerHand.filter(c => selectedIds.includes(c.id));
  const meldValid = isValidMeld(selectedCards) && drawnCard && selectedIds.includes(drawnCard.id);

  const toggleCard = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="conquian">
      <div className="conquian-header">
        <span>Your melds: {playerMelds.length}</span>
        <span>Bot melds: {botMelds.length}</span>
        <span>Discard pile: {discard.length}</span>
      </div>

      <div className="conquian-area">
        <div className="conquian-discard">
          <div className="conquian-label">Top discard</div>
          {topDiscard ? (
            <div
              className="conquian-card"
              style={{ color: topDiscard.suit === "♥" || topDiscard.suit === "♦" ? "#c62828" : "#333" }}
            >
              {topDiscard.suit}{rankLabel(topDiscard.rank)}
            </div>
          ) : <span className="conquian-label">—</span>}
        </div>

        <div style={{ textAlign: "center" }}>
          <div className="conquian-label">Bot hand ({botHand.length})</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "center" }}>
            {botHand.map((_, i) => <div key={i} className="conquian-card-back" />)}
          </div>
          {botMelds.length > 0 && (
            <>
              <div className="conquian-label" style={{ marginTop: 4 }}>Bot melds:</div>
              <div className="conquian-melds">
                {botMelds.map((meld, mi) => (
                  <div key={mi} className="conquian-meld-group">
                    {meld.map(c => <span key={c.id} style={{ fontSize: "0.85rem" }}>{c.suit}{rankLabel(c.rank)}</span>)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="conquian-message">{message}</div>

      {done && (
        <div className="conquian-done">
          {winner === "player" ? "You win!" : winner === "bot" ? "Bot wins!" : "Draw!"}
        </div>
      )}

      {!done && (
        <>
          {playerMelds.length > 0 && (
            <>
              <div className="conquian-label">Your melds:</div>
              <div className="conquian-melds">
                {playerMelds.map((meld, mi) => (
                  <div key={mi} className="conquian-meld-group">
                    {meld.map(c => <span key={c.id} style={{ fontSize: "0.85rem" }}>{c.suit}{rankLabel(c.rank)}</span>)}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="conquian-label">
            Your hand ({playerHand.length}) — click to select for meld:
          </div>
          <div className="conquian-hand">
            {playerHand.map(card => (
              <div
                key={card.id}
                className={`conquian-card${selectedIds.includes(card.id) ? " selected" : ""}${drawnCard?.id === card.id ? " drawn" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => (phase === "player-meld") && toggleCard(card.id)}
              >
                {card.suit}{rankLabel(card.rank)}
              </div>
            ))}
          </div>

          <div className="conquian-actions">
            {phase === "player-draw" && (
              <>
                <button className="conquian-btn" onClick={() => dispatch({ type: "take" } as ConquianAction)}>
                  Take discard
                </button>
                <button className="conquian-btn secondary" onClick={() => dispatch({ type: "pass" } as ConquianAction)}>
                  Pass
                </button>
              </>
            )}
            {phase === "player-meld" && (
              <>
                {meldValid && (
                  <button className="conquian-btn" onClick={() => {
                    dispatch({ type: "meld", cardIds: selectedIds } as ConquianAction);
                    setSelectedIds([]);
                  }}>
                    Meld selected ({selectedCards.length} cards)
                  </button>
                )}
                {drawnCard && (
                  <button className="conquian-btn danger" onClick={() => dispatch({ type: "discard", cardId: drawnCard.id } as ConquianAction)}>
                    Discard drawn card
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
