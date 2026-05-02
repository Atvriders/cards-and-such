import { useCallback, useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FreeCellState, FreeCellAction } from "./state.js";
import { freecellRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove, canMove } from "../../engines/tableau/index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { freecellSettings } from "./index.js";
import "./FreeCell.css";

type FreeCellSettings = SettingsOf<typeof freecellSettings>;

const PILE_ORDER = [
  "fc1", "fc2", "fc3", "fc4",
  "f1", "f2", "f3", "f4",
  "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8",
] as const;

export function FreeCell({
  state,
  dispatch,
  onGameOver,
  seed,
}: GameProps<FreeCellState, FreeCellSettings>): JSX.Element {
  const {
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDragEnd,
    onDrop,
    pileClassName,
  } = useDragDrop({ ruleset: freecellRuleset, piles: state.piles });

  const [focusIdx, setFocusIdx] = useState<number>(8); // default to c1
  const [selected, setSelected] = useState<{ pileId: string; count: number } | null>(null);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FreeCellAction);
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
      const target = findAutoMove(state.piles, pileId, count, freecellRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as FreeCellAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) {
    onGameOver(state.score);
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "auto-move-to-foundation" } as FreeCellAction);
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
        setFocusIdx((i) => (i >= 8 ? Math.max(0, i - 8) : i));
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIdx((i) => (i < 8 ? Math.min(PILE_ORDER.length - 1, i + 8) : i));
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const focusedId = PILE_ORDER[focusIdx]!;
        if (!selected) {
          const pile = state.piles.find((p) => p.id === focusedId);
          if (!pile || pile.cards.length === 0) return;
          setSelected({ pileId: focusedId, count: 1 });
        } else {
          if (selected.pileId === focusedId) {
            const target = findAutoMove(state.piles, selected.pileId, selected.count, freecellRuleset);
            if (target) {
              dispatch({ type: "move", fromPile: selected.pileId, toPile: target, count: selected.count } as FreeCellAction);
            }
          } else if (canMove(state.piles, { fromPile: selected.pileId, toPile: focusedId, count: selected.count }, freecellRuleset)) {
            dispatch({ type: "move", fromPile: selected.pileId, toPile: focusedId, count: selected.count } as FreeCellAction);
          }
          setSelected(null);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, focusIdx, selected, state.piles]);

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
    <div className={`freecell${state.won ? " has-won" : ""}`} data-testid="hint-target-freecell">
      <div className="freecell-info">
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
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as FreeCellAction)}
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

      <div className="freecell-top-row">
        {["fc1", "fc2", "fc3", "fc4"].map((id) => (
          <div key={id} className={wrapClass(id, "pile-wrapper freecell-wrapper")}>
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

      <div className="freecell-cascade-row">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((id) => (
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
