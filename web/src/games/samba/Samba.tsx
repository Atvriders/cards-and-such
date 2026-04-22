import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SambaState, SambaSettings } from "./state.js";
import { isTerminal, isValidMeld, isSamba, isCanasta } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Samba.css";

type SambaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "discard"; cardId: string };

export function Samba({ state, dispatch, onGameOver }: GameProps<SambaState, SambaSettings>): JSX.Element {
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
    <div className="samba">
      <div className="samba-header">
        <span>Phase: {phase}</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}</span>
      </div>
      <div className="samba-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i+1}: ${hands[i+1]?.length ?? 0}`).join(" | ")}</div>

      <div className="samba-area">
        <div className="samba-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card faceDown onClick={() => dispatch({ type: "draw-stock" } as SambaAction)} />
            : <div className="samba-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="samba-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as SambaAction)} />
              : <Card card={topDiscard} />
            : <div className="samba-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="samba-status">{message}</div>

      {tableMelds.length > 0 && (
        <div>
          <div className="samba-label">Table Melds</div>
          <div className="samba-table-melds">
            {tableMelds.map(m => (
              <div key={m.id} className="samba-meld-group">
                <div className="samba-meld-cards">{m.cards.map(c => <Card key={c.id} card={c} />)}</div>
                <span>{m.owner === 0 ? "You" : `Bot ${m.owner}`} · {isSamba(m) ? "🎵 Samba!" : isCanasta(m) ? "✓ Canasta" : m.meldType === "run" ? "Run" : "Set"} ({m.cards.length})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="samba-label">Your Hand ({playerHand.length})</div>
        <div className="samba-hand">
          {playerHand.map(c =>
            phase === "player-meld"
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} />
          )}
        </div>
      </div>

      <div className="samba-actions">
        {phase === "player-meld" && (
          <>
            <button className="samba-btn" disabled={!canMeld} onClick={() => { dispatch({ type: "meld", cardIds: selected } as SambaAction); setSelected([]); }}>
              Meld ({selected.length})
            </button>
            {selected.length === 1 && (
              <button className="samba-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as SambaAction); setSelected([]); }}>
                Discard
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="samba-result">
          <h2>{scores[0]! >= Math.max(...scores.slice(1)) ? "You win!" : "Bot wins!"}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i+1}: {s}</div>)}
        </div>
      )}
    </div>
  );
}
