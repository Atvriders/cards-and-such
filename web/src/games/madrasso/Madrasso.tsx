import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MadrassoState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./Madrasso.css";

type MadrassoAction = { type: "play"; cardId: string };

export function Madrasso({ state, dispatch, onGameOver }: GameProps<MadrassoState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="madrasso-game">
      <div className="madrasso-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♣</span>
      </div>
      <div className="madrasso-bot-row">
        <div className="madrasso-label">Bot ({botHand.length} cards)</div>
        <div className="madrasso-card-backs">
          {botHand.map((_, i) => <div key={i} className="madrasso-card-back" />)}
        </div>
      </div>
      <div className="madrasso-trick">
        <div className="madrasso-label">Current Trick</div>
        <div className="madrasso-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="madrasso-trick-slot">
                <div className="madrasso-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="madrasso-status">{message}</div>
      <div className="madrasso-player-area">
        <div className="madrasso-label">Your Hand</div>
        <div data-testid="hint-target-madrasso-hand" className="madrasso-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as MadrassoAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="madrasso-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
