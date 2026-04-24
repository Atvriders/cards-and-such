import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MilliganCellState, MilliganCellAction } from "./state.js";
import { milliganCellRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function MilliganCell({
  state,
  dispatch,
  onGameOver,
}: GameProps<MilliganCellState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  if (state.won) onGameOver(state.score);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as MilliganCellAction);
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
      const target = findAutoMove(state.piles, pileId, count, milliganCellRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as MilliganCellAction);
      }
    },
    [state.piles, dispatch],
  );

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const freeCellIds = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8", "fc9", "fc10", "fc11", "fc12"];
  const cascadeIds = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];
  const foundationIds = ["f1", "f2", "f3", "f4"];

  return (
    <div className="milligan-cell">
      <div className="milligan-cell-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation: {state.score}/52</span>
        <button
          className="milligan-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as MilliganCellAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="milligan-cell-top">
        <div className="milligan-freecells">
          {freeCellIds.map((id) => (
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
        <div className="milligan-foundations">
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

      <div className="milligan-cascades">
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
