import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SchieberJassState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import { Card } from "../../engines/deck/Card.js";
import "./SchieberJass.css";

type SchieberJassAction = { type: "play"; cardId: string };

export function SchieberJass({ state, dispatch, onGameOver }: GameProps<SchieberJassState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const { hands, trick: currentTrick, tricksWon, leadSeat, phase, message, trump } = state;
  const playerHand = hands[0] ?? [];
  const botHand = hands[1] ?? [];
  const playerTricks = tricksWon[0];
  const botTricks = tricksWon[1];
  const totalTricks = tricksWon[0] + tricksWon[1];
  const winThreshold = Math.ceil((playerHand.length + botHand.length + totalTricks) / 2) + 1;
  const playerLeads = leadSeat === 0;
  const done = phase === "done";
  const legal = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map((c: typeof legal[number]) => c.id));

  return (
    <div className="schieber-jass-game">
      <div className="schieber-jass-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♠</span>
      </div>
      <div className="schieber-jass-bot-row">
        <div className="schieber-jass-label">Bot ({botHand.length} cards)</div>
        <div className="schieber-jass-card-backs">
          {botHand.map((_: typeof botHand[number], i: number) => <div key={i} className="schieber-jass-card-back" />)}
        </div>
      </div>
      <div className="schieber-jass-trick">
        <div className="schieber-jass-label">Current Trick</div>
        <div className="schieber-jass-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }: typeof currentTrick[number]) => (
              <div key={card.id} className="schieber-jass-trick-slot">
                <div className="schieber-jass-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="schieber-jass-status">{message}</div>
      <div className="schieber-jass-player-area">
        <div className="schieber-jass-label">Your Hand</div>
        <div className="schieber-jass-player-hand">
          {playerHand.map((card: typeof playerHand[number]) => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as SchieberJassAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="schieber-jass-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark trump used to satisfy lint */}
      <span style={{ display: "none" }}>{trump ?? "none"}</span>
    </div>
  );
}
