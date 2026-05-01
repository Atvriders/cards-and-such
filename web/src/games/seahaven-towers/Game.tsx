import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeahavenTowersState, SeahavenTowersAction, SeahavenTowersSettings } from "./state.js";
import { seahavenTowersRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function SeahavenTowersGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SeahavenTowersState, SeahavenTowersSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SeahavenTowersAction);
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
      const target = findAutoMove(state.piles, pileId, count, seahavenTowersRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as SeahavenTowersAction);
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="sht">
      <div className="sht-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <button className="sht-auto-btn" type="button" onClick={() => dispatch({ type: "auto-move-to-foundation" } as SeahavenTowersAction)}>Auto-move</button>
      </div>
      <div className="sht-top-row">
        {["fc1", "fc2", "fc3", "fc4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
        <div className="sht-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
          </div>
        ))}
      </div>
      <div className="sht-tableau-row">
        {["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
