import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BrainiacState, BrainiacAction, BrainiacSettings } from "./state.js";
import { brainiacRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<BrainiacState, BrainiacSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as BrainiacAction);
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
      const target = findAutoMove(state.piles, pileId, count, brainiacRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as BrainiacAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="brainiac">
      <div className="brainiac-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="brainiac-auto-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as BrainiacAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="brainiac-foundations-row">
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="brainiac-pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
            />
          </div>
        ))}
      </div>

      <div className="brainiac-tableau-row">
        {["t1", "t2", "t3", "t4"].map((id) => (
          <div key={id} className="brainiac-pile-wrapper">
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
