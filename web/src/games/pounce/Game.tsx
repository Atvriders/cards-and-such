import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PounceState, PounceAction, PounceSettings } from "./state.js";
import { pounceRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"] as const;

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<PounceState, PounceSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as PounceAction);
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
      const target = findAutoMove(state.piles, pileId, count, pounceRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as PounceAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length === 0) {
      dispatch({ type: "recycle" } as PounceAction);
    } else {
      dispatch({ type: "draw" } as PounceAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="pounce">
      <div className="pounce-info">
        <span>Pounce: {getPile("pounce").cards.length}</span>
        <span>Stock: {getPile("stock").cards.length}</span>
        <span>Score: {state.score}</span>
        <button
          className="pounce-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as PounceAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="pounce-foundations">
        {FOUNDATION_IDS.map((id) => (
          <div key={id} className="pounce-pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className="pounce-main-row">
        {/* Pounce pile */}
        <div className="pounce-section">
          <div className="pounce-section-label">Pounce Pile</div>
          <div className="pounce-pile-wrapper">
            <Pile
              pile={getPile("pounce")}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        </div>

        {/* Stock + Waste */}
        <div className="pounce-section">
          <div className="pounce-section-label">Stock / Waste</div>
          <div className="pounce-stock-waste">
            <div className="pounce-pile-wrapper" onClick={handleStockClick} style={{ cursor: "pointer" }}>
              <Pile pile={getPile("stock")} onTopClick={handleStockClick} />
            </div>
            <div className="pounce-pile-wrapper">
              <Pile
                pile={getPile("waste")}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
