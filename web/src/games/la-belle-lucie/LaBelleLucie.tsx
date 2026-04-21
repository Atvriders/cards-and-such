import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LaBelleLucieState, LaBelleLucieAction, LaBelleLucieSettings } from "./state.js";
import { laBelleLucieRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./LaBelleLucie.css";

const FAN_IDS = Array.from({ length: 18 }, (_, i) => `fan${i + 1}`);
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];

export function LaBelleLucie({
  state,
  dispatch,
  onGameOver,
}: GameProps<LaBelleLucieState, LaBelleLucieSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as LaBelleLucieAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      // Only top card can be moved in LBL
      const target = findAutoMove(state.piles, pileId, 1, laBelleLucieRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as LaBelleLucieAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="la-belle-lucie">
      <div className="la-belle-lucie-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="redeal-btn"
          onClick={() => dispatch({ type: "redeal" } as LaBelleLucieAction)}
          disabled={state.redealsRemaining <= 0}
        >
          Redeal ({state.redealsRemaining} left)
        </button>
      </div>

      <div className="la-belle-lucie-foundations">
        {FOUNDATION_IDS.map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className="la-belle-lucie-fans">
        {FAN_IDS.map((id) => {
          const pile = state.piles.find((p) => p.id === id);
          if (!pile) return null;
          return (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={pile}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
