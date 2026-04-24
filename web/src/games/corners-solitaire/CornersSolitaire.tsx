import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CornersSolitaireState, CornersSolitaireAction } from "./state.js";
import { cornersRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./CornersSolitaire.css";

export function CornersSolitaire({
  state,
  dispatch,
  onGameOver,
}: GameProps<CornersSolitaireState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as CornersSolitaireAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, cornersRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as CornersSolitaireAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as CornersSolitaireAction);
    } else {
      dispatch({ type: "draw" } as CornersSolitaireAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) {
    onGameOver(Math.max(0, 200 - state.movesMade));
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="corners">
      <div className="corners-info">
        <span>Moves: {state.movesMade}</span>
        <button
          className="corners-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as CornersSolitaireAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="corners-layout">
        <div className="corners-corner top-left">
          <Pile
            pile={getPile("cr1")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>
        <div className="corners-center">
          <div className="corners-foundations">
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
          <div className="corners-stock-row">
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
        </div>
        <div className="corners-corner top-right">
          <Pile
            pile={getPile("cr2")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>
      </div>

      <div className="corners-bottom-row">
        <div className="corners-corner">
          <Pile
            pile={getPile("cr3")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>
        <div className="corners-corner-spacer" />
        <div className="corners-corner">
          <Pile
            pile={getPile("cr4")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>
      </div>
    </div>
  );
}
