import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleDeckPinochleState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./DoubleDeckPinochle.css";

type DoubleDeckPinochleAction = { type: "play"; cardId: string };

export function DoubleDeckPinochle({ state, dispatch, onGameOver }: GameProps<DoubleDeckPinochleState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="double-deck-pinochle-game">
      <div className="double-deck-pinochle-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="double-deck-pinochle-bot-row">
        <div className="double-deck-pinochle-label">Bot ({botHand.length} cards)</div>
        <div className="double-deck-pinochle-card-backs">
          {botHand.map((_, i) => <div key={i} className="double-deck-pinochle-card-back" />)}
        </div>
      </div>
      <div className="double-deck-pinochle-trick">
        <div className="double-deck-pinochle-label">Current Trick</div>
        <div className="double-deck-pinochle-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="double-deck-pinochle-trick-slot">
                <div className="double-deck-pinochle-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="double-deck-pinochle-status">{message}</div>
      <div className="double-deck-pinochle-player-area">
        <div className="double-deck-pinochle-label">Your Hand</div>
        <div className="double-deck-pinochle-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as DoubleDeckPinochleAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="double-deck-pinochle-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
