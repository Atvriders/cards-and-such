import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TonkState } from "./state.js";
import { isTerminal, findBestMelds, tonkCardValue } from "./state.js";
import "./Game.css";

type TonkAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "discard"; cardId: string }
  | { type: "tonk" };

function rankLabel(rank: number): string {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return String(rank);
}

export function Game({ state, dispatch, onGameOver }: GameProps<TonkState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { playerHand, stockPile, discardPile, drawnCard, phase, message, finalScores } = state;
  const done = phase === "done";
  const isDrawPhase = phase === "draw";
  const isDiscardPhase = phase === "discard";

  const fullHand = drawnCard ? [...playerHand, drawnCard] : [...playerHand];
  const { melds, deadwood } = findBestMelds(fullHand);
  const meldIds = new Set(melds.flatMap(m => m.map(c => c.id)));
  const deadwoodValue = deadwood.reduce((s, c) => s + tonkCardValue(c.rank), 0);
  const canTonk = deadwood.length === 0 && isDiscardPhase;

  const topDiscard = discardPile[0] ?? null;

  return (
    <div className="tonk">
      <div className="tonk-header">
        <span>Your deadwood: {deadwoodValue} pts</span>
        <span>Stock: {stockPile.length} | Bot: {state.botHand.length} cards</span>
      </div>

      <div className="tonk-message">{message}</div>

      {finalScores && (
        <div className="tonk-done">
          You: {finalScores.player} pts | Bot: {finalScores.bot} pts
        </div>
      )}

      {!done && isDrawPhase && (
        <div className="tonk-draw-actions">
          <button data-testid="hint-target-tonk-primary" className="tonk-btn" onClick={() => dispatch({ type: "draw-stock" } as TonkAction)}>
            Draw Stock ({stockPile.length})
          </button>
          {topDiscard && (
            <button className="tonk-btn secondary" onClick={() => dispatch({ type: "draw-discard" } as TonkAction)}>
              Take Discard ({topDiscard.suit}{rankLabel(topDiscard.rank)})
            </button>
          )}
        </div>
      )}

      {!done && (
        <>
          <div className="tonk-label">
            Your hand{drawnCard ? ` + drew ${drawnCard.suit}${rankLabel(drawnCard.rank)}` : ""} — {isDiscardPhase ? "click to select then discard" : "view melds"}:
          </div>
          <div className="tonk-hand">
            {fullHand.map(card => (
              <div
                key={card.id}
                className={`tonk-card${meldIds.has(card.id) ? " meld" : " dead"}${card.id === selectedId ? " selected" : ""}`}
                style={{ color: card.suit === "♥" || card.suit === "♦" ? "#c62828" : "#333" }}
                onClick={() => {
                  if (!isDiscardPhase) return;
                  setSelectedId(card.id === selectedId ? null : card.id);
                }}
              >
                {card.suit}{rankLabel(card.rank)}
                <span className="tonk-val">({tonkCardValue(card.rank)})</span>
              </div>
            ))}
          </div>

          {isDiscardPhase && (
            <div className="tonk-actions">
              {selectedId && (
                <button className="tonk-btn danger" onClick={() => { dispatch({ type: "discard", cardId: selectedId } as TonkAction); setSelectedId(null); }}>
                  Discard selected
                </button>
              )}
              {canTonk && (
                <button className="tonk-btn success" onClick={() => dispatch({ type: "tonk" } as TonkAction)}>
                  Tonk! (Go out)
                </button>
              )}
            </div>
          )}
        </>
      )}

      <div className="tonk-legend">
        <span className="legend-meld">■ In meld</span>
        <span className="legend-dead">■ Deadwood</span>
      </div>
    </div>
  );
}
