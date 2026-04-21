import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Rummy500State, Rummy500Settings, TableMeld } from "./state.js";
import { isTerminal, isValidMeld, canLayOffCard } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Rummy500.css";

type Rummy500Action =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "knock" };

export function Rummy500({
  state,
  dispatch,
  onGameOver,
}: GameProps<Rummy500State, Rummy500Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [layoffCard, setLayoffCard] = useState<string | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { hands, stock, discardPile, tableMelds, scores, phase, message, numPlayers } = state;
  const done = phase === "done";
  const playerHand = hands[0] ?? [];
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  const toggleCard = (id: string): void => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedCards = selectedIds.map(id => playerHand.find(c => c.id === id)!).filter(Boolean);
  const canMeld = selectedCards.length >= 3 && isValidMeld(selectedCards);

  const handleLayoffSelect = (cardId: string): void => {
    if (layoffCard === cardId) {
      setLayoffCard(null);
    } else {
      setLayoffCard(cardId);
    }
  };

  const handleMeldClick = (meld: TableMeld): void => {
    if (layoffCard) {
      const card = playerHand.find(c => c.id === layoffCard);
      if (card && canLayOffCard(card, meld)) {
        dispatch({ type: "layoff", cardId: layoffCard, meldId: meld.id } as Rummy500Action);
        setLayoffCard(null);
      }
    }
  };

  const playerNames = ["You", ...Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i + 1}`)];

  return (
    <div className="rummy500">
      {/* Header */}
      <div className="rummy500-header">
        {scores.map((s, i) => (
          <span key={i}>{playerNames[i]}: {s} pts</span>
        ))}
        <span>Stock: {stock.length}</span>
      </div>

      {/* Draw area */}
      {!done && phase === "player-draw" && (
        <div className="rummy500-draw-area">
          <div className="rummy500-pile">
            Stock
            <div
              className="rummy500-card-back"
              onClick={() => dispatch({ type: "draw-stock" } as Rummy500Action)}
            />
          </div>
          <div className="rummy500-pile">
            Discard {topDiscard ? "" : "(empty)"}
            {topDiscard && (
              <Card
                card={topDiscard}
                onClick={() => dispatch({ type: "draw-discard" } as Rummy500Action)}
              />
            )}
          </div>
        </div>
      )}

      {/* Table melds */}
      <div style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase" }}>Table Melds</div>
      <div className="rummy500-table-melds">
        {tableMelds.length === 0 && (
          <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>None yet</span>
        )}
        {tableMelds.map(meld => (
          <div key={meld.id} className="rummy500-meld-group" onClick={() => handleMeldClick(meld)}>
            {meld.cards.map(c => <Card key={c.id} card={c} />)}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="rummy500-status">{message}</div>

      {/* Actions */}
      {!done && phase === "player-meld" && (
        <div className="rummy500-actions">
          <button
            className="rummy500-btn"
            disabled={!canMeld}
            onClick={() => {
              dispatch({ type: "meld", cardIds: selectedIds } as Rummy500Action);
              setSelectedIds([]);
            }}
          >
            Meld ({selectedIds.length} selected)
          </button>
          <button
            className="rummy500-btn"
            disabled={!layoffCard}
            onClick={() => {
              if (layoffCard) setLayoffCard(null);
            }}
          >
            {layoffCard ? "Cancel Lay-off" : "Lay-off Mode"}
          </button>
          {selectedIds.length === 1 && !layoffCard && (
            <button
              className="rummy500-btn"
              onClick={() => {
                dispatch({ type: "discard", cardId: selectedIds[0]! } as Rummy500Action);
                setSelectedIds([]);
              }}
            >
              Discard Selected
            </button>
          )}
        </div>
      )}

      {layoffCard && (
        <div className="rummy500-status" style={{ background: "rgba(255,200,0,0.2)" }}>
          Click a table meld to lay off the selected card.
        </div>
      )}

      {/* Player hand */}
      <div className="rummy500-hand-label">
        Your Hand ({playerHand.length} cards)
      </div>
      <div className="rummy500-hand">
        {[...playerHand]
          .sort((a, b) => {
            const suitOrder: Record<string, number> = { "♠": 0, "♥": 1, "♦": 2, "♣": 3 };
            const sd = (suitOrder[a.suit] ?? 0) - (suitOrder[b.suit] ?? 0);
            return sd !== 0 ? sd : a.rank - b.rank;
          })
          .map(card => {
            const selected = selectedIds.includes(card.id);
            const isLayoff = layoffCard === card.id;
            const clickable = !done && (phase === "player-meld");
            return clickable
              ? (
                <Card
                  key={card.id}
                  card={card}
                  className={selected || isLayoff ? "selected" : ""}
                  onClick={() => {
                    if (layoffCard !== null) {
                      handleLayoffSelect(card.id);
                    } else {
                      toggleCard(card.id);
                    }
                  }}
                />
              )
              : <Card key={card.id} card={card} className="dim" />;
          })}
      </div>

      {/* Result */}
      {done && (
        <div className="rummy500-result">
          <h2>Round Over</h2>
          <div>{message}</div>
          {scores.map((s, i) => (
            <div key={i}>{playerNames[i]}: <strong>{s} pts</strong></div>
          ))}
        </div>
      )}
    </div>
  );
}
