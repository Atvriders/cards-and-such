import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpiderTwoSuitsState, SpiderTwoSuitsAction, SpiderTwoSuitsSettings } from "./state.js";
import { spiderTwoSuitsRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function SpiderTwoSuitsGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SpiderTwoSuitsState, SpiderTwoSuitsSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SpiderTwoSuitsAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.faceUpCount ?? (pile.kind === "tableau" ? 0 : pile.cards.length);
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, spiderTwoSuitsRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as SpiderTwoSuitsAction);
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => dispatch({ type: "deal-row" } as SpiderTwoSuitsAction), [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = getPile("stock");
  const dealsRemaining = Math.floor(stock.cards.length / 10);

  return (
    <div className="sp2">
      <div className="sp2-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Suits: {state.completedSuits}/8</span>
        <span>Deals left: {dealsRemaining}</span>
      </div>
      <div className="sp2-top-row">
        <div className="pile-wrapper sp2-stock-wrapper" onClick={handleStockClick}>
          <Pile pile={getPile("stock")} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="sp2-spacer" />
        <div className="pile-wrapper sp2-completed-wrapper">
          <Pile pile={getPile("completed")} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
      </div>
      <div className="sp2-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
