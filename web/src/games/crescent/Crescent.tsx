import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrescentState, CrescentAction, CrescentSettings } from "./state.js";
import { crescentRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Crescent.css";

export function Crescent({
  state,
  dispatch,
  onGameOver,
}: GameProps<CrescentState, CrescentSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as CrescentAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.kind === "tableau" ? (pile.faceUpCount ?? pile.cards.length) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, crescentRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as CrescentAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="crescent">
      <div className="crescent-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsLeft}</span>
        <button
          className="redeal-btn"
          onClick={() => dispatch({ type: "redeal" } as CrescentAction)}
          disabled={state.redealsLeft <= 0}
        >
          Redeal
        </button>
        <button
          className="auto-move-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as CrescentAction)}
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

      <div className="crescent-foundations">
        <div className="crescent-foundation-group">
          <span className="foundation-label">Aces up</span>
          {["fa1", "fa2", "fa3", "fa4"].map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          ))}
        </div>
        <div className="crescent-foundation-group">
          <span className="foundation-label">Kings down</span>
          {["fk1", "fk2", "fk3", "fk4"].map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="crescent-tableau">
        {Array.from({ length: 16 }, (_, i) => `cr${i + 1}`).map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
