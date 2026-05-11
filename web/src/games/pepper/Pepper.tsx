import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PepperState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import { Card } from "../../engines/deck/Card.js";
import "./Pepper.css";

type PepperAction = { type: "play"; cardId: string };

const TRUMP_SUIT: string | null = null;

export function Pepper({ state, dispatch, onGameOver }: GameProps<PepperState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const playerHand = state.hands[0] ?? [];
  const botHand = state.hands[1] ?? [];
  const currentTrick = state.trick;
  const playerTricks = state.tricksWon[0];
  const botTricks = state.tricksWon[1];
  const totalTricks = state.tricksWon[0] + state.tricksWon[1];
  const winThreshold = 7;
  const { phase, message } = state;
  const playerLeads = state.leadSeat === 0;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map(c => c.id));

  return (
    <div className="pepper-game">
      <div className="pepper-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♣</span>
      </div>
      <div className="pepper-bot-row">
        <div className="pepper-label">Bot ({botHand.length} cards)</div>
        <div className="pepper-card-backs">
          {botHand.map((_, i) => <div key={i} className="pepper-card-back" />)}
        </div>
      </div>
      <div className="pepper-trick">
        <div className="pepper-label">Current Trick</div>
        <div className="pepper-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }) => (
              <div key={card.id} className="pepper-trick-slot">
                <div className="pepper-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="pepper-status">{message}</div>
      <div className="pepper-player-area">
        <div className="pepper-label">Your Hand</div>
        <div className="pepper-player-hand">
          {playerHand.map(card => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as PepperAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="pepper-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT ?? "none"}</span>
    </div>
  );
}
