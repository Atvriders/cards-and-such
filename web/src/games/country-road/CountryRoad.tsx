import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CountryRoadState, CountryRoadSettings, CountryRoadAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./CountryRoad.css";

const REGION_COLORS = [
  "#fce4ec","#f3e5f5","#e3f2fd","#e8f5e9","#fff8e1","#fbe9e7",
  "#e0f2f1","#ede7f6","#e8eaf6","#fff3e0",
];

export function CountryRoad({ state, dispatch, onGameOver }: GameProps<CountryRoadState, CountryRoadSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, road, won } = state;
  const { size, region, clues } = puzzle;

  // Build region clue display: first cell of each region shows the clue
  const regionFirstCell = new Map<number, number>();
  for (let i = 0; i < size * size; i++) {
    const r = region[i];
    if (r !== undefined && !regionFirstCell.has(r)) regionFirstCell.set(r, i);
  }

  return (
    <div className="country-road">
      <div className="country-road-title">Country Road</div>
      <div className={`country-road-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — click cells to mark the road path`}
      </div>

      <div className="country-road-grid" style={{ gridTemplateColumns: `repeat(${size}, 52px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const regionIdx = region[idx] ?? 0;
          const isRoad = road[idx];
          const isFirstCell = regionFirstCell.get(regionIdx) === idx;
          const clue = isFirstCell ? (clues[regionIdx] ?? null) : null;
          const bgColor = isRoad
            ? (won ? "#c8e6c9" : "#a5d6a7")
            : REGION_COLORS[regionIdx % REGION_COLORS.length];

          return (
            <div
              key={idx}
              className={`cr-cell${isRoad ? " road" : ""}${won ? " won-cell" : ""}`}
              style={{ backgroundColor: bgColor }}
              onClick={() => !won && dispatch({ type: "toggleCell", idx } satisfies CountryRoadAction)}
            >
              {clue !== null ? clue : ""}
            </div>
          );
        })}
      </div>

      <div className="country-road-btns">
        <button data-testid="hint-target-country-road-action" onClick={() => dispatch({ type: "reset" } satisfies CountryRoadAction)}>Reset</button>
      </div>
    </div>
  );
}
