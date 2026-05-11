import { useEffect } from "react";
import type { Card as CardType } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CoincheState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import { Card } from "../../engines/deck/Card.js";
import "./Coinche.css";

type CoincheAction = { type: "play"; cardId: string };

export function Coinche({ state, dispatch, onGameOver }: GameProps<CoincheState, object>): JSX.Element {
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
    <div className="coinche-game">
      <div className="coinche-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: {trump ?? "♣"}</span>
      </div>
      <div className="coinche-bot-row">
        <div className="coinche-label">Bot ({botHand.length} cards)</div>
        <div className="coinche-card-backs">
          {botHand.map((_: CardType, i: number) => <div key={i} className="coinche-card-back" />)}
        </div>
      </div>
      <div className="coinche-trick">
        <div className="coinche-label">Current Trick</div>
        <div className="coinche-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="coinche-trick-slot">
                <div className="coinche-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="coinche-status">{message}</div>
      <div className="coinche-player-area">
        <div className="coinche-label">Your Hand</div>
        <div className="coinche-player-hand">
          {playerHand.map((card: CardType) => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as CoincheAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="coinche-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
    </div>
  );
}
