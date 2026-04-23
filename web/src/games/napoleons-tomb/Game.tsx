import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonsTombState, NapoleonsTombSettings, Card, Suit } from "./state.js";
import { isTerminal, SUITS, RANK_NUM } from "./state.js";
import "./Game.css";

function isRed(suit: string): boolean { return suit === "♥" || suit === "♦"; }

function CardFace({ card }: { card: Card }) {
  return (
    <div className={`nt-card ${isRed(card.suit) ? "red" : "black"}`}>
      <span className="nt-card-rank">{card.rank}</span>
      <span className="nt-card-suit">{card.suit}</span>
    </div>
  );
}

export function NapoleonsTombGame({ state, dispatch, onGameOver }: GameProps<NapoleonsTombState, NapoleonsTombSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const canPlayToFoundation = (card: Card | null): boolean => {
    if (!card) return false;
    const suitIdx = SUITS.indexOf(card.suit);
    const pile = state.foundations[suitIdx] ?? [];
    const top = pile.length > 0 ? pile[pile.length - 1]! : null;
    if (top === null) return card.rank === "A";
    return RANK_NUM[card.rank] === RANK_NUM[top.rank] + 1;
  };

  return (
    <div className="napoleons-tomb">
      <div className="nt-status">Moves: {state.moves} | Deck: {state.deck.length} remaining</div>

      {state.phase === "won" && <div className="nt-message won">You win! Score: {terminal?.score ?? 0}</div>}
      {state.phase === "lost" && <div className="nt-message lost">Stuck! Cards placed: {terminal?.score ?? 0}</div>}

      <div className="nt-layout">
        {/* Foundations */}
        <div className="nt-foundations">
          <div className="nt-foundations-label">Foundations</div>
          <div className="nt-foundations-grid">
            {SUITS.map((suit) => {
              const suitIdx = SUITS.indexOf(suit);
              const pile = state.foundations[suitIdx] ?? [];
              const top = pile.length > 0 ? pile[pile.length - 1]! : null;
              const complete = pile.length === 13;
              return (
                <div
                  key={suit}
                  className={`nt-foundation${complete ? " complete" : ""}`}
                  onClick={() => state.phase === "playing" && state.currentCard && dispatch({ type: "placeFoundation", suit: suit as Suit })}
                  title={`${suit} foundation — click to place current card`}
                >
                  {top ? <CardFace card={top} /> : <span style={{ color: "#aaa" }}>{suit}</span>}
                  <span style={{ fontSize: "0.7rem", color: "#888" }}>{pile.length}/13</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="nt-center">
          <div className="nt-center-label">Center Grid (place current card here)</div>
          <div className="nt-grid">
            {Array.from({ length: 9 }, (_, i) => {
              const card = state.grid[i] ?? null;
              return (
                <div
                  key={i}
                  className={`nt-cell${card ? " occupied" : ""}`}
                  onClick={() => {
                    if (state.phase !== "playing") return;
                    if (card) {
                      // Try move to foundation
                      dispatch({ type: "moveToFoundation", cell: i });
                    } else if (state.currentCard) {
                      dispatch({ type: "placeGrid", cell: i });
                    }
                  }}
                  title={card ? `${card.rank}${card.suit} — click to move to foundation` : "Click to place current card"}
                >
                  {card ? <CardFace card={card} /> : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current card */}
        <div className="nt-current-card">
          <div className="nt-current-label">Current Card</div>
          {state.currentCard ? (
            <div className={`nt-current ${isRed(state.currentCard.suit) ? "red" : "black"}`}>
              <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>{state.currentCard.rank}</span>
              <span>{state.currentCard.suit}</span>
              {canPlayToFoundation(state.currentCard) && (
                <span style={{ fontSize: "0.7rem", color: "#2a7a2a" }}>→ fnd</span>
              )}
            </div>
          ) : (
            <div className="nt-current" style={{ color: "#bbb", fontSize: "0.8rem" }}>None</div>
          )}
          <div className="nt-deck-count">{state.deck.length} in deck</div>
        </div>
      </div>

      {state.phase !== "playing" && (
        <div className="nt-controls">
          <button onClick={() => dispatch({ type: "newGame" })}>New Game</button>
        </div>
      )}

      <div className="nt-hint">
        Place current card into a grid cell or on a matching foundation (Ace→King by suit). Click grid cards to send them to foundations.
      </div>
    </div>
  );
}
