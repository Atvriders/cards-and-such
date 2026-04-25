import { useCallback } from "react";
import type { Card } from "../../engines/deck/index.js";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LastMonarchState, LastMonarchAction } from "./state.js";
import { legalDiscards } from "./state.js";
import "./LastMonarch.css";

const RL = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function LastMonarch({
  state,
  dispatch,
  onGameOver,
}: GameProps<LastMonarchState, {}>): JSX.Element {
  if (state.won) onGameOver(100);

  const legalSet = new Set(legalDiscards(state.row));
  const remaining = state.row.filter((c) => c !== null).length;

  const handleClick = useCallback(
    (index: number) => {
      dispatch({ type: "discard", index } as LastMonarchAction);
    },
    [dispatch],
  );

  return (
    <div className="last-monarch">
      <div className="lm-info">
        <span>Cards left: {remaining}</span>
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        {state.won && <span className="lm-win">You win! Only Kings remain!</span>}
      </div>
      <div className="lm-row">
        {state.row.map((card: Card | null, idx: number) => {
          if (card === null) return <div key={idx} className="lm-gap" />;
          const legal = legalSet.has(idx);
          const red = card.suit === "♥" || card.suit === "♦";
          const isKing = card.rank === 13;
          return (
            <div
              key={card.id}
              className={`lm-card ${red ? "red" : "black"} ${legal ? "legal" : ""} ${isKing ? "king" : ""}`}
              onClick={() => legal && handleClick(idx)}
              title={legal ? "Click to discard" : ""}
            >
              <span>{RL[card.rank]}</span>
              <span>{card.suit}</span>
            </div>
          );
        })}
      </div>
      {legalSet.size === 0 && !state.won && (
        <div className="lm-stuck">No more moves — game over!</div>
      )}
    </div>
  );
}
