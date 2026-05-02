import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CanastaState, CanastaSettings } from "./state.js";
import { isTerminal, isValidMeld, isCanasta, isNaturalCanasta } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Canasta.css";

type CanastaAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "meld"; cardIds: string[] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string }
  | { type: "go-out"; cardId: string };

export function Canasta({ state, dispatch, onGameOver }: GameProps<CanastaState, CanastaSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);
  const [layoffMeldId, setLayoffMeldId] = useState<string | null>(null);

  const { hands, stock, discardPile, phase, message, tableMelds, scores, numPlayers } = state;
  const playerHand = hands[0] ?? [];
  const done = phase === "done";
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const myMelds = tableMelds.filter(m => m.owner === 0);
  const hasCanasta = myMelds.some(m => isCanasta(m));

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const selectedCards = playerHand.filter(c => selected.includes(c.id));
  const canMeld = isValidMeld(selectedCards);

  function handleLayoff(meldId: string) {
    if (selected.length !== 1) return;
    dispatch({ type: "layoff", cardId: selected[0]!, meldId } as CanastaAction);
    setSelected([]);
    setLayoffMeldId(null);
  }

  return (
    <div className="canasta">
      <div className="canasta-header">
        <span>Phase: {phase}</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}</span>
        {hasCanasta && <span style={{ color: "#ffd54f" }}>Canasta!</span>}
      </div>

      <div className="canasta-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i + 1}: ${hands[i + 1]?.length ?? 0}`).join(" | ")}</div>

      <div className="canasta-area">
        <div className="canasta-pile" data-testid="hint-target-canasta-draw-stock">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card faceDown onClick={() => dispatch({ type: "draw-stock" } as CanastaAction)} />
            : <div className="canasta-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="canasta-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as CanastaAction)} />
              : <Card card={topDiscard} />
            : <div className="canasta-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="canasta-status">{message}</div>

      {tableMelds.length > 0 && (
        <div>
          <div className="canasta-label">Table Melds</div>
          <div className="canasta-table-melds">
            {tableMelds.map(m => (
              <div key={m.id} className="canasta-meld-group">
                <div className="canasta-meld-cards">
                  {m.cards.map(c => <Card key={c.id} card={c} />)}
                </div>
                <span>
                  {m.owner === 0 ? "You" : `Bot ${m.owner}`}
                  {isNaturalCanasta(m) ? " 🔥 Natural!" : isCanasta(m) ? " ✓ Canasta" : ` (${m.cards.length})`}
                </span>
                {m.owner === 0 && phase === "player-meld" && selected.length === 1 && (
                  <button className="canasta-btn" style={{ fontSize: "0.65rem", padding: "2px 6px" }} onClick={() => handleLayoff(m.id)}>Lay off</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="canasta-label">Your Hand ({playerHand.length})</div>
        <div className="canasta-hand">
          {playerHand.map(c => (
            <span key={c.id} data-testid={`hint-target-canasta-${c.id}`}>
              {phase === "player-meld"
                ? <Card card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
                : <Card card={c} className={selected.includes(c.id) ? "selected" : ""} />}
            </span>
          ))}
        </div>
      </div>

      <div className="canasta-actions">
        {phase === "player-meld" && (
          <>
            <button className="canasta-btn" disabled={!canMeld} onClick={() => { dispatch({ type: "meld", cardIds: selected } as CanastaAction); setSelected([]); }}>
              Meld ({selected.length})
            </button>
            {selected.length === 1 && (
              <button className="canasta-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as CanastaAction); setSelected([]); }}>
                Discard
              </button>
            )}
            {hasCanasta && selected.length === 1 && (
              <button className="canasta-btn" style={{ background: "#e65100" }} onClick={() => dispatch({ type: "go-out", cardId: selected[0]! } as CanastaAction)}>
                Go Out
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="canasta-result">
          <h2>{scores[0]! >= Math.max(...scores.slice(1)) ? "You win!" : "Bot wins!"}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i + 1}: {s}</div>)}
        </div>
      )}
    </div>
  );
}
