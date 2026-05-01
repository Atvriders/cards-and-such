import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SoliState, SoliAction, SoliSettings } from "./state.js";
import { vegasKlondikeRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

export function SoliGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<SoliState, SoliSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SoliAction);
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
      const target = findAutoMove(state.piles, pileId, count, vegasKlondikeRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as SoliAction);
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => dispatch({ type: "draw" } as SoliAction), [dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const dollar = state.score >= 0 ? `+$${state.score}` : `-$${-state.score}`;

  return (
    <div className="vegas-klondike">
      <div className="vk-info">
        <span>Bankroll: {dollar}</span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {getPile("stock").cards.length}</span>
        <button className="vk-auto-btn" type="button" onClick={() => dispatch({ type: "auto-move-to-foundation" } as SoliAction)}>Auto-move</button>
      </div>
      <div className="vk-top-row">
        <div className="pile-wrapper vk-stock-wrapper" onClick={handleStockClick}>
          <Pile pile={getPile("stock")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("waste")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="vk-spacer" />
        {["f1", "f2", "f3", "f4"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
          </div>
        ))}
      </div>
      <div className="vk-tableau-row">
        {["t1", "t2", "t3", "t4", "t5", "t6", "t7"].map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
