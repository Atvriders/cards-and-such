import { useCallback, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpiderState, SpiderAction, SpiderSettings } from "./state.js";
import { spiderRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Spider.css";

export function Spider({
  state,
  dispatch,
  onGameOver,
  seed,
}: GameProps<SpiderState, SpiderSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SpiderAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.faceUpCount ?? (pile.kind === "tableau" ? 0 : pile.cards.length);
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, spiderRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as SpiderAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "deal-row" } as SpiderAction);
  }, [dispatch]);

  if (state.won) {
    onGameOver(state.score);
  }

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
  const stock = getPile("stock");
  const stockCount = stock ? stock.cards.length : 0;
  const dealsRemaining = Math.floor(stockCount / 10);

  return (
    <div className={`spider fade-in${state.won ? " has-won" : ""}`}>
      <div className="spider-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Suits: {state.completedSuits}/8</span>
        <span>Deals left: {dealsRemaining}</span>
        {seed != null && (
          <span className="hud-seed" data-testid="hud-seed" title="Current deal seed">
            #{seed}
          </span>
        )}
      </div>

      <div className="spider-top-row">
        <div
          className="pile-wrapper stock-wrapper"
          role="button"
          tabIndex={0}
          aria-label={`Deal a row (${dealsRemaining} remaining)`}
          onClick={handleStockClick}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleStockClick(); } }}
          title={`Deal a row (${dealsRemaining} remaining)`}
        >
          <Pile
            pile={getPile("stock")}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>

        <div className="spider-spacer" />

        <div className="pile-wrapper completed-wrapper" title={`${state.completedSuits} suits completed`}>
          <Pile
            pile={getPile("completed")}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
      </div>

      <div className="spider-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10"].map((id) => (
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
