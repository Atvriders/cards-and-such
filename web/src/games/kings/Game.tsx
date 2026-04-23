import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsState, KingsAction, KingsSettings } from "./state.js";
import { kingsRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12","t13"] as const;
const KING_FOUND_IDS = ["k1", "k2", "k3", "k4"] as const;

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<KingsState, KingsSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KingsAction);
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
      const target = findAutoMove(state.piles, pileId, count, kingsRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as KingsAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="kings">
      <div className="kings-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="kings-auto-btn"
          onClick={() => dispatch({ type: "auto-remove-kings" } as KingsAction)}
        >
          Remove Kings
        </button>
      </div>

      <div className="kings-foundations-row">
        <span className="kings-found-label">Kings:</span>
        {KING_FOUND_IDS.map((id) => (
          <div key={id} className="kings-pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className="kings-tableau-row">
        {TABLEAU_IDS.map((id) => (
          <div key={id} className="kings-pile-wrapper">
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
