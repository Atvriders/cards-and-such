import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeNoRedealState, KlondikeNoRedealAction, KlondikeNoRedealSettings } from "./state.js";
import { klondikeNoRedealRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function KlondikeNoRedealGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KlondikeNoRedealState, KlondikeNoRedealSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KlondikeNoRedealAction);
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
      const target = findAutoMove(state.piles, pileId, count, klondikeNoRedealRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as KlondikeNoRedealAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "draw" } as KlondikeNoRedealAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = getPile("stock");

  return (
    <div className="knr">
      <div className="knr-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {stock.cards.length}</span>
        <button
          className="knr-auto-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as KlondikeNoRedealAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="knr-top-row">
        <div className="pile-wrapper knr-stock-wrapper" onClick={handleStockClick}>
          <Pile pile={getPile("stock")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("waste")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="knr-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
          </div>
        ))}
      </div>

      <div className="knr-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
