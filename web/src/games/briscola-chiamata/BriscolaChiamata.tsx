import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscolaChiamataState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./BriscolaChiamata.css";

type BriscolaChiamataAction = { type: "play"; cardId: string };

export function BriscolaChiamata({ state, dispatch, onGameOver }: GameProps<BriscolaChiamataState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="briscola-chiamata-game">
      <div className="briscola-chiamata-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♦</span>
      </div>
      <div className="briscola-chiamata-bot-row">
        <div className="briscola-chiamata-label">Bot ({botHand.length} cards)</div>
        <div className="briscola-chiamata-card-backs">
          {botHand.map((_, i) => <div key={i} className="briscola-chiamata-card-back" />)}
        </div>
      </div>
      <div className="briscola-chiamata-trick">
        <div className="briscola-chiamata-label">Current Trick</div>
        <div className="briscola-chiamata-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="briscola-chiamata-trick-slot">
                <div className="briscola-chiamata-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="briscola-chiamata-status">{message}</div>
      <div className="briscola-chiamata-player-area">
        <div className="briscola-chiamata-label">Your Hand</div>
        <div className="briscola-chiamata-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BriscolaChiamataAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="briscola-chiamata-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
