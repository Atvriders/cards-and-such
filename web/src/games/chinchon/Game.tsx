import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ChinchonState } from "./state.js";
import { isTerminal, bestMelds, cardValue } from "./state.js";
import "./Game.css";

type ChinchonAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "discard"; cardId: string }
  | { type: "go-out" };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Game({ state, dispatch, onGameOver }: GameProps<ChinchonState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [discardSel, setDiscardSel] = useState<string | null>(null);

  const { playerHand, stockPile, discardPile, drawnCard, phase, message, finalScores } = state;
  const done = phase === "done";
  const isDiscard = phase === "discard";

  const fullHand = drawnCard ? [...playerHand, drawnCard] : [...playerHand];
  const { melds, deadwood } = bestMelds(fullHand);
  const meldIds = new Set(melds.flatMap(m => m.map(c => c.id)));
  const deadwoodValue = deadwood.reduce((s, c) => s + cardValue(c.rank), 0);
  const canGoOut = deadwood.length === 0 && isDiscard;

  const topDiscard = discardPile[0] ?? null;

  return (
    <div className="chinchon">
      <div className="chinchon-header">
        <span>Deadwood: {deadwoodValue} pts</span>
        <span>Stock: {stockPile.length} | Discard top: {topDiscard ? `${topDiscard.suit}${rankLabel(topDiscard.rank)}` : "—"}</span>
      </div>

      <div className="chinchon-message">{message}</div>

      {finalScores && (
        <div className="chinchon-done bounce-in">
          Your deadwood: {finalScores.player} | Bot deadwood: {finalScores.bot}
        </div>
      )}

      {!done && phase === "draw" && (
        <div className="chinchon-draw-actions">
          <button data-testid="hint-target-chinchon-primary" className="chinchon-btn" onClick={() => dispatch({ type: "draw-stock" } as ChinchonAction)}>
            Draw from Stock ({stockPile.length})
          </button>
          {topDiscard && (
            <button className="chinchon-btn secondary" onClick={() => dispatch({ type: "draw-discard" } as ChinchonAction)}>
              Take Discard ({topDiscard.suit}{rankLabel(topDiscard.rank)})
            </button>
          )}
        </div>
      )}

      {!done && (
        <>
          <div className="chinchon-label">
            Your hand{drawnCard ? ` + drew ${drawnCard.suit}${rankLabel(drawnCard.rank)}` : ""} — click to {isDiscard ? "discard" : "view"}:
          </div>
          <div className="chinchon-hand">
            {fullHand.map(card => (
              <div
                key={card.id}
                className={`chinchon-card${meldIds.has(card.id) ? " meld" : " dead"}${card.id === discardSel ? " selected" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => {
                  if (!isDiscard) return;
                  setDiscardSel(card.id === discardSel ? null : card.id);
                }}
              >
                {card.suit}{rankLabel(card.rank)}
                <span className="chinchon-val">({cardValue(card.rank)})</span>
              </div>
            ))}
          </div>

          {isDiscard && (
            <div className="chinchon-actions">
              {discardSel && (
                <button className="chinchon-btn danger" onClick={() => { dispatch({ type: "discard", cardId: discardSel } as ChinchonAction); setDiscardSel(null); }}>
                  Discard selected
                </button>
              )}
              {canGoOut && (
                <button className="chinchon-btn success" onClick={() => dispatch({ type: "go-out" } as ChinchonAction)}>
                  Go Out (Chinchón!)
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="chinchon-legend">
        <span className="legend-meld">■ In meld</span>
        <span className="legend-dead">■ Deadwood</span>
      </div>
    </div>
  );
}
