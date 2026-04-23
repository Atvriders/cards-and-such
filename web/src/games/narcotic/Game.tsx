import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NarcoticState, NarcoticAction, NarcoticSettings } from "./state.js";
import { findMatchBelow } from "./state.js";
import { rankLabel, isRed } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import "./Game.css";

function CardFace({ card, highlight, onClick }: { card: Card; highlight?: boolean; onClick?: () => void }) {
  const red = isRed(card.suit);
  return (
    <div
      className={`narcotic-card${red ? " red" : ""}${highlight ? " highlight" : ""}${onClick ? " clickable" : ""}`}
      onClick={onClick}
    >
      <span className="narcotic-rank">{rankLabel(card.rank)}</span>
      <span className="narcotic-suit">{card.suit}</span>
    </div>
  );
}

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<NarcoticState, NarcoticSettings>): JSX.Element {
  const matchIndex = findMatchBelow(state.pile);

  const handleRemove = useCallback(
    (idx: number) => {
      dispatch({ type: "remove", targetIndex: idx } as NarcoticAction);
    },
    [dispatch],
  );

  if (state.won) onGameOver(state.score);

  const top = state.pile[state.pile.length - 1];

  return (
    <div className="narcotic">
      <div className="narcotic-info">
        <span>Stock: {state.stock.length}</span>
        <span>Pile: {state.pile.length}</span>
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className="narcotic-area">
        {/* Stock */}
        <div
          className={`narcotic-stock${state.stock.length > 0 ? " clickable" : " empty"}`}
          onClick={() => state.stock.length > 0 && dispatch({ type: "draw" } as NarcoticAction)}
        >
          {state.stock.length > 0 ? (
            <div className="narcotic-card-back">{state.stock.length}</div>
          ) : (
            <div className="narcotic-empty-slot">Empty</div>
          )}
        </div>

        {/* Pile — show up to 8 cards stacked */}
        <div className="narcotic-pile">
          {state.pile.length === 0 ? (
            <div className="narcotic-empty-slot">Pile</div>
          ) : (
            <div className="narcotic-pile-stack">
              {state.pile.slice(-8).map((card, i, arr) => {
                const absoluteIdx = state.pile.length - arr.length + i;
                const isTopCard = absoluteIdx === state.pile.length - 1;
                const isMatchCard = absoluteIdx === matchIndex;
                return (
                  <div key={card.id} className="narcotic-pile-card" style={{ top: `${i * 18}px` }}>
                    <CardFace
                      card={card}
                      highlight={isMatchCard || isTopCard}
                      {...(isMatchCard && !isTopCard ? { onClick: () => handleRemove(absoluteIdx) } : {})}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {matchIndex !== -1 && top && (
        <div className="narcotic-hint">
          Click the highlighted card to remove cards in between!
        </div>
      )}

      {state.stock.length === 0 && state.pile.length > 0 && (
        <div className="narcotic-stuck">Stock empty — no more draws. {state.won ? "You win!" : "Game over."}</div>
      )}
    </div>
  );
}
