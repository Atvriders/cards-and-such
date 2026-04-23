import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WindmillState, WindmillAction } from "./state.js";
import { windmillRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Windmill.css";

export function Windmill({
  state,
  dispatch,
  onGameOver,
}: GameProps<WindmillState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as WindmillAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      if (faceUpCount === 0) return;
      const target = findAutoMove(state.piles, pileId, 1, windmillRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as WindmillAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "draw" } as WindmillAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="windmill">
      <div className="windmill-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>

      {/* Top row: f1 sail-s1 f2 */}
      <div className="windmill-top-row">
        <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
          <Pile pile={getPile("stock")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("waste")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("reserve")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="windmill-spacer" />
        <div className="pile-wrapper">
          <Pile pile={getPile("f1")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("s1")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("f2")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
      </div>

      {/* Middle row: sail-s2, sail-s3 */}
      <div className="windmill-mid-row">
        <div className="pile-wrapper">
          <Pile pile={getPile("s2")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="windmill-spacer" />
        <div className="pile-wrapper">
          <Pile pile={getPile("s3")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
      </div>

      {/* Bottom row: f3, sail-s4, f4 */}
      <div className="windmill-bot-row">
        <div className="windmill-spacer" />
        <div className="pile-wrapper">
          <Pile pile={getPile("f3")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("s4")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("f4")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
      </div>
    </div>
  );
}
