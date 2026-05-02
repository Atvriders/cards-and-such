import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MonteCarloState, MonteCarloAction, MonteCarloSettings } from "./state.js";
import { isRed, rankLabel } from "../../engines/deck/index.js";
import "./MonteCarlo.css";

export function MonteCarlo({
  state,
  dispatch,
  onGameOver,
}: GameProps<MonteCarloState, MonteCarloSettings>): JSX.Element {
  const [selected, setSelected] = useState<number | null>(null);

  const handleCellClick = useCallback(
    (pos: number) => {
      const card = state.grid[pos];
      if (!card) return;

      if (selected === null) {
        setSelected(pos);
      } else if (selected === pos) {
        setSelected(null);
      } else {
        dispatch({ type: "select-pair", pos1: selected, pos2: pos } as MonteCarloAction);
        setSelected(null);
      }
    },
    [selected, state.grid, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const cardsInGrid = state.grid.filter((c) => c !== null).length;

  return (
    <div className="monte-carlo">
      <div className="monte-carlo-info">
        <span>Pairs removed: {state.score / 2}</span>
        <span>Score: {state.score}</span>
        <span>Stock: {state.stock.length}</span>
        <span>Grid cards: {cardsInGrid}</span>
      </div>

      <div className="monte-carlo-grid">
        {state.grid.map((card, pos) => {
          if (!card) {
            return <div key={pos} className="monte-carlo-cell empty" />;
          }
          const isSelected = selected === pos;
          const colorClass = isRed(card.suit) ? "red" : "black";
          return (
            <div
              key={pos}
              className={`monte-carlo-cell ${colorClass}${isSelected ? " selected" : ""}`}
              data-testid={`hint-target-monte-carlo-${pos}`}
              onClick={() => handleCellClick(pos)}
              title={`${rankLabel(card.rank)}${card.suit} — click to select`}
            >
              <div className="mc-card-label">
                <div className="mc-rank">{rankLabel(card.rank)}</div>
                <div className="mc-suit">{card.suit}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="monte-carlo-stock">
        <span>Remaining in stock: {state.stock.length} cards</span>
        {selected !== null && <span>Selected: position {selected + 1} — click another card to pair it</span>}
      </div>
    </div>
  );
}
