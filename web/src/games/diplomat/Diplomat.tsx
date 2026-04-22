import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiplomatState, DiplomatAction, DiplomatSettings } from "./state.js";
import { diplomatRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Diplomat.css";

export function Diplomat({
  state,
  dispatch,
  onGameOver,
}: GameProps<DiplomatState, DiplomatSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as DiplomatAction);
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
      const target = findAutoMove(state.piles, pileId, count, diplomatRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as DiplomatAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "draw" } as DiplomatAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="diplomat">
      <div className="diplomat-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.piles.find((p) => p.id === "stock")?.cards.length ?? 0}</span>
      </div>

      <div className="diplomat-top-row">
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
        <div className="diplomat-spacer" />
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

      <div className="diplomat-tableau-row">
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
