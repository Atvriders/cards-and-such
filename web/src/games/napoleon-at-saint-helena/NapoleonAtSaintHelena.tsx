import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonState, NapoleonAction } from "./state.js";
import { napoleonRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./NapoleonAtSaintHelena.css";

export function NapoleonAtSaintHelena({
  state,
  dispatch,
  onGameOver,
}: GameProps<NapoleonState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as NapoleonAction);
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
      const target = findAutoMove(state.piles, pileId, count, napoleonRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as NapoleonAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as NapoleonAction);
    } else {
      dispatch({ type: "draw" } as NapoleonAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) {
    onGameOver(Math.max(0, 500 - state.movesMade));
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="napoleon">
      <div className="napoleon-info">
        <span>Moves: {state.movesMade}</span>
        <button
          className="napoleon-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as NapoleonAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="napoleon-top">
        <div className="napoleon-stock-area">
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
        </div>
        <div className="napoleon-foundations">
          {["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"].map((id) => (
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

      <div className="napoleon-tableau">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"].map((id) => (
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
