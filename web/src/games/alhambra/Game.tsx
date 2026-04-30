import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AlhambraState, AlhambraAction, AlhambraSettings } from "./state.js";
import { alhambraRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const UP_FOUND_IDS = ["fu1", "fu2", "fu3", "fu4"] as const;
const DN_FOUND_IDS = ["fd1", "fd2", "fd3", "fd4"] as const;
const TABLEAU_IDS = ["t1", "t2", "t3", "t4"] as const;

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<AlhambraState, AlhambraSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as AlhambraAction);
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
      const target = findAutoMove(state.piles, pileId, count, alhambraRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as AlhambraAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    dispatch({ type: "move", fromPile: "stock", toPile: "waste", count: 1 } as AlhambraAction);
  }, [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="alhambra">
      <div className="alhambra-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="alhambra-auto-btn"
          type="button"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as AlhambraAction)}
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

      <div className="alhambra-foundations">
        <div className="alhambra-found-group">
          <div className="alhambra-found-label">A→K</div>
          {UP_FOUND_IDS.map((id) => (
            <div key={id} className="alhambra-pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
              />
            </div>
          ))}
        </div>
        <div className="alhambra-found-group">
          <div className="alhambra-found-label">K→A</div>
          {DN_FOUND_IDS.map((id) => (
            <div key={id} className="alhambra-pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="alhambra-tableau-row">
        {TABLEAU_IDS.map((id) => (
          <div key={id} className="alhambra-pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        ))}

        <div className="alhambra-stock-waste">
          <div className="alhambra-pile-wrapper" onClick={handleStockClick} style={{ cursor: "pointer" }}>
            <Pile
              pile={getPile("stock")}
              onTopClick={handleStockClick}
            />
          </div>
          <div className="alhambra-pile-wrapper">
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
  );
}
