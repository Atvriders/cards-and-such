import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CanfieldStorehouseState, CanfieldStorehouseAction } from "./state.js";
import { storehouseRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./CanfieldStorehouse.css";

export function CanfieldStorehouse({
  state,
  dispatch,
  onGameOver,
}: GameProps<CanfieldStorehouseState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as CanfieldStorehouseAction);
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
      const target = findAutoMove(state.piles, pileId, count, storehouseRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as CanfieldStorehouseAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as CanfieldStorehouseAction);
    } else {
      dispatch({ type: "draw" } as CanfieldStorehouseAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) {
    onGameOver(state.score);
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const storehouseIds = Array.from({ length: 13 }, (_, i) => `s${i + 1}`);

  return (
    <div className="storehouse">
      <div className="storehouse-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="storehouse-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as CanfieldStorehouseAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="storehouse-storehouse-row">
        {storehouseIds.map((id) => (
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

      <div className="storehouse-top-row">
        <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
          <Pile
            pile={getPile("stock")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
        <div className="pile-wrapper">
          <Pile
            pile={getPile("waste")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>
        <div className="storehouse-spacer" />
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

      <div className="storehouse-tableau-row">
        {["t1", "t2", "t3", "t4"].map((id) => (
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
