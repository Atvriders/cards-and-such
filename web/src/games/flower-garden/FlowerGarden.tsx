import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlowerGardenState, FlowerGardenAction } from "./state.js";
import { flowerGardenRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./FlowerGarden.css";

export function FlowerGarden({
  state,
  dispatch,
  onGameOver,
}: GameProps<FlowerGardenState, Record<string, never>>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FlowerGardenAction);
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
      // Only top card is playable in Flower Garden
      if (indexFromTop !== 0) return;
      const target = findAutoMove(state.piles, pileId, 1, flowerGardenRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as FlowerGardenAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleGardenClick = useCallback(() => {
    // Click top of garden to auto-play
    const garden = state.piles.find((p) => p.id === "garden");
    if (!garden || garden.cards.length === 0) return;
    const target = findAutoMove(state.piles, "garden", 1, flowerGardenRuleset);
    if (target) {
      dispatch({ type: "move", fromPile: "garden", toPile: target, count: 1 } as FlowerGardenAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="flower-garden">
      <div className="fg-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as FlowerGardenAction)}
        >
          Auto-move
        </button>
      </div>

      <div className="fg-top-row">
        <div className="pile-wrapper garden-wrapper" onClick={handleGardenClick}>
          <Pile pile={getPile("garden")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="fg-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
          </div>
        ))}
      </div>

      <div className="fg-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
