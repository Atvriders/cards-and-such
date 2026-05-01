import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FreecellClassicState, FreecellClassicAction, FreecellClassicSettings } from "./state.js";
import { freecellClassicRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function FreecellClassicGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<FreecellClassicState, FreecellClassicSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as FreecellClassicAction);
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
      const target = findAutoMove(state.piles, pileId, count, freecellClassicRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as FreecellClassicAction);
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="fcc">
      <div className="fcc-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button className="fcc-auto-btn" type="button" onClick={() => dispatch({ type: "auto-move-to-foundation" } as FreecellClassicAction)}>Auto-move</button>
      </div>
      <div className="fcc-top-row">
        {["fc1", "fc2", "fc3", "fc4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
        <div className="fcc-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
          </div>
        ))}
      </div>
      <div className="fcc-cascade-row">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
