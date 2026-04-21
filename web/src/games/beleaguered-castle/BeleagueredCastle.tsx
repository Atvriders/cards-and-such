import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BeleagueredCastleState, BeleagueredCastleAction } from "./state.js";
import { beleagueredRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./BeleagueredCastle.css";

export function BeleagueredCastle({
  state,
  dispatch,
  onGameOver,
}: GameProps<BeleagueredCastleState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  if (state.won) onGameOver(state.score);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as BeleagueredCastleAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, beleagueredRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as BeleagueredCastleAction);
      }
    },
    [state.piles, dispatch],
  );

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const foundationIds = ["f1", "f2", "f3", "f4"];
  const tableauIds = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"];

  return (
    <div className="beleaguered-castle">
      <div className="beleaguered-castle-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation: {state.score}/52</span>
      </div>
      <div className="beleaguered-castle-layout">
        <div className="beleaguered-foundations">
          {foundationIds.map((id) => (
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
        <div className="beleaguered-tableaux">
          {tableauIds.map((id) => (
            <div key={id} className="beleaguered-row">
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
    </div>
  );
}
