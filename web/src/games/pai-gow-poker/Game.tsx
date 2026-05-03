import React, { useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaiGowPokerState, PaiGowPokerAction, PaiGowPokerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import type { Card } from "../../engines/deck/index.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./Game.css";

type Props = GameProps<PaiGowPokerState, PaiGowPokerSettings>;

function CardView({ card, selected, onClick }: { card: Card; selected?: boolean; onClick?: () => void }) {
  const red = card.suit === "♥" || card.suit === "♦";
  const label = card.id === "joker" ? "JKR" : rankLabel(card.rank) + card.suit;
  return (
    <div
      className={`pai-gow-card${red ? " red" : ""}${selected ? " selected" : ""}`}
      onClick={onClick}
      title={label}
    >
      <span>{card.id === "joker" ? "★" : rankLabel(card.rank)}</span>
      <span style={{ fontSize: "0.7rem" }}>{card.id === "joker" ? "JKR" : card.suit}</span>
    </div>
  );
}

export function PaiGowPoker({ state, dispatch, onGameOver }: Props) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const term = isTerminal(state);
  if (term) {
    onGameOver(term.score);
  }

  const toggleSelect = (i: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleSetHands = () => {
    if (selectedIndices.size !== 2) return;
    const lowIndices = [...selectedIndices];
    const low = lowIndices.map(i => state.playerCards[i]!);
    const high = state.playerCards.filter((_, i) => !selectedIndices.has(i));
    dispatch({ type: "set-hands", high, low } as PaiGowPokerAction);
    setSelectedIndices(new Set());
  };

  const handleNewHand = () => {
    setSelectedIndices(new Set());
    dispatch({ type: "deal" } as PaiGowPokerAction);
  };

  return (
    <div className="pai-gow-root">
      <div className="pai-gow-bankroll">Bankroll: ${state.bankroll}</div>
      <div>Hands played: {state.handsPlayed}</div>

      {state.phase === "betting" && (
        <button className="pai-gow-btn" onClick={handleNewHand} disabled={state.bankroll < parseInt(state.settings.anteSize)}>
          Deal (Ante ${state.settings.anteSize})
        </button>
      )}

      {state.phase === "splitting" && (
        <div className="pai-gow-section">
          <div className="pai-gow-hand-label">Your 7 cards — click to select 2 for the Low hand:</div>
          <div className="pai-gow-cards">
            {state.playerCards.map((card, i) => (
              <CardView key={card.id} card={card} selected={selectedIndices.has(i)} onClick={() => toggleSelect(i)} />
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              className="pai-gow-btn"
              onClick={handleSetHands}
              disabled={selectedIndices.size !== 2}
            >
              Set Hands ({selectedIndices.size}/2 for Low)
            </button>
            <button data-testid="hint-target-pai-gow-poker-primary" className="pai-gow-btn" onClick={() => dispatch({ type: "auto-split" } as PaiGowPokerAction)} style={{ background: "#888" }}>
              House Way
            </button>
          </div>
        </div>
      )}

      {state.phase === "result" && (
        <div className="pai-gow-section">
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <div>
              <div className="pai-gow-hand-label">Your High (5):</div>
              <div className="pai-gow-cards">{state.playerHigh.map(c => <CardView key={c.id} card={c} />)}</div>
              <div className="pai-gow-hand-label">Your Low (2):</div>
              <div className="pai-gow-cards">{state.playerLow.map(c => <CardView key={c.id} card={c} />)}</div>
            </div>
            <div>
              <div className="pai-gow-hand-label">Dealer High (5):</div>
              <div className="pai-gow-cards">{state.dealerHigh.map(c => <CardView key={c.id} card={c} />)}</div>
              <div className="pai-gow-hand-label">Dealer Low (2):</div>
              <div className="pai-gow-cards">{state.dealerLow.map(c => <CardView key={c.id} card={c} />)}</div>
            </div>
          </div>
          <div className="pai-gow-result" style={{ marginTop: 12 }}>{state.lastResult}</div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
            <button className="pai-gow-btn" onClick={handleNewHand} disabled={state.bankroll < parseInt(state.settings.anteSize)}>
              Next Hand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
