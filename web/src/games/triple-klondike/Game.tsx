import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TripleKlondikeState, TripleKlondikeAction, TripleKlondikeSettings } from "./state.js";
import { tripleKlondikeRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Game.css";

const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9", "t10", "t11", "t12", "t13"];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"];

export function TripleKlondikeGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<TripleKlondikeState, TripleKlondikeSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as TripleKlondikeAction);
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
      const target = findAutoMove(state.piles, pileId, count, tripleKlondikeRuleset);
      if (target) dispatch({ type: "move", fromPile: pileId, toPile: target, count } as TripleKlondikeAction);
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as TripleKlondikeAction);
    } else {
      dispatch({ type: "draw" } as TripleKlondikeAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="tk">
      <div className="tk-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundation: {(() => {
          let total = 0;
          for (const id of FOUNDATION_IDS) total += getPile(id).cards.length;
          return `${total}/156`;
        })()}</span>
        <button className="tk-auto-btn" type="button" onClick={() => dispatch({ type: "auto-move-to-foundation" } as TripleKlondikeAction)}>Auto-move</button>
      </div>
      <div className="tk-top-row">
        <div className="pile-wrapper tk-stock-wrapper" onClick={handleStockClick}>
          <Pile pile={getPile("stock")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} />
        </div>
        <div className="pile-wrapper">
          <Pile pile={getPile("waste")} onCardDragStart={onDragStart} onDrop={(id) => onDrop(id, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
        </div>
        <div className="tk-spacer" />
        <div className="tk-foundations">
          {FOUNDATION_IDS.map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} />
            </div>
          ))}
        </div>
      </div>
      <div className="tk-tableau-row">
        {TABLEAU_IDS.map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile pile={getPile(id)} onCardDragStart={onDragStart} onDrop={(pid) => onDrop(pid, handleMove)} onDragOver={onDragOver} onCardClick={handleCardClick} />
          </div>
        ))}
      </div>
    </div>
  );
}
