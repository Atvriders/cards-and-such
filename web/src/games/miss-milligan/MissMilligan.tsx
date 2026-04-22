import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MissMilliganState, MissMilliganAction, MissMilliganSettings } from "./state.js";
import { missMilliganRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./MissMilligan.css";

export function MissMilligan({
  state,
  dispatch,
  onGameOver,
}: GameProps<MissMilliganState, MissMilliganSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as MissMilliganAction);
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
      const target = findAutoMove(state.piles, pileId, count, missMilliganRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as MissMilliganAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "deal-column" } as MissMilliganAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = getPile("stock");
  const stockCount = stock ? stock.cards.length : 0;

  return (
    <div className="miss-milligan">
      <div className="miss-milligan-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {stockCount}</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as MissMilliganAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="miss-milligan-top-row">
        <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
          <Pile
            pile={getPile("stock")}
            onCardDragStart={onDragStart}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
        <div className="miss-milligan-spacer" />
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

      <div className="miss-milligan-tableau-row">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((id) => (
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
