import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KalookiState, KalookiSettings } from "./state.js";
import { isTerminal, isValidMeld, canLayOff } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Kalooki.css";

type KalookiAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "kalooki" };

export function Kalooki({ state, dispatch, onGameOver }: GameProps<KalookiState, KalookiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);
  const { hands, stock, discardPile, phase, message, tableMelds, scores, numPlayers, hasMelded, kalookiBonus } = state;
  const playerHand = hands[0] ?? [];
  const done = phase === "done";
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const selectedCards = playerHand.filter(c => selected.includes(c.id));
  const canMeld = isValidMeld(selectedCards);
  const notMeldedYet = !(hasMelded[0] ?? false);

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="kalooki">
      <div className="kalooki-header">
        <span>Phase: {phase}</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}</span>
        {notMeldedYet && <span style={{ color: "#ce93d8" }}>Kalooki available!</span>}
      </div>

      <div className="kalooki-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i+1}: ${hands[i+1]?.length ?? 0} cards`).join(" | ")}</div>

      <div className="kalooki-area">
        <div className="kalooki-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card faceDown onClick={() => dispatch({ type: "draw-stock" } as KalookiAction)} />
            : <div className="kalooki-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="kalooki-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as KalookiAction)} />
              : <Card card={topDiscard} />
            : <div className="kalooki-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="kalooki-status">{message}</div>

      {tableMelds.length > 0 && (
        <div>
          <div className="kalooki-label">Table Melds</div>
          <div className="kalooki-table-melds">
            {tableMelds.map(m => {
              const firstCard = playerHand.find(c => c.id === selected[0]);
              const canLay = selected.length === 1 && phase === "player-meld" && firstCard && canLayOff(firstCard, m);
              return (
                <div key={m.id} className="kalooki-meld-group">
                  <div className="kalooki-meld-cards">{m.cards.map(c => <Card key={c.id} card={c} />)}</div>
                  <span>{m.owner === 0 ? "You" : `Bot ${m.owner}`} ({m.cards.length})</span>
                  {canLay && (
                    <button className="kalooki-btn" style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                      onClick={() => { dispatch({ type: "layoff", cardId: selected[0]!, meldId: m.id } as KalookiAction); setSelected([]); }}>
                      Lay Off
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="kalooki-label">Your Hand ({playerHand.length})</div>
        <div className="kalooki-hand">
          {playerHand.map(c =>
            phase === "player-meld"
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} />
          )}
        </div>
      </div>

      <div className="kalooki-actions">
        {phase === "player-meld" && (
          <>
            <button className="kalooki-btn" disabled={!canMeld} onClick={() => { dispatch({ type: "meld", cardIds: selected } as KalookiAction); setSelected([]); }}>
              Meld ({selected.length})
            </button>
            {selected.length === 1 && (
              <button className="kalooki-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as KalookiAction); setSelected([]); }}>
                Discard
              </button>
            )}
            {notMeldedYet && playerHand.length <= 1 && (
              <button className="kalooki-btn kalooki-special" onClick={() => dispatch({ type: "kalooki" } as KalookiAction)}>
                Kalooki!
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="kalooki-result">
          <h2>{state.winner === 0 ? (kalookiBonus ? "Kalooki! You win with bonus!" : "You went out!") : `Bot ${state.winner} went out!`}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i+1}: {s}</div>)}
          <div style={{ opacity: 0.7, marginTop: "0.5rem" }}>Lower score is better.</div>
        </div>
      )}
    </div>
  );
}
