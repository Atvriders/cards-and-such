import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeaHavenTowersState, SeaHavenTowersAction } from "./state.js";
import { seaHavenRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./SeaHavenTowers.css";

export function SeaHavenTowers({
  state,
  dispatch,
  onGameOver,
}: GameProps<SeaHavenTowersState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SeaHavenTowersAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, seaHavenRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as SeaHavenTowersAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) {
    onGameOver(Math.max(0, 300 - state.movesMade));
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="sea-haven">
      <div className="sea-haven-info">
        <span>Moves: {state.movesMade}</span>
        <button
          className="sea-haven-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as SeaHavenTowersAction)}
        >
          Auto-move
        </button>
      </div>
      <div className="sea-haven-top">
        <div className="sea-haven-cells">
          {["r1", "r2", "r3", "r4"].map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pid) => onDrop(pid, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          ))}
        </div>
        <div className="sea-haven-foundations">
          {["f1", "f2", "f3", "f4"].map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pid) => onDrop(pid, handleMove)}
                onDragOver={onDragOver}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="sea-haven-columns">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pid) => onDrop(pid, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
