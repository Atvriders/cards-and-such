import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortressState, FortressAction } from "./state.js";
import { fortressRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./FortressSolitaire.css";

export function FortressSolitaire({
  state,
  dispatch,
  onGameOver,
}: GameProps<FortressState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FortressAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, fortressRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as FortressAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) {
    onGameOver(Math.max(0, 200 - state.movesMade));
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="fortress">
      <div className="fortress-info">
        <span>Moves: {state.movesMade}</span>
        <button
          className="fortress-auto-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as FortressAction)}
          title="Send any cards that can move to a foundation, automatically."
          aria-label="Auto-move cards to foundations"
          data-tooltip="Send any cards that can move to a foundation, automatically."
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          <span>Auto-move</span>
        </button>
      </div>
      <div className="fortress-foundations">
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>
      <div className="fortress-columns">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
