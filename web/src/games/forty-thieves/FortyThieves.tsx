import { useCallback, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FortyThievesState, FortyThievesAction, FortyThievesSettings } from "./state.js";
import { fortyThievesRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./FortyThieves.css";

export function FortyThieves({
  state,
  dispatch,
  onGameOver,
}: GameProps<FortyThievesState, FortyThievesSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FortyThievesAction);
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
      if (count !== 1) return; // Forty Thieves only moves 1 card
      const target = findAutoMove(state.piles, pileId, 1, fortyThievesRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as FortyThievesAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "draw" } as FortyThievesAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "d" || e.key === "D" || e.key === " ") {
        e.preventDefault();
        handleStockClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleStockClick]);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className={`forty-thieves${state.won ? " has-won" : ""}`}>
      <div className="forty-thieves-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.piles.find((p) => p.id === "stock")?.cards.length ?? 0}</span>
      </div>

      <div className="forty-thieves-top-row">
        <div
          className="pile-wrapper stock-wrapper"
          role="button"
          tabIndex={0}
          aria-label="Draw from stock"
          onClick={handleStockClick}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleStockClick(); } }}
          title="Click to draw"
        >
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

        <div className="forty-thieves-spacer" />

        {["f1","f2","f3","f4","f5","f6","f7","f8"].map((id) => (
          <div key={id} className="pile-wrapper foundation-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className="forty-thieves-tableau-row">
        {["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"].map((id) => (
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
