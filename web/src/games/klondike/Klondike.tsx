import { useCallback, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeState, KlondikeAction, KlondikeSettings } from "./state.js";
import { klondikeRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
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

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      // For non-tableau piles (waste, foundation) all cards are effectively face-up;
      // faceUpCount is always 0 on those piles by design, so we must not use it as a gate.
      const faceUpCount =
        pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      // count = number of face-up cards from clicked position upward (inclusive)
      const count = indexFromTop + 1;
      if (count > faceUpCount) return; // clicked a face-down card — shouldn't happen but guard anyway
      const target = findAutoMove(state.piles, pileId, count, klondikeRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as KlondikeAction);
      }
    },
    [state.piles, dispatch],
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "auto-move-to-foundation" } as KlondikeAction);
      } else if (e.key === " " || e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleStockClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, handleStockClick]);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className={`klondike${state.won ? " has-won" : ""}`}>
      <div className="klondike-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="auto-move-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as KlondikeAction)}
          title="Send any cards that can move to a foundation, automatically."
          aria-label="Auto-move cards to foundations"
          data-tooltip="Send any cards that can move to a foundation, automatically."
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
          <span>Auto-move</span>
        </button>
      </div>

      <div className="klondike-top-row">
        <div
          className="pile-wrapper stock-wrapper"
          role="button"
          tabIndex={0}
          aria-label="Draw from stock"
          onClick={handleStockClick}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleStockClick(); } }}
        >
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
            onCardClick={handleCardClick}
          />
        </div>

        <div className="klondike-spacer" />

        {["f1", "f2", "f3", "f4"].map((id) => (
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

      <div className="klondike-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
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
