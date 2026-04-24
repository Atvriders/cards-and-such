import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WestcliffEasyState, WestcliffEasyAction } from "./state.js";
import { westcliffEasyRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function WestcliffEasy({
  state,
  dispatch,
  onGameOver,
}: GameProps<WestcliffEasyState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  if (state.won) onGameOver(state.score);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as WestcliffEasyAction);
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
      const target = findAutoMove(state.piles, pileId, count, westcliffEasyRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as WestcliffEasyAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length > 0) {
      dispatch({ type: "draw" } as WestcliffEasyAction);
    }
  }, [state.piles, dispatch]);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="westcliff-easy">
      <div className="westcliff-easy-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation: {state.score}/52</span>
        <span>Stock: {state.piles.find((p) => p.id === "stock")?.cards.length ?? 0}</span>
      </div>

      <div className="westcliff-easy-top-row">
        <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
          <Pile
            pile={getPile("stock")}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
        <div className="pile-wrapper">
          <Pile
            pile={getPile("waste")}
            onCardDragStart={onDragStart}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>
        <div className="westcliff-easy-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
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

      <div className="westcliff-easy-columns">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"].map((id) => (
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
