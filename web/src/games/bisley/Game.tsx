import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BisleyState, BisleyAction, BisleySettings } from "./state.js";
import { bisleyRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const UP_FOUND_IDS = ["fu1", "fu2", "fu3", "fu4"] as const;
const DN_FOUND_IDS = ["fd1", "fd2", "fd3", "fd4"] as const;
const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"] as const;

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<BisleyState, BisleySettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as BisleyAction);
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
      const target = findAutoMove(state.piles, pileId, count, bisleyRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as BisleyAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="bisley">
      <div className="bisley-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="bisley-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as BisleyAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="bisley-foundations-row">
        <div className="bisley-found-group">
          <div className="bisley-found-label">A→K</div>
          {UP_FOUND_IDS.map((id) => (
            <div key={id} className="bisley-pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
              />
            </div>
          ))}
        </div>
        <div className="bisley-found-group">
          <div className="bisley-found-label">K→A</div>
          {DN_FOUND_IDS.map((id) => (
            <div key={id} className="bisley-pile-wrapper">
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

      <div className="bisley-tableau-row">
        {TABLEAU_IDS.map((id) => (
          <div key={id} className="bisley-pile-wrapper">
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
