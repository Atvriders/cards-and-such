import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PerseveranceState, PerseveranceAction, PerseveranceSettings } from "./state.js";
import { perseveranceRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Perseverance.css";

export function Perseverance({
  state,
  dispatch,
  onGameOver,
}: GameProps<PerseveranceState, PerseveranceSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as PerseveranceAction);
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
      if (count !== 1) return;
      const target = findAutoMove(state.piles, pileId, 1, perseveranceRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as PerseveranceAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="perseverance">
      <div className="perseverance-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="perseverance-top-row">
        {["f1","f2","f3","f4"].map((id) => (
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

      <div className="perseverance-tableau">
        {["t1","t2","t3","t4","t5","t6","t7","t8","t9","t10","t11","t12"].map((id) => (
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
