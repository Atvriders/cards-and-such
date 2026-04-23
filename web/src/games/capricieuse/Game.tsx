import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CapricieseState, CapricieseAction, CapricieseSettings } from "./state.js";
import { capricieseRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const FOUNDATION_IDS = ["f1","f2","f3","f4","f5","f6","f7","f8"] as const;
const TABLEAU_IDS = ["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"] as const;

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<CapricieseState, CapricieseSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as CapricieseAction);
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
      const target = findAutoMove(state.piles, pileId, count, capricieseRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as CapricieseAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="capricieuse">
      <div className="capricieuse-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="capricieuse-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as CapricieseAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="capricieuse-foundations">
        {FOUNDATION_IDS.map((id) => (
          <div key={id} className="capricieuse-pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className="capricieuse-tableau">
        {TABLEAU_IDS.map((id) => (
          <div key={id} className="capricieuse-pile-wrapper">
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
