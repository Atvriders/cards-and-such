import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RelaxedSpiderState, RelaxedSpiderAction, RelaxedSpiderSettings } from "./state.js";
import { relaxedSpiderRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./RelaxedSpider.css";

export function RelaxedSpider({
  state,
  dispatch,
  onGameOver,
}: GameProps<RelaxedSpiderState, RelaxedSpiderSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as RelaxedSpiderAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUp = pile.faceUpCount ?? 0;
      const count = indexFromTop + 1;
      if (count > faceUp) return;
      const target = findAutoMove(state.piles, pileId, count, relaxedSpiderRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as RelaxedSpiderAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = state.piles.find((p) => p.id === "stock")!;
  const completed = state.piles.find((p) => p.id === "completed")!;

  return (
    <div className="relaxed-spider">
      <div className="rs-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Completed: {state.completedSuits}/8</span>
      </div>

      <div className="rs-top-row">
        <div className="pile-wrapper stock-wrapper" onClick={() => dispatch({ type: "deal-row" } as RelaxedSpiderAction)}>
          <Pile pile={stock} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={completed} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
      </div>

      <div className="rs-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
