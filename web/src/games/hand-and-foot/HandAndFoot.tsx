import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HandAndFootState, HandAndFootSettings } from "./state.js";
import { isTerminal, isValidMeld } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./HandAndFoot.css";

type HandAndFootAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

export function HandAndFoot({ state, dispatch, onGameOver }: GameProps<HandAndFootState, HandAndFootSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);

  const { hands, feet, usingFoot, stock, discardPile, phase, message, tableMelds, scores, numPlayers } = state;
  const playerHand = hands[0] ?? [];
  const playerFoot = feet[0] ?? [];
  const done = phase === "done";
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const selectedCards = playerHand.filter(c => selected.includes(c.id));
  const canMeld = isValidMeld(selectedCards);

  return (
    <div className="haf">
      <div className="haf-header">
        <span>Phase: {phase}</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}</span>
        {usingFoot[0] ? <span style={{ color: "#ffeb3b" }}>Using FOOT</span> : <span>Foot: {playerFoot.length} cards</span>}
      </div>

      {/* Bot info */}
      {Array.from({ length: numPlayers - 1 }, (_, i) => (
        <div key={i} className="haf-label">Bot {i + 1}: {hands[i + 1]?.length ?? 0} cards in hand</div>
      ))}

      {/* Draw area */}
      <div className="haf-area">
        <div className="haf-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0 ? (
            <Card faceDown onClick={() => dispatch({ type: "draw-stock" } as HandAndFootAction)} />
          ) : (
            <div className="haf-card-back" style={{ opacity: 0.3 }} />
          )}
        </div>
        <div className="haf-pile">
          Discard
          {topDiscard ? (
            phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as HandAndFootAction)} />
              : <Card card={topDiscard} />
          ) : (
            <div className="haf-card-back" style={{ opacity: 0.2 }} />
          )}
        </div>
      </div>

      <div className="haf-status">{message}</div>

      {/* Table melds */}
      {tableMelds.length > 0 && (
        <div>
          <div className="haf-label">Table Melds</div>
          <div className="haf-table-melds">
            {tableMelds.map(m => (
              <div key={m.id} className="haf-meld-group">
                <div className="haf-meld-cards">
                  {m.cards.map(c => <Card key={c.id} card={c} />)}
                </div>
                <span>{m.owner === 0 ? "You" : `Bot ${m.owner}`} · {m.cards.length >= 7 ? (m.isClean ? "✓ Canasta!" : "~ Canasta") : m.cards.length + " cards"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Player hand */}
      <div>
        <div className="haf-label">Your Hand ({playerHand.length})</div>
        <div className="haf-hand">
          {playerHand.map(c =>
            phase === "player-meld"
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="haf-actions">
        {phase === "player-meld" && (
          <>
            <button
              className="haf-btn"
              disabled={!canMeld}
              onClick={() => { dispatch({ type: "meld", cardIds: selected } as HandAndFootAction); setSelected([]); }}
            >
              Meld ({selected.length} cards)
            </button>
            {selected.length === 1 && (
              <button
                className="haf-btn"
                onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as HandAndFootAction); setSelected([]); }}
              >
                Discard
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="haf-result">
          <h2>{scores[0]! > Math.max(...scores.slice(1)) ? "You win!" : "Bot wins!"}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i + 1}: {s}</div>)}
        </div>
      )}
    </div>
  );
}
