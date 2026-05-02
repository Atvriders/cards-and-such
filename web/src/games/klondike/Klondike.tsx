import { useCallback, useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeState, KlondikeAction, KlondikeSettings } from "./state.js";
import { klondikeRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove, canMove } from "../../engines/tableau/index.js";
import "./Klondike.css";

const PILE_ORDER = ["stock", "waste", "f1", "f2", "f3", "f4", "t1", "t2", "t3", "t4", "t5", "t6", "t7"] as const;

export function Klondike({
  state,
  dispatch,
  onGameOver,
  seed,
}: GameProps<KlondikeState, KlondikeSettings>): JSX.Element {
  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KlondikeAction);
    },
    [dispatch],
  );

  const {
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDragEnd,
    onDrop,
    pileClassName,
  } = useDragDrop({ ruleset: klondikeRuleset, piles: state.piles, onMove: handleMove });

  // Keyboard cursor: which pile is highlighted, and whether a pickup is pending.
  const [focusIdx, setFocusIdx] = useState<number>(6); // default to t1
  const [selected, setSelected] = useState<{ pileId: string; count: number } | null>(null);

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount =
        pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
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

  // Keyboard navigation: arrows to move focus, Enter to pick up / drop.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "auto-move-to-foundation" } as KlondikeAction);
        return;
      }
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleStockClick();
        return;
      }
      if (e.key === "Escape") {
        setSelected(null);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setFocusIdx((i) => (i + PILE_ORDER.length - 1) % PILE_ORDER.length);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setFocusIdx((i) => (i + 1) % PILE_ORDER.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIdx((i) => (i >= 6 ? Math.max(0, i - 6) : 0));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => (i < 6 ? Math.min(PILE_ORDER.length - 1, i + 6) : i));
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const focusedId = PILE_ORDER[focusIdx]!;
        if (focusedId === "stock") {
          handleStockClick();
          return;
        }
        if (!selected) {
          // Pick up top card of focused pile.
          const pile = state.piles.find((p) => p.id === focusedId);
          if (!pile || pile.cards.length === 0) return;
          const faceUp =
            pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
          if (faceUp <= 0) return;
          setSelected({ pileId: focusedId, count: 1 });
        } else {
          // Drop selected onto focused pile (or auto-move if same pile).
          if (selected.pileId === focusedId) {
            const target = findAutoMove(state.piles, selected.pileId, selected.count, klondikeRuleset);
            if (target) {
              dispatch({ type: "move", fromPile: selected.pileId, toPile: target, count: selected.count } as KlondikeAction);
            }
          } else if (canMove(state.piles, { fromPile: selected.pileId, toPile: focusedId, count: selected.count }, klondikeRuleset)) {
            dispatch({ type: "move", fromPile: selected.pileId, toPile: focusedId, count: selected.count } as KlondikeAction);
          }
          setSelected(null);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, focusIdx, handleStockClick, selected, state.piles]);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const focusedId = PILE_ORDER[focusIdx];

  const wrapClass = (id: string, base: string): string => {
    const isFocus = focusedId === id;
    const isSelected = selected?.pileId === id;
    const dropClass = pileClassName(id, "", state.piles).trim();
    return [base, isFocus ? "kbd-focus" : "", isSelected ? "kbd-selected" : "", dropClass]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className={`klondike${state.won ? " has-won" : ""}`} data-testid="hint-target-klondike">
      <div className="klondike-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        {seed != null && (
          <span className="hud-seed" data-testid="hud-seed" title="Current deal seed">
            #{seed}
          </span>
        )}
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
          className={wrapClass("stock", "pile-wrapper stock-wrapper")}
          role="button"
          tabIndex={0}
          aria-label="Draw from stock"
          onClick={handleStockClick}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleStockClick(); } }}
        >
          <Pile
            pile={getPile("stock")}
            onCardDragStart={onDragStart}
            onCardDragEnd={onDragEnd}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
          />
        </div>

        <div className={wrapClass("waste", "pile-wrapper waste-wrapper")}>
          <Pile
            pile={getPile("waste")}
            onCardDragStart={onDragStart}
            onCardDragEnd={onDragEnd}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onCardClick={handleCardClick}
          />
        </div>

        <div className="klondike-spacer" />

        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className={wrapClass(id, "pile-wrapper foundation-wrapper")}>
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onCardDragEnd={onDragEnd}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
            />
          </div>
        ))}
      </div>

      <div className="klondike-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
          <div key={id} className={wrapClass(id, "pile-wrapper")}>
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onCardDragEnd={onDragEnd}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
