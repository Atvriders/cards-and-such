import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CasinoState, CasinoSettings } from "./state.js";
import { canCapture, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Casino.css";

type CasinoAction =
  | { type: "capture"; handCardId: string; tableCardIds: string[] }
  | { type: "build"; handCardId: string; tableCardIds: string[] }
  | { type: "trail"; handCardId: string };

export function Casino({
  state,
  dispatch,
  onGameOver,
}: GameProps<CasinoState, CasinoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedHandCard, setSelectedHandCard] = useState<string | null>(null);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, table, captured, sweeps, stock, phase, turn, message, scores } = state;
  const done = phase === "done";
  const playerHand = [...(hands[0] ?? [])].sort((a, b) => {
    const suitOrder: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
    const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
    return sd !== 0 ? sd : a.rank - b.rank;
  });

  const handCard = selectedHandCard ? (hands[0] ?? []).find(c => c.id === selectedHandCard) : null;
  const tableCards = selectedTableIds.map(id => table.find(c => c.id === id)!).filter(Boolean);
  const captureValid = handCard && tableCards.length > 0 && canCapture(handCard, tableCards, state.builds);

  const toggleTableCard = (id: string): void => {
    setSelectedTableIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCapture = (): void => {
    if (!selectedHandCard) return;
    dispatch({ type: "capture", handCardId: selectedHandCard, tableCardIds: selectedTableIds } as CasinoAction);
    setSelectedHandCard(null);
    setSelectedTableIds([]);
  };

  const handleTrail = (): void => {
    if (!selectedHandCard) return;
    dispatch({ type: "trail", handCardId: selectedHandCard } as CasinoAction);
    setSelectedHandCard(null);
    setSelectedTableIds([]);
  };

  return (
    <div className="casino">
      {/* Header */}
      <div className="casino-header">
        <span>You: {captured[0]?.length ?? 0} cards | {sweeps[0]} sweeps</span>
        <span>Bot: {captured[1]?.length ?? 0} cards | {sweeps[1]} sweeps</span>
        <span>Stock: {stock.length}</span>
      </div>

      {/* Bot hand */}
      <div className="casino-bot-area">
        <div className="casino-bot-label">Bot Hand</div>
        <div className="casino-card-backs">
          {(hands[1] ?? []).map((_, i) => <div key={i} className="casino-card-back" />)}
        </div>
      </div>

      {/* Table */}
      <div className="casino-table-area">
        <div className="casino-table-label">Table ({table.length} cards)</div>
        <div className="casino-table-cards">
          {table.length === 0
            ? <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>Empty</span>
            : table.map(card =>
              (!done && turn === 0)
                ? <Card key={card.id} card={card} className={selectedTableIds.includes(card.id) ? "selected" : ""} onClick={() => toggleTableCard(card.id)} />
                : <Card key={card.id} card={card} className={selectedTableIds.includes(card.id) ? "selected" : ""} />
            )
          }
        </div>
      </div>

      {/* Status */}
      <div className="casino-status">{message}</div>

      {/* Actions */}
      {!done && turn === 0 && (
        <div className="casino-actions">
          <button
            className="casino-btn"
            disabled={!captureValid}
            onClick={handleCapture}
          >
            Capture ({selectedTableIds.length} table cards)
          </button>
          <button
            className="casino-btn"
            disabled={!selectedHandCard}
            onClick={handleTrail}
          >
            Trail to Table
          </button>
        </div>
      )}

      {/* Player hand */}
      <div className="casino-player-area">
        <div className="casino-player-label">Your Hand ({playerHand.length})</div>
        <div className="casino-player-hand">
          {playerHand.map(card =>
            (!done && turn === 0)
              ? <Card
                  key={card.id}
                  card={card}
                  className={selectedHandCard === card.id ? "selected" : ""}
                  onClick={() => {
                    setSelectedHandCard(prev => prev === card.id ? null : card.id);
                    setSelectedTableIds([]);
                  }}
                />
              : <Card key={card.id} card={card} className={done || turn !== 0 ? "dim" : ""} />
          )}
        </div>
        {selectedHandCard && (
          <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
            Card selected. Click table cards to capture, or click "Trail."
          </div>
        )}
      </div>

      {/* Captured summary */}
      <div className="casino-captured-row">
        {[0, 1].map(seat => (
          <div key={seat} className="casino-captured-pile">
            <span>{seat === 0 ? "You" : "Bot"}</span>
            <span>{captured[seat]?.length ?? 0} captured</span>
            <span>{captured[seat]?.filter(c => c.suit === "♠").length ?? 0} ♠</span>
          </div>
        ))}
      </div>

      {/* Result */}
      {done && (
        <div className="casino-result">
          <h2>Game Over</h2>
          <div>{message}</div>
          <div>Your score: <strong>{scores[0]}</strong></div>
          <div>Bot score: <strong>{scores[1]}</strong></div>
          <div>You captured: {captured[0]?.length ?? 0} cards, {sweeps[0]} sweeps</div>
          <div>Bot captured: {captured[1]?.length ?? 0} cards, {sweeps[1]} sweeps</div>
        </div>
      )}
    </div>
  );
}
