import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveHundredRumState, FiveHundredRumSettings } from "./state.js";
import { isTerminal, isValidMeld, canLayOff } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./FiveHundredRum.css";

type FiveHundredRumAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string };

export function FiveHundredRum({ state, dispatch, onGameOver }: GameProps<FiveHundredRumState, FiveHundredRumSettings>): JSX.Element {
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
    <div className="fhr">
      <div className="fhr-header">
        <span>Phase: {phase}</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}/500</span>
      </div>

      {/* Score bar */}
      <div className="fhr-score-bar">
        <div className="fhr-score-fill" style={{ width: `${Math.min(100, (scores[0]! / 500) * 100)}%` }} />
      </div>

      <div className="fhr-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i+1}: ${scores[i+1]}/500`).join(" | ")}</div>

      <div className="fhr-area">
        <div className="fhr-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card faceDown onClick={() => dispatch({ type: "draw-stock" } as FiveHundredRumAction)} />
            : <div className="fhr-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="fhr-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as FiveHundredRumAction)} />
              : <Card card={topDiscard} />
            : <div className="fhr-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="fhr-status">{message}</div>

      {tableMelds.length > 0 && (
        <div>
          <div className="fhr-label">Table Melds</div>
          <div className="fhr-table-melds">
            {tableMelds.map(m => {
              const canLayOffSelected = selected.length === 1 && phase === "player-meld" && canLayOff(playerHand.find(c => c.id === selected[0])!, m);
              return (
                <div key={m.id} className="fhr-meld-group">
                  <div className="fhr-meld-cards">{m.cards.map(c => <Card key={c.id} card={c} />)}</div>
                  <span>{m.owner === 0 ? "You" : `Bot ${m.owner}`} ({m.cards.length})</span>
                  {canLayOffSelected && (
                    <button className="fhr-btn" style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                      onClick={() => { dispatch({ type: "layoff", cardId: selected[0]!, meldId: m.id } as FiveHundredRumAction); setSelected([]); }}>
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
        <div className="fhr-label">Your Hand ({playerHand.length})</div>
        <div className="fhr-hand">
          {playerHand.map(c =>
            phase === "player-meld"
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} />
          )}
        </div>
      </div>

      <div className="fhr-actions">
        {phase === "player-meld" && (
          <>
            <button className="fhr-btn" disabled={!canMeld} onClick={() => { dispatch({ type: "meld", cardIds: selected } as FiveHundredRumAction); setSelected([]); }}>
              Meld ({selected.length})
            </button>
            {selected.length === 1 && (
              <button className="fhr-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as FiveHundredRumAction); setSelected([]); }}>
                Discard
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="fhr-result">
          <h2>{scores[0]! >= Math.max(...scores.slice(1)) ? "You win!" : "Bot wins!"}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i+1}: {s}</div>)}
        </div>
      )}
    </div>
  );
}
