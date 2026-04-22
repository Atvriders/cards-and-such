import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortyAndEightState, FortyAndEightAction, FortyAndEightSettings } from "./state.js";
import { fortyAndEightRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./FortyAndEight.css";

export function FortyAndEight({
  state,
  dispatch,
  onGameOver,
}: GameProps<FortyAndEightState, FortyAndEightSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FortyAndEightAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount =
        pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      if (count !== 1) return;
      const target = findAutoMove(state.piles, pileId, 1, fortyAndEightRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as FortyAndEightAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0 && state.redealsLeft > 0) {
      dispatch({ type: "redeal" } as FortyAndEightAction);
    } else {
      dispatch({ type: "draw" } as FortyAndEightAction);
    }
  }, [state.piles, state.redealsLeft, dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="forty-and-eight">
      <div className="forty-and-eight-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Redeals: {state.redealsLeft}</span>
        <span>Stock: {state.piles.find((p) => p.id === "stock")?.cards.length ?? 0}</span>
      </div>

      <div className="forty-and-eight-top-row">
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
        <div className="forty-and-eight-spacer" />
        {["f1","f2","f3","f4","f5","f6","f7","f8"].map((id) => (
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

      <div className="forty-and-eight-tableau-row">
        {["t1","t2","t3","t4","t5","t6","t7","t8"].map((id) => (
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
