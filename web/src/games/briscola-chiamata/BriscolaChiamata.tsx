import { useEffect } from "react";
import type { Card as CardType } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscolaChiamataState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import { Card } from "../../engines/deck/Card.js";
import "./BriscolaChiamata.css";

type BriscolaChiamataAction = { type: "play"; cardId: string };

export function BriscolaChiamata({ state, dispatch, onGameOver }: GameProps<BriscolaChiamataState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { hands, trick: currentTrick, tricksWon, phase, leadSeat, turn, trump, message } = state;
  const playerHand = hands[0] ?? [];
  const botHand = hands[1] ?? [];
  const playerTricks = tricksWon[0];
  const botTricks = tricksWon[1];
  const totalTricks = playerTricks + botTricks;
  const winThreshold = 11;
  const playerLeads = leadSeat === 0;
  const done = phase === "done";
  const legal: CardType[] = (!done && turn === 0 && ((playerLeads && currentTrick.length === 0) || currentTrick.length === 1))
    ? legalPlays(playerHand, currentTrick)
    : [];
  const legalIds = new Set(legal.map((c: CardType) => c.id));

  return (
    <div className="briscola-chiamata-game">
      <div className="briscola-chiamata-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: {trump ?? "♠"}</span>
      </div>
      <div className="briscola-chiamata-bot-row">
        <div className="briscola-chiamata-label">Bot ({botHand.length} cards)</div>
        <div className="briscola-chiamata-card-backs">
          {botHand.map((_: CardType, i: number) => <div key={i} className="briscola-chiamata-card-back" />)}
        </div>
      </div>
      <div className="briscola-chiamata-trick">
        <div className="briscola-chiamata-label">Current Trick</div>
        <div className="briscola-chiamata-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }: { seat: number; card: CardType }) => (
              <div key={card.id} className="briscola-chiamata-trick-slot">
                <div className="briscola-chiamata-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="briscola-chiamata-status">{message}</div>
      <div className="briscola-chiamata-player-area">
        <div className="briscola-chiamata-label">Your Hand</div>
        <div className="briscola-chiamata-player-hand">
          {playerHand.map((card: CardType) => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as BriscolaChiamataAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="briscola-chiamata-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
    </div>
  );
}
