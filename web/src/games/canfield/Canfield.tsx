import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CanfieldState, CanfieldAction, CanfieldSettings } from "./state.js";
import { makeRulesetPublic } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Canfield.css";

const RANK_LABELS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export function Canfield({
  state,
  dispatch,
  onGameOver,
}: GameProps<CanfieldState, CanfieldSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();
  const ruleset = makeRulesetPublic(state.foundationStartRank);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as CanfieldAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount =
        pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, ruleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as CanfieldAction);
      }
    },
    [state.piles, dispatch, ruleset],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    const waste = state.piles.find((p) => p.id === "waste");
    if (stock && stock.cards.length === 0 && waste && waste.cards.length > 0) {
      dispatch({ type: "recycle" } as CanfieldAction);
    } else {
      dispatch({ type: "draw" } as CanfieldAction);
    }
  }, [state.piles, dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  return (
    <div className="canfield">
      <div className="canfield-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Foundations start: {RANK_LABELS[state.foundationStartRank]}</span>
      </div>

      <div className="canfield-top-row">
        <div className="pile-wrapper reserve-wrapper" title="Reserve (top card playable)">
          <Pile
            pile={getPile("reserve")}
            onCardDragStart={onDragStart}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>

        <div className="pile-wrapper stock-wrapper" onClick={handleStockClick} title="Stock — click to draw 3">
          <Pile
            pile={getPile("stock")}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
          />
        </div>

        <div className="pile-wrapper">
          <Pile
            pile={getPile("waste")}
            onCardDragStart={onDragStart}
            onDrop={(pileId) => onDrop(pileId, handleMove)}
            onDragOver={onDragOver}
            onCardClick={handleCardClick}
          />
        </div>

        <div className="canfield-spacer" />

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

      <div className="canfield-tableau-row">
        {["t1", "t2", "t3", "t4"].map((id) => (
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
