import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScorpionTailState, ScorpionTailAction, ScorpionTailSettings } from "./state.js";
import { scorpionTailRuleset, TABLEAU_IDS } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./ScorpionTail.css";

export function ScorpionTail({
  state,
  dispatch,
  onGameOver,
}: GameProps<ScorpionTailState, ScorpionTailSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as ScorpionTailAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.faceUpCount ?? 0;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, scorpionTailRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as ScorpionTailAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="scorpion-tail">
      <div className="scorpion-tail-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Suits: {state.completedSuits}/4</span>
        <button
          onClick={() => dispatch({ type: "deal-reserve" } as ScorpionTailAction)}
          disabled={state.reserveDealt}
          title="Deal reserve cards to first columns"
        >
          Deal Reserve
        </button>
      </div>

      <div className="scorpion-tail-tableau-row">
        {TABLEAU_IDS.map((id) => (
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
