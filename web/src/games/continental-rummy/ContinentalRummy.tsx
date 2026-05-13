import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ContinentalRummyState, ContinentalRummySettings } from "./state.js";
import { isTerminal, CONTRACTS, meetsContract } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./ContinentalRummy.css";

type ContinentalRummyAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "go-out"; groups: string[][] }
  | { type: "discard"; cardId: string };

export function ContinentalRummy({ state, dispatch, onGameOver }: GameProps<ContinentalRummyState, ContinentalRummySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[][]>([]);

  const { hands, stock, discardPile, phase, message, scores, round, numPlayers, winner } = state;
  const playerHand = hands[0] ?? [];
  const done = phase === "done";
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const contract = CONTRACTS[round]!;

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function addGroup() {
    if (selected.length === 0) return;
    setGroups(prev => [...prev, selected]);
    setSelected([]);
  }

  const usedIds = new Set(groups.flat());
  const contractCards = groups.map(ids => playerHand.filter(c => ids.includes(c.id)));
  const contractMet = groups.length === contract.length && meetsContract(contractCards, contract);

  return (
    <div className="continental fade-in">
      <div className="continental-header">
        <span>Round {round + 1}/3</span>
        <span>Stock: {stock.length}</span>
        <span>Score: {scores[0]}</span>
        <span>Phase: {phase}</span>
      </div>

      <div className="continental-contract">
        Contract: {contract.map(p => `${p.minLength}+ card ${p.type}`).join(" + ")}
      </div>

      <div className="continental-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i+1}: ${hands[i+1]?.length ?? 0}`).join(" | ")}</div>

      <div className="continental-area">
        <div className="continental-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card data-testid="hint-target-continental-rummy-primary" faceDown onClick={() => dispatch({ type: "draw-stock" } as ContinentalRummyAction)} />
            : <div className="continental-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="continental-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as ContinentalRummyAction)} />
              : <Card card={topDiscard} />
            : <div className="continental-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="continental-status">{message}</div>

      {/* Contract groups builder */}
      {phase === "player-act" && (
        <div className="continental-groups">
          {groups.map((ids, gi) => (
            <div key={gi} className="continental-group">
              <div className="continental-group-label">Group {gi + 1} ({contract[gi]?.type})</div>
              <div className="continental-group-cards">
                {ids.map(id => {
                  const card = playerHand.find(c => c.id === id);
                  return card ? <Card key={id} card={card} /> : null;
                })}
              </div>
              <button className="continental-btn" style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                onClick={() => { setGroups(prev => prev.filter((_, i) => i !== gi)); }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="continental-label">Your Hand ({playerHand.length})</div>
        <div className="continental-hand">
          {playerHand.map(c =>
            phase === "player-act" && !usedIds.has(c.id)
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : usedIds.has(c.id) ? "dim" : ""} />
          )}
        </div>
      </div>

      <div className="continental-actions">
        {phase === "player-act" && (
          <>
            <button className="continental-btn" disabled={selected.length === 0} onClick={addGroup}>
              Add Group ({selected.length} cards)
            </button>
            <button data-testid="hint-target-continental-rummy-primary" className="continental-btn" disabled={!contractMet} onClick={() => { dispatch({ type: "go-out", groups } as ContinentalRummyAction); setGroups([]); }}>
              Go Out!
            </button>
            {selected.length === 1 && (
              <button className="continental-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as ContinentalRummyAction); setSelected([]); setGroups([]); }}>
                Discard
              </button>
            )}
          </>
        )}
      </div>

      {done && (
        <div className="continental-result">
          <h2>{winner === 0 ? "You went out first!" : `Bot ${winner} went out first!`}</h2>
          <div>Your score: {scores[0]}</div>
          {scores.slice(1).map((s, i) => <div key={i}>Bot {i+1}: {s}</div>)}
          <div style={{ marginTop: "0.5rem", opacity: 0.7 }}>Lower score is better.</div>
        </div>
      )}
    </div>
  );
}
