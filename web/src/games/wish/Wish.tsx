import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WishState, WishAction, WishSettings } from "./state.js";
import "./Wish.css";

const RANK_NAMES: Record<number, string> = {
  1: "A", 7: "7", 8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

export function Wish({
  state,
  dispatch,
  onGameOver,
}: GameProps<WishState, WishSettings>): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null);

  const handlePileClick = useCallback(
    (idx: number) => {
      if (state.piles[idx]!.length === 0) return;
      if (selected === null) {
        setSelected(idx);
        return;
      }
      if (selected === idx) {
        setSelected(null);
        return;
      }
      dispatch({ type: "remove-pair", pileA: selected, pileB: idx } as WishAction);
      setSelected(null);
    },
    [selected, dispatch, state.piles],
  );

  if (state.won) {
    onGameOver(state.score);
  }

  return (
    <div className="wish">
      <div className="wish-info">
        <span>Pairs removed: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Cards left: {state.piles.reduce((s, p) => s + p.length, 0)}</span>
      </div>

      <div className="wish-piles">
        {state.piles.map((pile, idx) => {
          const topCard = pile.length > 0 ? pile[pile.length - 1]! : null;
          const isSel = selected === idx;
          return (
            <div key={idx} className="wish-pile">
              <div className="wish-pile-header">Pile {idx + 1}</div>
              {topCard ? (
                <div
                  className={`wish-card ${isRed(topCard.suit) ? "red" : "black"}${isSel ? " selected" : ""}`}
                  onClick={() => handlePileClick(idx)}
                >
                  {RANK_NAMES[topCard.rank] ?? String(topCard.rank)}{topCard.suit}
                  <span className="wish-card-count">{pile.length}</span>
                </div>
              ) : (
                <div className="wish-pile-empty">empty</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="wish-hint">
        {selected !== null
          ? `Pile ${selected + 1} selected — click another pile to remove a matching pair.`
          : "Click a pile to select its top card, then click another pile with the same rank to remove both."}
      </div>
    </div>
  );
}
