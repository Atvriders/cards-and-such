import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PenguinState, PenguinAction } from "./state.js";
import { makePenguinRulesetPublic } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Penguin.css";

export function Penguin({
  state,
  dispatch,
  onGameOver,
}: GameProps<PenguinState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();
  const ruleset = makePenguinRulesetPublic(state.foundationRank);

  if (state.won) onGameOver(state.score);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as PenguinAction);
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
      const target = findAutoMove(state.piles, pileId, count, ruleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as PenguinAction);
      }
    },
    [state.piles, dispatch, ruleset],
  );

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="penguin">
      <div className="penguin-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation starts at: {state.foundationRank}</span>
        <span>Score: {state.score}/52</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as PenguinAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="penguin-top-row">
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
        <div style={{ flex: 1 }} />
        {["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7"].map((id) => (
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

      <div className="penguin-columns">
        {["col1", "col2", "col3", "col4", "col5", "col6", "col7"].map((id) => (
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
