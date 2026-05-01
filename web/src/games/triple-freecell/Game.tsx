import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleFreecellState, TripleFreecellAction, TripleFreecellSettings } from "./state.js";
import { tripleFreecellRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const CASCADE_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "c12", "c13"];
const FREECELL_IDS = ["fc1", "fc2", "fc3", "fc4", "fc5", "fc6", "fc7", "fc8"];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];

export function TripleFreecellGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TripleFreecellState, TripleFreecellSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as TripleFreecellAction);
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
      const target = findAutoMove(state.piles, pileId, count, tripleFreecellRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as TripleFreecellAction);
    },
    [state.piles, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="tfc">
      <div className="tfc-info">
        <span>Moves: {state.movesMade}</span>
        <span>Foundation: {state.score}/156</span>
        <button className="tfc-auto-btn" type="button" onClick={() => dispatch({ type: "auto-move-to-foundation" } as TripleFreecellAction)}>Auto-move</button>
      </div>
      <div className="tfc-top-row">
        <div className="tfc-cells">
          {FREECELL_IDS.map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
            </div>
          ))}
        </div>
        <div className="tfc-foundations">
          {FOUNDATION_IDS.map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
            </div>
          ))}
        </div>
      </div>
      <div className="tfc-cascade-row">
        {CASCADE_IDS.map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
