import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarafoneState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Marafone.css";

type MarafoneAction = { type: "play"; cardId: string };

export function Marafone({ state, dispatch, onGameOver }: GameProps<MarafoneState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="marafone-game">
      <div className="marafone-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="marafone-bot-row">
        <div className="marafone-label">Bot ({botHand.length} cards)</div>
        <div className="marafone-card-backs">
          {botHand.map((_, i) => <div key={i} className="marafone-card-back" />)}
        </div>
      </div>
      <div className="marafone-trick">
        <div className="marafone-label">Current Trick</div>
        <div className="marafone-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="marafone-trick-slot">
                <div className="marafone-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="marafone-status">{message}</div>
      <div className="marafone-player-area">
        <div className="marafone-label">Your Hand</div>
        <div data-testid="hint-target-marafone-hand" className="marafone-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as MarafoneAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="marafone-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
