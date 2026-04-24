import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NurimisakiState, NurimisakiSettings, NurimisakiAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Nurimisaki.css";

export function Nurimisaki({ state, dispatch, onGameOver }: GameProps<NurimisakiState, NurimisakiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, cells, won } = state;
  const { size, clues } = puzzle;

  return (
    <div className="nurimisaki">
      <div className="nurimisaki-title">Nurimisaki</div>
      <div className={`nurimisaki-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — shade black; circles mark peninsula endpoints`}
      </div>

      <div className="nurimisaki-grid" style={{ gridTemplateColumns: `repeat(${size}, 52px)` }}>
        {Array.from({ length: size * size }, (_, idx) => {
          const clue = clues[idx] ?? null;
          const cellState = cells[idx];
          const classes = [
            "nm-cell",
            cellState === 1 ? "white" : cellState === 2 ? "black" : "",
            clue !== null ? "clue" : "",
          ].filter(Boolean).join(" ");

          return (
            <div
              key={idx}
              className={classes}
              onClick={() => !won && dispatch({ type: "toggleCell", idx } satisfies NurimisakiAction)}
            >
              {clue !== null && clue > 0 ? clue : ""}
              {clue !== null && clue === 0 ? "●" : ""}
            </div>
          );
        })}
      </div>

      <div className="nurimisaki-btns">
        <button onClick={() => dispatch({ type: "reset" } satisfies NurimisakiAction)}>Reset</button>
      </div>
    </div>
  );
}
