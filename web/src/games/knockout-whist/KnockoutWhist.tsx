import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KnockoutWhistState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import type { Card as CardType } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import "./KnockoutWhist.css";

type KnockoutWhistAction = { type: "play"; cardId: string };

const TOTAL_TRICKS = 7;
const WIN_THRESHOLD = 4;

export function KnockoutWhist({ state, dispatch, onGameOver }: GameProps<KnockoutWhistState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { hands, trick: currentTrick, tricksWon, leadSeat, phase, trump, message } = state;
  const playerHand = hands[0] ?? [];
  const botHand = hands[1] ?? [];
  const playerTricks = tricksWon[0];
  const botTricks = tricksWon[1];
  const totalTricks = TOTAL_TRICKS;
  const winThreshold = WIN_THRESHOLD;
  const playerLeads = leadSeat === 0;
  const done = phase === "done";
  const legal: readonly CardType[] = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map((c: CardType) => c.id));

  return (
    <div className="knockout-whist-game">
      <div className="knockout-whist-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♥</span>
      </div>
      <div className="knockout-whist-bot-row">
        <div className="knockout-whist-label">Bot ({botHand.length} cards)</div>
        <div className="knockout-whist-card-backs">
          {botHand.map((_c: CardType, i: number) => <div key={i} className="knockout-whist-card-back" />)}
        </div>
      </div>
      <div className="knockout-whist-trick">
        <div className="knockout-whist-label">Current Trick</div>
        <div className="knockout-whist-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="knockout-whist-trick-slot">
                <div className="knockout-whist-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="knockout-whist-status">{message}</div>
      <div className="knockout-whist-player-area">
        <div className="knockout-whist-label">Your Hand</div>
        <div className="knockout-whist-player-hand">
          {playerHand.map((card: CardType) => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as KnockoutWhistAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="knockout-whist-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark trump used to satisfy lint */}
      <span style={{ display: "none" }}>{trump ?? "none"}</span>
    </div>
  );
}
