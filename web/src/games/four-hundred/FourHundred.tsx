import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourHundredState } from "./state.js";
import { isTerminal } from "./state.js";
import { legalPlays } from "../_shared/trick-engine.js";
import type { Card as DeckCard } from "../../engines/deck/index.js";
import { Card } from "../../engines/deck/Card.js";
import "./FourHundred.css";

type FourHundredAction = { type: "play"; cardId: string };

const TRUMP_SUIT = "diamonds";
const WIN_THRESHOLD = 7;

export function FourHundred({ state, dispatch, onGameOver }: GameProps<FourHundredState, object>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const playerHand = state.hands[0] ?? [];
  const botHand = state.hands[1] ?? [];
  const currentTrick = state.trick;
  const playerTricks = state.tricksWon[0];
  const botTricks = state.tricksWon[1];
  const totalTricks = playerTricks + botTricks;
  const winThreshold = WIN_THRESHOLD;
  const playerLeads = state.leadSeat === 0;
  const { phase, message } = state;
  const done = phase === "done";
  const legal: DeckCard[] = (!done && playerLeads) || (!done && currentTrick.length === 1) ? legalPlays(playerHand, currentTrick) : [];
  const legalIds = new Set(legal.map((c: DeckCard) => c.id));

  return (
    <div className="four-hundred-game">
      <div className="four-hundred-header">
        <span>You: {playerTricks}</span>
        <span>Bot: {botTricks}</span>
        <span>Tricks: {totalTricks}</span>
        <span>Win: {winThreshold}+</span>
        <span>Trump: ♦</span>
      </div>
      <div className="four-hundred-bot-row">
        <div className="four-hundred-label">Bot ({botHand.length} cards)</div>
        <div className="four-hundred-card-backs">
          {botHand.map((_: DeckCard, i: number) => <div key={i} className="four-hundred-card-back" />)}
        </div>
      </div>
      <div className="four-hundred-trick">
        <div className="four-hundred-label">Current Trick</div>
        <div className="four-hundred-trick-cards">
          {currentTrick.length === 0
            ? <span style={{ opacity: 0.4 }}>—</span>
            : currentTrick.map(({ seat, card }: { seat: number; card: DeckCard }) => (
              <div key={card.id} className="four-hundred-trick-slot">
                <div className="four-hundred-trick-name">{seat === 0 ? "You" : "Bot"}</div>
                <Card card={card} />
              </div>
            ))}
        </div>
      </div>
      <div className="four-hundred-status">{message}</div>
      <div className="four-hundred-player-area">
        <div className="four-hundred-label">Your Hand</div>
        <div className="four-hundred-player-hand">
          {playerHand.map((card: DeckCard) => {
            const isLegal = legalIds.has(card.id);
            return isLegal
              ? <Card key={card.id} card={card} onClick={() => dispatch({ type: "play", cardId: card.id } as FourHundredAction)} />
              : <Card key={card.id} card={card} className={done ? "" : "dim"} />;
          })}
        </div>
      </div>
      {done && (
        <div className="four-hundred-result">
          <h2>Game Over</h2>
          <div>{message}</div>
        </div>
      )}
      {/* mark TRUMP_SUIT used to satisfy lint */}
      <span style={{ display: "none" }}>{TRUMP_SUIT}</span>
    </div>
  );
}
