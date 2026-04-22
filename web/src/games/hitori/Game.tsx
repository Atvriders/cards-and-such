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
    <div className="hitori">
      <div className="hitori-title">Hitori</div>
      <div className={`hitori-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — shade cells to remove duplicates`}
      </div>

      <div
        className="hitori-grid"
        style={{ gridTemplateColumns: `repeat(${N}, 50px)` }}
      >
        {Array.from({ length: N * N }, (_, idx) => {
          const isShaded = shaded[idx];
          const hasViolation = violations.has(idx);
          return (
            <div
              key={idx}
              className={[
                "hitori-cell",
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

      <div className="hitori-legend">
        Click a cell to shade/unshade it. Shaded cells are black.
      </div>

      <div className="hitori-btn-row">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
