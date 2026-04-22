import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StarBattleState, StarBattleAction, StarBattleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./StarBattle.css";

export function StarBattle({
  state,
  dispatch,
  onGameOver,
}: GameProps<StarBattleState, StarBattleSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleCell = useCallback(
    (index: number) => {
      if (terminal) return;
      dispatch({ type: "toggle", index } as StarBattleAction);
    },
    [dispatch, terminal],
  );

  const { puzzle, marks, errorCells } = state;
  const n = puzzle.n;
  const errorSet = new Set(errorCells);
  const starsPlaced = marks.filter((v) => v === 1).length;

  return (
    <div className="star-battle">
      <div className="star-battle-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Stars: {starsPlaced}/{puzzle.stars * n}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      {terminal && (
        <div className="star-battle-game-over">Solved! Score: {terminal.score}</div>
      )}

      <div
        className="star-battle-grid"
        style={{ gridTemplateColumns: `repeat(${n}, 44px)` }}
      >
        {marks.map((val, idx) => {
          const row = Math.floor(idx / n);
          const col = idx % n;
          const region = puzzle.regions[idx]!;
          const isError = errorSet.has(idx);

          // Compute region borders
          const rightRegion = col < n - 1 ? puzzle.regions[idx + 1] : -1;
          const bottomRegion = row < n - 1 ? puzzle.regions[idx + n] : -1;
          const borderRight = rightRegion !== region ? " region-border-right" : "";
          const borderBottom = bottomRegion !== region ? " region-border-bottom" : "";

          const markClass = val === 1 ? " has-star" : val === 2 ? " has-dot" : "";
          const errorClass = isError ? " error" : "";

          return (
            <div
              key={idx}
              className={`star-battle-cell reg-${region}${markClass}${errorClass}${borderRight}${borderBottom}`}
              onClick={() => handleCell(idx)}
              title={`Row ${row + 1}, Col ${col + 1}, Region ${region + 1}`}
            >
              {val === 1 ? "★" : val === 2 ? "·" : ""}
            </div>
          );
        })}
      </div>

      <div className="star-battle-legend">
        Click once: ★ (star) | Click twice: · (eliminated) | Click thrice: clear<br />
        {puzzle.stars} star{puzzle.stars > 1 ? "s" : ""} per row, column, and region. No two stars may touch (even diagonally).
      </div>
    </div>
  );
}
