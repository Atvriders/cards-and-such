import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FreeCellState, FreeCellAction } from "./state.js";
import { freecellRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { freecellSettings } from "./index.js";
import "./FreeCell.css";

type FreeCellSettings = SettingsOf<typeof freecellSettings>;

export function FreeCell({
  state,
  dispatch,
  onGameOver,
}: GameProps<FreeCellState, FreeCellSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FreeCellAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.faceUpCount ?? (pile.kind === "tableau" ? 0 : pile.cards.length);
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, freecellRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as FreeCellAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) {
    onGameOver(state.score);
  }

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="freecell">
      <div className="freecell-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as FreeCellAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="freecell-top-row">
        {["fc1", "fc2", "fc3", "fc4"].map((id) => (
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

      <div className="freecell-cascade-row">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((id) => (
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
