import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ShamrocksState, ShamrocksAction, ShamrocksSettings } from "./state.js";
import { shamrocksRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Shamrocks.css";

const TABLEAU_IDS = Array.from({ length: 18 }, (_, i) => `t${i + 1}`);
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];

export function Shamrocks({
  state,
  dispatch,
  onGameOver,
}: GameProps<ShamrocksState, ShamrocksSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as ShamrocksAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const target = findAutoMove(state.piles, pileId, 1, shamrocksRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as ShamrocksAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="shamrocks">
      <div className="shamrocks-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}/52</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as ShamrocksAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="shamrocks-foundations">
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

      <div className="shamrocks-tableau">
        {TABLEAU_IDS.map((id) => (
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
