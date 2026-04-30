import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FourSeasonsState, FourSeasonsAction } from "./state.js";
import { makeFourSeasonsRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./FourSeasons.css";

export function FourSeasons({
  state,
  dispatch,
  onGameOver,
}: GameProps<FourSeasonsState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();
  const ruleset = makeFourSeasonsRuleset(state.foundationStartRank);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FourSeasonsAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, ruleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as FourSeasonsAction);
      }
    },
    [state.piles, ruleset, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "draw" } as FourSeasonsAction);
  }, [dispatch]);

  if (state.won) {
    onGameOver(Math.max(0, 200 - state.movesMade));
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="four-seasons">
      <div className="four-seasons-info">
        <span>Moves: {state.movesMade}</span>
        <span>Start rank: {state.foundationStartRank === 1 ? "A" : state.foundationStartRank === 11 ? "J" : state.foundationStartRank === 12 ? "Q" : state.foundationStartRank === 13 ? "K" : state.foundationStartRank}</span>
        <button
          className="four-seasons-auto-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as FourSeasonsAction)}
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

      <div className="four-seasons-layout">
        <div className="four-seasons-corner">{/* f1 */}
          <Pile
            pile={getPile("f1")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
        <div className="four-seasons-cross">
          <div className="four-seasons-cross-top">
            <Pile
              pile={getPile("t1")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
          <div className="four-seasons-cross-middle">
            <Pile
              pile={getPile("t2")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
            <Pile
              pile={getPile("t3")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
            <Pile
              pile={getPile("t4")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
          <div className="four-seasons-cross-bottom">
            <Pile
              pile={getPile("t5")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
        <div className="four-seasons-corner">{/* f2 */}
          <Pile
            pile={getPile("f2")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
      </div>

      <div className="four-seasons-bottom">
        <div className="four-seasons-corner">{/* f3 */}
          <Pile
            pile={getPile("f3")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
        <div className="four-seasons-stock-area">
          <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
            <Pile
              pile={getPile("stock")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
          <div className="pile-wrapper">
            <Pile
              pile={getPile("waste")}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        </div>
        <div className="four-seasons-corner">{/* f4 */}
          <Pile
            pile={getPile("f4")}
            onCardDragStart={onDragStart}
            onDrop={(pid) => onDrop(pid, handleMove)}
            onDragOver={onDragOver}
          />
        </div>
      </div>
    </div>
  );
}
