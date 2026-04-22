import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NurikabeState, NurikabeSettings } from "./state.js";
import { type NurikabeAction, isTerminal } from "./state.js";
import "./Game.css";

export function Nurikabe({
  state,
  dispatch,
  onGameOver,
}: GameProps<NurikabeState, NurikabeSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, cells, won } = state;
  const { rows, cols } = puzzle;

  return (
    <div className="nurikabe">
      <div className="nurikabe-title">Nurikabe</div>
      <div className={`nurikabe-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — shade the sea cells`}
      </div>
      <div
        className="nurikabe-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 44px)` }}
      >
        {cells.map((cell, i) => {
          const clue = puzzle.clues[i] ?? 0;
          const hasClue = clue > 0;
          const classes = [
            "nurikabe-cell",
            cell,
            hasClue ? "clue" : "",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <div
              key={i}
              className={classes}
              onClick={() => dispatch({ type: "toggleCell", idx: i } satisfies NurikabeAction)}
              data-testid={`cell-${i}`}
            >
              {hasClue ? clue : cell === "shaded" ? "■" : ""}
            </div>
          );
        })}
      </div>
      <div className="nurikabe-hint">
        Click cells to cycle: unknown → shaded (sea) → unshaded (island). Numbered cells are island roots.
      </div>
    </div>
  );
}
