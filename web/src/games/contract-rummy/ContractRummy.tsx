import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ContractRummyState, ContractRummySettings } from "./state.js";
import { isTerminal, CONTRACTS, meetsContract } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./ContractRummy.css";

type ContractRummyAction =
  | { type: "draw-stock" }
  | { type: "draw-discard" }
  | { type: "open"; groups: string[][] }
  | { type: "layoff"; cardId: string; meldId: string }
  | { type: "discard"; cardId: string };

export function ContractRummy({ state, dispatch, onGameOver }: GameProps<ContractRummyState, ContractRummySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [selected, setSelected] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[][]>([]);

  const { hands, stock, discardPile, phase, message, tableMelds, scores, contractRound, numPlayers, winner, contractFulfilled } = state;
  const playerHand = hands[0] ?? [];
  const done = phase === "done";
  const topDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const contract = CONTRACTS[contractRound]!;
  const opened = contractFulfilled[0] ?? false;

  const usedIds = new Set(groups.flat());
  const contractCards = groups.map(ids => playerHand.filter(c => ids.includes(c.id)));
  const contractMet = !opened && groups.length === contract.length && meetsContract(contractCards, contract);

  function toggleSelect(id: string) {
    if (usedIds.has(id)) return;
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div className="contract-rummy">
      <div className="contract-header">
        <span>Round: {contractRound + 1}</span>
        <span>Stock: {stock.length}</span>
        <span>Phase: {phase}</span>
      </div>

      <div className="contract-info">
        Contract: {contract.map(p => `${p.minLen}+ ${p.type}`).join(" + ")}
        {opened && " ✓ OPENED"}
      </div>

      <div className="contract-label">Bots: {Array.from({ length: numPlayers - 1 }, (_, i) => `Bot ${i+1}: ${hands[i+1]?.length ?? 0}`).join(" | ")}</div>

      <div className="contract-area">
        <div className="contract-pile">
          Stock ({stock.length})
          {phase === "player-draw" && stock.length > 0
            ? <Card data-testid="hint-target-contract-rummy-primary" faceDown onClick={() => dispatch({ type: "draw-stock" } as ContractRummyAction)} />
            : <div className="contract-card-back" style={{ opacity: 0.3 }} />}
        </div>
        <div className="contract-pile">
          Discard
          {topDiscard
            ? phase === "player-draw"
              ? <Card card={topDiscard} onClick={() => dispatch({ type: "draw-discard" } as ContractRummyAction)} />
              : <Card card={topDiscard} />
            : <div className="contract-card-back" style={{ opacity: 0.2 }} />}
        </div>
      </div>

      <div className="contract-status">{message}</div>

      {/* Table melds */}
      {tableMelds.length > 0 && (
        <div>
          <div className="contract-label">Table Melds</div>
          <div className="contract-table-melds">
            {tableMelds.map(m => (
              <div key={m.id} className="contract-meld-group">
                <div className="contract-meld-cards">{m.cards.map(c => <Card key={c.id} card={c} />)}</div>
                <span>{m.owner === 0 ? "You" : `Bot ${m.owner}`} ({m.cards.length})</span>
                {opened && phase === "player-act" && selected.length === 1 && (
                  <button className="contract-btn" style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                    onClick={() => { dispatch({ type: "layoff", cardId: selected[0]!, meldId: m.id } as ContractRummyAction); setSelected([]); }}>
                    Lay off
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contract groups */}
      {phase === "player-act" && !opened && (
        <div className="contract-groups">
          {groups.map((ids, gi) => (
            <div key={gi} className="contract-group">
              <div className="contract-group-label">Group {gi + 1} ({contract[gi]?.type})</div>
              <div className="contract-group-cards">
                {ids.map(id => { const card = playerHand.find(c => c.id === id); return card ? <Card key={id} card={card} /> : null; })}
              </div>
              <button className="contract-btn" style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                onClick={() => setGroups(prev => prev.filter((_, i) => i !== gi))}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="contract-label">Your Hand ({playerHand.length})</div>
        <div className="contract-hand">
          {playerHand.map(c =>
            phase === "player-act"
              ? <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : usedIds.has(c.id) ? "dim" : ""} onClick={() => toggleSelect(c.id)} />
              : <Card key={c.id} card={c} className={selected.includes(c.id) ? "selected" : usedIds.has(c.id) ? "dim" : ""} />
          )}
        </div>
      </div>

      <div className="contract-actions">
        {phase === "player-act" && !opened && (
          <>
            <button className="contract-btn" disabled={selected.length === 0} onClick={() => { setGroups(prev => [...prev, selected]); setSelected([]); }}>
              Add Group ({selected.length})
            </button>
            <button data-testid="hint-target-contract-rummy-primary" className="contract-btn" disabled={!contractMet} onClick={() => { dispatch({ type: "open", groups } as ContractRummyAction); setGroups([]); }}>
              Open Contract
            </button>
          </>
        )}
        {phase === "player-act" && selected.length === 1 && (
          <button className="contract-btn" onClick={() => { dispatch({ type: "discard", cardId: selected[0]! } as ContractRummyAction); setSelected([]); setGroups([]); }}>
            Discard
          </button>
        )}
      </div>

      {done && (
        <div className="contract-result">
          <h2>{winner === 0 ? "You went out!" : `Bot ${winner} went out!`}</h2>
          {scores.map((s, i) => <div key={i}>{i === 0 ? "You" : `Bot ${i}`}: {s} pts</div>)}
        </div>
      )}
    </div>
  );
}
