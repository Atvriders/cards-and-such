import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MosaicState, MosaicSettings, MosaicAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Mosaic.css";

export function Mosaic({ state, dispatch, onGameOver }: GameProps<MosaicState, MosaicSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, cells, won } = state;
  const { size, clues } = puzzle;

  return (
    <div className="mosaic">
      <div className="mosaic-title">Mosaic</div>
      <div className={`mosaic-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — click cells to cycle unknown / white / black`}
      </div>

      <div className="mosaic-grid" style={{ gridTemplateColumns: `repeat(${size}, 52px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const r = Math.floor(idx / size);
          const c = idx % size;
          const clue = clues[r * size + c];
          const cellState = cells[idx];
          const classes = [
            "mosaic-cell",
            cellState === 1 ? "white" : cellState === 2 ? "black" : "",
            clue !== null ? "clue" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={idx}
              className={classes}
              onClick={() => !won && dispatch({ type: "toggleCell", idx } satisfies MosaicAction)}
            >
              {clue !== null ? clue : ""}
            </div>
          );
        })}
      </div>

      <div className="mosaic-legend">Click: unknown → white → black → unknown</div>

      <div className="mosaic-btns">
        <button data-testid="hint-target-mosaic-puzzle-action" onClick={() => dispatch({ type: "reset" } satisfies MosaicAction)}>Reset</button>
      </div>
    </div>
  );
}
