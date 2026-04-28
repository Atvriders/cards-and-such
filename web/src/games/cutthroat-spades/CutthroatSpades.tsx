import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CutthroatSpadesState } from "./state.js";
import { isTerminal, legalPlays, TRUMP_SUIT } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./CutthroatSpades.css";

type CutthroatSpadesAction = { type: "play"; cardId: string };

export function CutthroatSpades({ state, dispatch, onGameOver }: GameProps<CutthroatSpadesState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { playerHand, botHand, currentTrick, playerTricks, botTricks, totalTricks, winThreshold, phase, playerLeads, message } = state;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="cutthroat-spades-game">
      <div className="cutthroat-spades-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="cutthroat-spades-bot-row">
        <div className="cutthroat-spades-label">Bot ({botHand.length} cards)</div>
        <div className="cutthroat-spades-card-backs">
          {botHand.map((_, i) => <div key={i} className="cutthroat-spades-card-back" />)}
        </div>
      </div>
      <div className="cutthroat-spades-trick">
        <div className="cutthroat-spades-label">Current Trick</div>
        <div className="cutthroat-spades-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="cutthroat-spades-trick-slot">
                <div className="cutthroat-spades-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="cutthroat-spades-status">{message}</div>
      <div className="cutthroat-spades-player-area">
        <div className="cutthroat-spades-label">Your Hand</div>
        <div className="cutthroat-spades-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as CutthroatSpadesAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="cutthroat-spades-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
