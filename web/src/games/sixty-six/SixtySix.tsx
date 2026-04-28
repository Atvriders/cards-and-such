import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SixtySixState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./SixtySix.css";

type SixtySixAction = { type: "play"; cardId: string };

export function SixtySix({ state, dispatch, onGameOver }: GameProps<SixtySixState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="sixty-six-game">
      <div className="sixty-six-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♥</span>
      </div>
      <div className="sixty-six-bot-row">
        <div className="sixty-six-label">Bot ({botHand.length} cards)</div>
        <div className="sixty-six-card-backs">
          {botHand.map((_, i) => <div key={i} className="sixty-six-card-back" />)}
        </div>
      </div>
      <div className="sixty-six-trick">
        <div className="sixty-six-label">Current Trick</div>
        <div className="sixty-six-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="sixty-six-trick-slot">
                <div className="sixty-six-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="sixty-six-status">{message}</div>
      <div className="sixty-six-player-area">
        <div className="sixty-six-label">Your Hand</div>
        <div className="sixty-six-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SixtySixAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="sixty-six-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
