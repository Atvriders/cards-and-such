import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SlyFoxState, SlyFoxAction, SlyFoxSettings } from "./state.js";
import { slyFoxRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./SlyFox.css";

export function SlyFox({
  state,
  dispatch,
  onGameOver,
}: GameProps<SlyFoxState, SlyFoxSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as SlyFoxAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, _indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile || pile.cards.length === 0) return;
      const target = findAutoMove(state.piles, pileId, 1, slyFoxRuleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count: 1 } as SlyFoxAction);
      }
    },
    [state.piles, dispatch],
  );

  const handleStockClick = useCallback(() => {
    const stock = state.piles.find((p) => p.id === "stock");
    if (stock && stock.cards.length === 0 && state.redealsLeft > 0) {
      dispatch({ type: "redeal" } as SlyFoxAction);
    } else {
      dispatch({ type: "draw" } as SlyFoxAction);
    }
  }, [state.piles, state.redealsLeft, dispatch]);

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const stock = state.piles.find((p) => p.id === "stock")!;

  // 20 tableau piles in 5 rows × 4 cols
  const rows = [
    ["t1", "t2", "t3", "t4"],
    ["t5", "t6", "t7", "t8"],
    ["t9", "t10", "t11", "t12"],
    ["t13", "t14", "t15", "t16"],
    ["t17", "t18", "t19", "t20"],
  ];

  return (
    <div className="sly-fox">
      <div className="sly-fox-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {stock.cards.length}</span>
        <span>Redeals: {state.redealsLeft}</span>
      </div>

      <div className="sly-fox-main">
        <div className="sly-fox-tableau">
          {rows.map((row, ri) => (
            <div key={ri} className="sly-fox-row">
              {row.map((id) => (
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
          ))}
        </div>

        <div className="sly-fox-right">
          <div className="sly-fox-foundations">
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

          <div className="sly-fox-stock-area">
            <div className="pile-wrapper stock-wrapper" onClick={handleStockClick}>
              <Pile
                pile={getPile("stock")}
                onCardDragStart={onDragStart}
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
          </div>
        </div>
      </div>
    </div>
  );
}
