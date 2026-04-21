import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeState, KlondikeAction, KlondikeSettings } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import "./Klondike.css";

export function Klondike({
  state,
  dispatch,
  onGameOver,
}: GameProps<KlondikeState, KlondikeSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KlondikeAction);
    },
    [dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as KlondikeAction);
    } else {
      dispatch({ type: "draw" } as KlondikeAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) {
    onGameOver(state.score);
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="klondike">
      <div className="klondike-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as KlondikeAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="klondike-top-row">
        <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
          <Pile
            pile={getPile("stock")}
            onCardDragStart={onDragStart}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>

        <div className="pile-wrapper waste-wrapper">
          <Pile
            pile={getPile("waste")}
            onCardDragStart={onDragStart}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>

        <div className="klondike-spacer" />

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

      <div className="klondike-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
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
  );
}
