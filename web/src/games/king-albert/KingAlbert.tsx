import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingAlbertState, KingAlbertAction } from "./state.js";
import { kingAlbertRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./KingAlbert.css";

export function KingAlbert({
  state,
  dispatch,
  onGameOver,
}: GameProps<KingAlbertState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KingAlbertAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, kingAlbertRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as KingAlbertAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) {
    onGameOver(Math.max(0, 300 - state.movesMade));
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="king-albert">
      <div className="king-albert-info">
        <span>Moves: {state.movesMade}</span>
        <button
          className="king-albert-auto-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as KingAlbertAction)}
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

      <div className="king-albert-top">
        <div className="king-albert-reserve">
          {["rv1", "rv2", "rv3", "rv4", "rv5", "rv6", "rv7"].map((id) => (
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
        <div className="king-albert-foundations">
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
      </div>

      <div className="king-albert-tableau">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"].map((id) => (
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
