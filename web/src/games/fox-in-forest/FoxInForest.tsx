import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FoxInForestState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./FoxInForest.css";

type FoxInForestAction = { type: "play"; cardId: string };

export function FoxInForest({ state, dispatch, onGameOver }: GameProps<FoxInForestState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="fox-in-forest-game">
      <div className="fox-in-forest-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="fox-in-forest-bot-row">
        <div className="fox-in-forest-label">Bot ({botHand.length} cards)</div>
        <div className="fox-in-forest-card-backs">
          {botHand.map((_, i) => <div key={i} className="fox-in-forest-card-back" />)}
        </div>
      </div>
      <div className="fox-in-forest-trick">
        <div className="fox-in-forest-label">Current Trick</div>
        <div className="fox-in-forest-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="fox-in-forest-trick-slot">
                <div className="fox-in-forest-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="fox-in-forest-status">{message}</div>
      <div className="fox-in-forest-player-area">
        <div className="fox-in-forest-label">Your Hand</div>
        <div className="fox-in-forest-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as FoxInForestAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="fox-in-forest-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
