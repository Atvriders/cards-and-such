import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoliviaState, BoliviaSettings } from "./state.js";
import { isTerminal, isValidMeld, isBolivia, isCanasta } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Bolivia.css";

type BoliviaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

export function Bolivia({ state, dispatch, onGameOver }: GameProps<BoliviaState, BoliviaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);
  const { hands, stock, discardPile, phase, message, tableMelds, scores, numPlayers } = state;
  const playerHand = hands[0] ?? [];
  const done = phase === "done";
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const selectedCards = playerHand.filter(c => selected.includes(c.id));
  const canMeld = isValidMeld(selectedCards);

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="bolivia">
      <div className="bolivia-header">
        <span>Phase: {phase}</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}</span>
      </div>
      <div className="bolivia-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i+1}: ${hands[i+1]?.length ?? 0}`).join(" | ")}</div>

      <div className="bolivia-area">
        <div className="bolivia-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card data-testid="hint-target-bolivia-primary" faceDown onClick={() => dispatch({ type: "draw-stock" } as BoliviaAction)} />
            : <div className="bolivia-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="bolivia-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as BoliviaAction)} />
              : <Card card={topDiscard} />
            : <div className="bolivia-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="bolivia-status">{message}</div>

      {tableMelds.length > 0 && (
        <div>
          <div className="bolivia-label">Table Melds</div>
          <div className="bolivia-table-melds">
            {tableMelds.map(m => (
              <div key={m.id} className="bolivia-meld-group">
                <div className="bolivia-meld-cards">{m.cards.map(c => <Card key={c.id} card={c} />)}</div>
                <span>{m.owner === 0 ? "You" : `Bot ${m.owner}`} · {isBolivia(m) ? "⭐ Bolivia!" : isCanasta(m) ? "✓ Canasta" : m.isWildMeld ? "Wilds" : "Set"} ({m.cards.length})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="bolivia-label">Your Hand ({playerHand.length})</div>
        <div className="bolivia-hand">
          {playerHand.map(c =>
            phase === "player-meld"
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} />
          )}
        </div>
      </div>

      <div className="bolivia-actions">
        {phase === "player-meld" && (
          <>
            <button className="bolivia-btn" disabled={!canMeld} onClick={() => { dispatch({ type: "meld", cardIds: selected } as BoliviaAction); setSelected([]); }}>
              Meld ({selected.length})
            </button>
            {selected.length === 1 && (
              <button className="bolivia-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as BoliviaAction); setSelected([]); }}>
                Discard
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="bolivia-result">
          <h2>{scores[0]! >= Math.max(...scores.slice(1)) ? "You win!" : "Bot wins!"}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i+1}: {s}</div>)}
        </div>
      )}
    </div>
  );
}
