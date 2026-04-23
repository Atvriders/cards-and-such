import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BastraState } from "./state.js";
import { canCapture, isTerminal } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Bastra.css";

type BastraAction =
  | { type: "capture"; handCardId: string; tableCardIds: string[] }
  | { type: "trail"; handCardId: string };

export function Bastra({ state, dispatch, onGameOver }: GameProps<BastraState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Set<string>>(new Set());

  const { hands, table, stock, captured, bastras, phase, turn, scores, message } = state;
  const done = phase === "done";
  const myTurn = turn === 0 && !done;

  const playerHand = hands[0]!;
  const botHand = hands[1]!;

  const selectedHandCard = playerHand.find(c => c.id === selectedHand) ?? null;
  const selectedTableCards = table.filter(c => selectedTable.has(c.id));

  const canCapt = selectedHandCard && selectedTableCards.length > 0 && canCapture(selectedHandCard, selectedTableCards);

  function toggleTable(id: string) {
    if (!myTurn) return;
    setSelectedTable(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function doCapture() {
    if (!selectedHand || !canCapt) return;
    dispatch({ type: "capture", handCardId: selectedHand, tableCardIds: [...selectedTable] } as BastraAction);
    setSelectedHand(null);
    setSelectedTable(new Set());
  }

  function doTrail() {
    if (!selectedHand) return;
    dispatch({ type: "trail", handCardId: selectedHand } as BastraAction);
    setSelectedHand(null);
    setSelectedTable(new Set());
  }

  return (
    <div className="bastra">
      <div className="bastra-header">
        <span>Bastra</span>
        <span>Stock: {stock.length}</span>
        <span>Your pile: {captured[0]!.length} cards</span>
        <span>Bot pile: {captured[1]!.length} cards</span>
        <span>Your bastras: {bastras[0]}</span>
        <span>Bot bastras: {bastras[1]}</span>
      </div>

      <div className="bastra-bot-row">
        <div className="bastra-bot-label">
          Bot ({botHand.length} cards) {turn === 1 && !done ? "— thinking…" : ""}
        </div>
        <div className="bastra-card-backs">
          {Array.from({ length: botHand.length }).map((_, i) => (
            <div key={i} className="bastra-card-back" />
          ))}
        </div>
      </div>

      <div className="bastra-table-area">
        <div className="bastra-table-label">
          Table ({table.length} cards) — {myTurn ? "click to select for capture" : ""}
        </div>
        <div className="bastra-table-cards">
          {table.length === 0 ? (
            <span style={{ opacity: 0.4, fontSize: "0.85rem" }}>— empty —</span>
          ) : (
            table.map(card => (
              <Card
                key={card.id}
                card={card}
                className={selectedTable.has(card.id) ? "selected" : ""}
                {...(myTurn ? { onClick: () => toggleTable(card.id) } : {})}
              />
            ))
          )}
        </div>
      </div>

      <div className="bastra-status">{message}</div>

      {myTurn && selectedHandCard && (
        <div className="bastra-actions">
          <button className="bastra-btn" onClick={doCapture} disabled={!canCapt}>
            Capture ({selectedTableCards.map(c => `${rankLabel(c.rank)}${c.suit}`).join(", ") || "none selected"})
          </button>
          <button className="bastra-btn" onClick={doTrail}>
            Trail {rankLabel(selectedHandCard.rank)}{selectedHandCard.suit}
          </button>
        </div>
      )}

      <div className="bastra-player-area">
        <div className="bastra-player-label">
          Your Hand ({playerHand.length} cards) — score: {scores[0]} pts
        </div>
        <div className="bastra-player-hand">
          {playerHand.map(card => (
            <Card
              key={card.id}
              card={card}
              className={selectedHand === card.id ? "selected" : ""}
              {...(myTurn ? { onClick: () => setSelectedHand(card.id === selectedHand ? null : card.id) } : {})}
            />
          ))}
        </div>
        {myTurn && !selectedHand && (
          <div style={{ opacity: 0.6, fontSize: "0.8rem" }}>Select a card from your hand first</div>
        )}
      </div>

      {done && (
        <div className="bastra-result">
          <h2>
            {scores[0]! > scores[1]! ? "You Win!" :
             scores[0]! < scores[1]! ? "Bot Wins." : "Tie!"}
          </h2>
          <div>Your score: {scores[0]} pts | Bot score: {scores[1]} pts</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>
            Bastras: You {bastras[0]}, Bot {bastras[1]}
          </div>
        </div>
      )}
    </div>
  );
}
