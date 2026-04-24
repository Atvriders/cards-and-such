import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleFreeState, DoubleFreeAction } from "./state.js";
import { doubleFreeCellRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function DoubleFreeCell({
  state,
  dispatch,
  onGameOver,
}: GameProps<DoubleFreeState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  if (state.won) onGameOver(state.score);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as DoubleFreeAction);
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
      const target = findAutoMove(state.piles, pileId, count, doubleFreeCellRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as DoubleFreeAction);
      }
    },
    [state.piles, dispatch],
  );

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const cascadeIds = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"];
  const freecellIds = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6"];
  const foundationIds = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"];

  return (
    <div className="double-freecell">
      <div className="double-freecell-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation: {state.score}/104</span>
        <button
          className="double-fc-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as DoubleFreeAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="double-freecell-top">
        <div className="double-freecells">
          {freecellIds.map((id) => (
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
        <div className="double-foundations">
          {foundationIds.map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="double-cascades">
        {cascadeIds.map((id) => (
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
