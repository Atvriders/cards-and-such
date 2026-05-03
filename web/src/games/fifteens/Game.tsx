import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FifteensState, FifteensSettings, Card } from "./state.js";
import { isTerminal, CARD_VALUE } from "./state.js";
import "./Game.css";

function suitClass(suit: string): string {
  if (suit === "♥" || suit === "♦") return "hearts";
  return "spades";
}

function CardEl({ card, selected, onClick }: { card: Card; selected: boolean; onClick: () => void }) {
  return (
    <div
      className={`fifteens-card ${suitClass(card.suit)}${selected ? " selected" : ""}`}
      onClick={onClick}
    >
      <span className="fifteens-card-rank">{card.rank}</span>
      <span className="fifteens-card-suit">{card.suit}</span>
    </div>
  );
}

export function FifteensGame({ state, dispatch, onGameOver }: GameProps<FifteensState, FifteensSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const visibleCards = state.faceUp.filter(Boolean) as Card[];
  const selectedCards = visibleCards.filter((c) => state.selected.includes(c.id));
  const currentSum = selectedCards.reduce((s, c) => s + CARD_VALUE[c.rank], 0);
  const isValid = currentSum === 15 && selectedCards.length > 0;

  return (
    <div className="fifteens">
      <div className="fifteens-status">
        Moves: {state.moves} &nbsp;|&nbsp; Cards left in deck: {state.deck.length}
      </div>

      {state.phase === "won" && <div className="fifteens-message won">Cleared! Score: {terminal?.score ?? 0}</div>}
      {state.phase === "lost" && <div className="fifteens-message lost">No more valid moves — stuck!</div>}

      <div className="fifteens-cards">
        {visibleCards.map((card) => (
          <CardEl
            key={card.id}
            card={card}
            selected={state.selected.includes(card.id)}
            onClick={() => state.phase === "playing" && dispatch({ type: "toggleSelect", cardId: card.id })}
          />
        ))}
        {visibleCards.length === 0 && state.phase === "playing" && (
          <div className="fifteens-status">No face-up cards.</div>
        )}
      </div>

      {state.phase === "playing" && (
        <div className={`fifteens-sum${isValid ? " valid" : ""}`}>
          Selected sum: {currentSum} {isValid ? "= 15 ✓" : ""}
        </div>
      )}

      <div className="fifteens-controls">
        {state.phase === "playing" && (
          <button data-testid="hint-target-fifteens-primary" disabled={!isValid} onClick={() => dispatch({ type: "remove" })}>
            Remove (sum = 15)
          </button>
        )}
        {state.phase !== "playing" && (
          <button onClick={() => dispatch({ type: "newGame" })}>New Game</button>
        )}
      </div>

      <div className="fifteens-deck-info">
        {state.phase === "playing"
          ? "Click cards to select them. Remove any group summing to 15. Ace=1, J/Q/K=10."
          : ""}
      </div>
    </div>
  );
}
