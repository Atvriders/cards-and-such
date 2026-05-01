import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HitoriState, HitoriSettings } from "./state.js";
import { type HitoriAction, isTerminal, computeViolations } from "./state.js";
import "./Game.css";

export function Hitori({
  state,
  dispatch,
  onGameOver,
}: GameProps<HitoriState, HitoriSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, shaded, won } = state;
  const { size: N, grid } = puzzle;

  const violations = computeViolations(shaded, puzzle);

  return (
    <div className="hitorishadow">
      <div className="hitorishadow-title">Hitori</div>
      <div className={`hitorishadow-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — shade cells to remove duplicates`}
      </div>

      <div
        className="hitorishadow-grid"
        style={{ gridTemplateColumns: `repeat(${N}, 50px)` }}
      >
        {Array.from({ length: N * N }, (_, idx) => {
          const isShaded = shaded[idx];
          const hasViolation = violations.has(idx);
          return (
            <div
              key={idx}
              className={[
                "hitorishadow-cell",
                isShaded ? "shaded" : "unshaded",
                hasViolation ? "violation" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (won) return;
                dispatch({ type: "toggleShade", idx } satisfies HitoriAction);
              }}
            >
              {!isShaded ? grid[idx] : ""}
            </div>
          );
        })}
      </div>

      <div className="hitorishadow-legend">
        Click a cell to shade/unshade it. Shaded cells are black.
      </div>

      <div className="hitorishadow-btn-row">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
