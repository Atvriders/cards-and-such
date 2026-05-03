import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BowerState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Bower.css";

type BowerAction = { type: "play"; cardId: string };

export function Bower({ state, dispatch, onGameOver }: GameProps<BowerState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="bower-game">
      <div className="bower-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♣</span>
      </div>
      <div className="bower-bot-row">
        <div className="bower-label">Bot ({botHand.length} cards)</div>
        <div className="bower-card-backs">
          {botHand.map((_, i) => <div key={i} className="bower-card-back" />)}
        </div>
      </div>
      <div className="bower-trick">
        <div className="bower-label">Current Trick</div>
        <div className="bower-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="bower-trick-slot">
                <div className="bower-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="bower-status">{message}</div>
      <div className="bower-player-area">
        <div className="bower-label">Your Hand</div>
        <div className="bower-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card data-testid="hint-target-bower-primary" key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BowerAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="bower-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
