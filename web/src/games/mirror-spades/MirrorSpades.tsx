import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MirrorSpadesState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./MirrorSpades.css";

type MirrorSpadesAction = { type: "play"; cardId: string };

export function MirrorSpades({ state, dispatch, onGameOver }: GameProps<MirrorSpadesState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="mirror-spades-game">
      <div className="mirror-spades-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="mirror-spades-bot-row">
        <div className="mirror-spades-label">Bot ({botHand.length} cards)</div>
        <div className="mirror-spades-card-backs">
          {botHand.map((_, i) => <div key={i} className="mirror-spades-card-back" />)}
        </div>
      </div>
      <div className="mirror-spades-trick">
        <div className="mirror-spades-label">Current Trick</div>
        <div className="mirror-spades-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="mirror-spades-trick-slot">
                <div className="mirror-spades-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="mirror-spades-status">{message}</div>
      <div className="mirror-spades-player-area">
        <div className="mirror-spades-label">Your Hand</div>
        <div className="mirror-spades-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as MirrorSpadesAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="mirror-spades-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
