import { useEffect } from "react";
import type { Card as CardType } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleDeckPinochleState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import { Card } from "../../engines/deck/Card.js";
import "./DoubleDeckPinochle.css";

type DoubleDeckPinochleAction = { type: "play"; cardId: string };

export function DoubleDeckPinochle({ state, dispatch, onGameOver }: GameProps<DoubleDeckPinochleState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { hands, trick: currentTrick, tricksWon, phase, leadSeat, turn, trump, message } = state;
  const playerHand = hands[0] ?? [];
  const botHand = hands[1] ?? [];
  const playerTricks = tricksWon[0];
  const botTricks = tricksWon[1];
  const totalTricks = playerTricks + botTricks;
  const winThreshold = 13;
  const playerLeads = leadSeat === 0;
  const done = phase === "done";
  const legal: CardType[] = (!done && turn === 0 && ((playerLeads && currentTrick.length === 0) || currentTrick.length === 1))
    ? legalPlays(playerHand, currentTrick)
    : [];
  const legalIds = new Set(legal.map((c: CardType) => c.id));

  return (
    <div className="double-deck-pinochle-game">
      <div className="double-deck-pinochle-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: {trump ?? "♠"}</span>
      </div>
      <div className="double-deck-pinochle-bot-row">
        <div className="double-deck-pinochle-label">Bot ({botHand.length} cards)</div>
        <div className="double-deck-pinochle-card-backs">
          {botHand.map((_: CardType, i: number) => <div key={i} className="double-deck-pinochle-card-back" />)}
        </div>
      </div>
      <div className="double-deck-pinochle-trick">
        <div className="double-deck-pinochle-label">Current Trick</div>
        <div className="double-deck-pinochle-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="double-deck-pinochle-trick-slot">
                <div className="double-deck-pinochle-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="double-deck-pinochle-status">{message}</div>
      <div className="double-deck-pinochle-player-area">
        <div className="double-deck-pinochle-label">Your Hand</div>
        <div className="double-deck-pinochle-player-hand">
          {playerHand.map((card: CardType) => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as DoubleDeckPinochleAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="double-deck-pinochle-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
    </div>
  );
}
