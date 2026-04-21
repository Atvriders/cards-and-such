import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StreetsAndAlleysState, StreetsAndAlleysAction } from "./state.js";
import { streetsRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./StreetsAndAlleys.css";

export function StreetsAndAlleys({
  state,
  dispatch,
  onGameOver,
}: GameProps<StreetsAndAlleysState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  if (state.won) onGameOver(state.score);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as StreetsAndAlleysAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, streetsRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as StreetsAndAlleysAction);
      }
    },
    [state.piles, dispatch],
  );

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="streets-and-alleys">
      <div className="streets-and-alleys-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation: {state.score}/52</span>
      </div>
      <div className="streets-and-alleys-layout">
        <div className="streets-foundations">
          {["f1", "f2", "f3", "f4"].map((id) => (
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
        <div className="streets-tableaux">
          {["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"].map((id) => (
            <div key={id} className="streets-row">
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
