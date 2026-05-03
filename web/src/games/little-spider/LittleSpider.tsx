import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LittleSpiderState, LittleSpiderAction, LittleSpiderSettings } from "./state.js";
import { littleSpiderRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./LittleSpider.css";

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];
const FOUNDATION_LABELS = ["♥ up", "♦ up", "♠ down", "♣ down"];

export function LittleSpider({
  state,
  dispatch,
  onGameOver,
}: GameProps<LittleSpiderState, LittleSpiderSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as LittleSpiderAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, littleSpiderRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as LittleSpiderAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = getPile("stock");
  const stockLen = stock?.cards.length ?? 0;

  return (
    <div className="little-spider">
      <div className="little-spider-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}/52</span>
        <span>Stock: {stockLen}</span>
        <button data-testid="hint-target-little-spider-primary"
          className="deal-btn"
          onClick={() => dispatch({ type: "deal-row" } as LittleSpiderAction)}
          disabled={stockLen === 0}
        >
          Deal Row
        </button>
        <button
          className="auto-move-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as LittleSpiderAction)}
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

      <div className="little-spider-foundations">
        {FOUNDATION_IDS.map((id, i) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
            <div className="foundation-label">{FOUNDATION_LABELS[i]}</div>
          </div>
        ))}
      </div>

      <div className="little-spider-tableau">
        {TABLEAU_IDS.map((id) => (
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
