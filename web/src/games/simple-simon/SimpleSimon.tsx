import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SimpleSimonState, SimpleSimonAction, SimpleSimonSettings } from "./state.js";
import { simpleSimonRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./SimpleSimon.css";

export function SimpleSimon({
  state,
  dispatch,
  onGameOver,
}: GameProps<SimpleSimonState, SimpleSimonSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SimpleSimonAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount =
        pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, simpleSimonRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as SimpleSimonAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const foundationCount = ["f1","f2","f3","f4"].reduce(
    (sum, id) => sum + (state.piles.find((p) => p.id === id)?.cards.length ?? 0),
    0,
  );

  return (
    <div className="simple-simon">
      <div className="simple-simon-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Suits completed: {foundationCount / 13} / 4</span>
      </div>

      <div className="simple-simon-foundations">
        {["f1","f2","f3","f4"].map((id) => (
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

      <div className="simple-simon-tableau">
        {["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10"].map((id) => (
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
