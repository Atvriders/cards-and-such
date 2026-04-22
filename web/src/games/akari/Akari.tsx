import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AkariState, AkariSettings } from "./state.js";
import type { AkariAction } from "./state.js";
import { isTerminal, computeIlluminated, computeConflicts } from "./state.js";
import "./Akari.css";

const CELL = 40;

export function Akari({ state, dispatch, onGameOver }: GameProps<AkariState, AkariSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, bulbs, won } = state;
  const { size, grid } = puzzle;
  const lit = computeIlluminated(puzzle, bulbs);
  const conflicts = computeConflicts(puzzle, bulbs);

  return (
    <div className="akari">
      <div className="akari-title">Akari (Light Up)</div>
      <div className={`akari-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — illuminate every white cell`}
      </div>

      <div className="akari-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const v = grid[idx];
          const isWall = v !== null;
          const hasBulb = bulbs[idx];
          const isLit = lit.has(idx);
          const isConflict = conflicts.has(idx);

          if (isWall) {
            return (
              <div key={idx} className="akari-cell wall" style={{ width: CELL, height: CELL }}>
                {v !== -1 ? <span>{v}</span> : null}
              </div>
            );
          }
          return (
            <div
              key={idx}
              className={["akari-cell", hasBulb ? (isConflict ? "bulb conflict" : "bulb") : isLit ? "lit" : ""].join(" ")}
              style={{ width: CELL, height: CELL }}
              onClick={() => !won && dispatch({ type: "toggleBulb", idx } satisfies AkariAction)}
            >
              {hasBulb ? "💡" : ""}
            </div>
          );
        })}
      </div>

      <div className="akari-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
