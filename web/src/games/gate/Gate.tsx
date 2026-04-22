import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GateState, GateAction, GateSettings } from "./state.js";
import { gateRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Gate.css";

export function Gate({
  state,
  dispatch,
  onGameOver,
}: GameProps<GateState, GateSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as GateAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.kind === "tableau" ? (pile.faceUpCount ?? pile.cards.length) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, gateRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as GateAction);
      }
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = state.piles.find((p) => p.id === "stock");

  return (
    <div className="gate">
      <div className="gate-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        {stock && <span>Stock: {stock.cards.length}</span>}
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as GateAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="gate-top-row">
        {["fc1", "fc2"].map((id) => (
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
        <div className="gate-spacer" />
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

      <div className="gate-tableau-row">
        {["c1", "c2", "c3", "c4", "c5"].map((id) => (
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
