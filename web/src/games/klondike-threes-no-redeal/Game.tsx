import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KlondikeThreesNoRedealState, KlondikeThreesNoRedealAction, KlondikeThreesNoRedealSettings } from "./state.js";
import { k3nrRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function KlondikeThreesNoRedealGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<KlondikeThreesNoRedealState, KlondikeThreesNoRedealSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as KlondikeThreesNoRedealAction);
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
      const target = findAutoMove(state.piles, pileId, count, k3nrRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as KlondikeThreesNoRedealAction);
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => dispatch({ type: "draw" } as KlondikeThreesNoRedealAction), [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="k3nr">
      <div className="k3nr-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {getPile("stock").cards.length}</span>
        <button className="k3nr-auto-btn" type="button" onClick={() => dispatch({ type: "auto-move-to-foundation" } as KlondikeThreesNoRedealAction)}>Auto-move</button>
      </div>
      <div className="k3nr-top-row">
        <div className="pile-wrapper k3nr-stock-wrapper" onClick={handleStockClick}>
          <Pile pile={getPile("stock")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("waste")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="k3nr-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
          </div>
        ))}
      </div>
      <div className="k3nr-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
