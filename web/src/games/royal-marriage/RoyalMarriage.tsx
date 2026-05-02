import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RoyalMarriageState, RoyalMarriageAction, RoyalMarriageSettings } from "./state.js";
import "./RoyalMarriage.css";

const RANK_NAMES: Record<number, string> = {
  1: "A", 11: "J", 12: "Q", 13: "K",
};

function rankLabel(r: number): string {
  return RANK_NAMES[r] ?? String(r);
}

function isRed(suit: string): boolean {
  return suit === "♥" || suit === "♦";
}

export function RoyalMarriage({
  state,
  dispatch,
  onGameOver,
}: GameProps<RoyalMarriageState, RoyalMarriageSettings>): JSX.Element {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleCardClick = useCallback(
    (idx: number) => {
      if (selectedIdx === null) {
        setSelectedIdx(idx);
        return;
      }
      if (selectedIdx === idx) {
        setSelectedIdx(null);
        return;
      }
      const left = Math.min(selectedIdx, idx);
      const right = Math.max(selectedIdx, idx);
      dispatch({ type: "discard-between", leftIdx: left, rightIdx: right } as RoyalMarriageAction);
      setSelectedIdx(null);
    },
    [selectedIdx, dispatch],
  );

  if (state.won) {
    onGameOver(state.score);
  }

  const isSpecial = (idx: number) => {
    const c = state.row[idx]!;
    return (c.rank === 13 || c.rank === 12) && c.suit === "♥";
  };

  return (
    <div className="royal-marriage">
      <div className="rm-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Row: {state.row.length}</span>
      </div>

      <div className="rm-stock-area">
        <button
          className="rm-stock-btn"
          data-testid="hint-target-royal-marriage-deal"
          disabled={state.stock.length === 0}
          onClick={() => dispatch({ type: "deal-card" } as RoyalMarriageAction)}
        >
          Deal ({state.stock.length} left)
        </button>
      </div>

      <div className="rm-row">
        {state.row.map((card, idx) => (
          <div
            key={card.id}
            className={[
              "rm-card",
              isRed(card.suit) ? "red" : "black",
              selectedIdx === idx ? "selected" : "",
              isSpecial(idx) ? "special" : "",
            ].join(" ")}
            data-testid={`hint-target-royal-marriage-${idx}`}
            onClick={() => handleCardClick(idx)}
          >
            {rankLabel(card.rank)}{card.suit}
          </div>
        ))}
      </div>

      <div className="rm-hint">
        {selectedIdx !== null
          ? `Card selected — click another card 1 or 2 positions away (same suit or rank) to remove cards between them.`
          : "Click two cards of the same suit or rank with 1–2 cards between them to discard the middle card(s). Goal: marry K♥ and Q♥."}
      </div>
    </div>
  );
}
