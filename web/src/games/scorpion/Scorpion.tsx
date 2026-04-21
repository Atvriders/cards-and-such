import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScorpionState, ScorpionAction, ScorpionSettings } from "./state.js";
import { scorpionRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Scorpion.css";

export function Scorpion({
  state,
  dispatch,
  onGameOver,
}: GameProps<ScorpionState, ScorpionSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as ScorpionAction);
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
      const target = findAutoMove(state.piles, pileId, count, scorpionRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as ScorpionAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="scorpion">
      <div className="scorpion-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Suits: {state.completedSuits}/4</span>
        <button
          className="deal-reserve-btn"
          onClick={() => dispatch({ type: "deal-reserve" } as ScorpionAction)}
          disabled={state.reserveDealt}
          title="Deal 3 reserve cards to first 3 columns"
        >
          Deal Reserve
        </button>
      </div>

      <div className="scorpion-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
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
