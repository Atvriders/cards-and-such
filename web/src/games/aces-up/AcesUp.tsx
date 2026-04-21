import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcesUpState, AcesUpAction } from "./state.js";
import { findDiscardable } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import "./AcesUp.css";

export function AcesUp({
  state,
  dispatch,
  onGameOver,
}: GameProps<AcesUpState, Record<string, never>>): JSX.Element {
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  if (state.won) onGameOver(state.score);

  const discardable = new Set(findDiscardable(state.columns));
  const emptyColumns = state.columns.map((col, i) => col.length === 0 ? i : -1).filter((i) => i >= 0);

  const handleColClick = useCallback(
    (colIdx: number) => {
      const col = state.columns[colIdx]!;

      if (selectedCol !== null) {
        // We have a card selected — try to move to empty column
        if (col.length === 0) {
          dispatch({ type: "move-to-empty", fromCol: selectedCol, toCol: colIdx } as AcesUpAction);
          setSelectedCol(null);
          return;
        }
        setSelectedCol(null);
        return;
      }

      // Select if column has cards and there's an empty column to move to
      if (col.length > 0 && emptyColumns.length > 0 && !emptyColumns.includes(colIdx)) {
        setSelectedCol(colIdx);
      }
    },
    [selectedCol, state.columns, emptyColumns, dispatch],
  );

  return (
    <div className="aces-up">
      <div className="aces-up-info">
        <span>Discarded: {state.discarded.length}/48</span>
        <span>Stock: {state.stock.length}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      <div className="aces-up-columns">
        {state.columns.map((col, i) => {
          const topCard = col.length > 0 ? col[col.length - 1]! : undefined;
          const isDiscardable = topCard && discardable.has(i);
          const isSelected = selectedCol === i;
          const isEmptyTarget = selectedCol !== null && col.length === 0;

          return (
            <div key={i} className="aces-up-col-wrapper" onClick={() => handleColClick(i)}>
              {col.length === 0 ? (
                <div className={`aces-up-card-wrap empty-target${isEmptyTarget ? "" : ""}`}>
                  {isEmptyTarget ? "↓ drop" : "empty"}
                </div>
              ) : (
                <div
                  className={`aces-up-card-wrap${isDiscardable ? " discardable" : ""}${isSelected ? " moveable" : ""}`}
                >
                  <Card card={topCard!} faceDown={false} />
                </div>
              )}
              <div className="aces-up-col-label">{col.length} card{col.length !== 1 ? "s" : ""}</div>
            </div>
          );
        })}
      </div>

      <div className="aces-up-actions">
        <button
          className="aces-up-btn"
          disabled={state.stock.length === 0}
          onClick={() => dispatch({ type: "deal" } as AcesUpAction)}
        >
          Deal 4 ({state.stock.length} left)
        </button>
        <button
          className="aces-up-btn"
          disabled={discardable.size === 0}
          onClick={() => dispatch({ type: "discard-lowers" } as AcesUpAction)}
        >
          Discard Lowers ({discardable.size})
        </button>
      </div>

      {discardable.size > 0 && (
        <div style={{ fontSize: 12, color: "#f88" }}>
          {discardable.size} card(s) can be discarded — click "Discard Lowers".
        </div>
      )}
      {selectedCol !== null && (
        <div style={{ fontSize: 12, color: "#4af" }}>
          Card selected — click an empty column to move it there.
        </div>
      )}
    </div>
  );
}
