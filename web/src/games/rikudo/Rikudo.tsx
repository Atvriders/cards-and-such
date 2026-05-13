import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RikudoState, RikudoSettings } from "./state.js";
import type { RikudoAction } from "./state.js";
import { isTerminal, computeErrors } from "./state.js";
import "./Rikudo.css";

export function Rikudo({ state, dispatch, onGameOver }: GameProps<RikudoState, RikudoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, values, selected, won } = state;
  const { rows, cols, n } = puzzle;
  const errors = computeErrors(puzzle, values);

  const cols4Numpad = Math.min(n, 8);
  const numpadRows = Math.ceil(n / cols4Numpad);

  return (
    <div className="rikudo fade-in">
      <div className="rikudo-title">Rikudo</div>
      <div className={`rikudo-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Fill 1–${n} so consecutive numbers touch. Moves: ${state.moves}`}
      </div>

      <div className="rikudo-grid" style={{ gridTemplateColumns: `repeat(${cols}, 44px)` }}>
        {Array.from({ length: rows * cols }, (_, idx) => {
          const isClue = puzzle.clues[idx]! > 0;
          const val = values[idx]!;
          const isSel = selected === idx;
          const isErr = errors.has(idx);
          const cls = [
            "rikudo-cell",
            isClue ? "clue" : val > 0 ? "filled" : "",
            isSel ? "selected" : "",
            isErr ? "error" : "",
          ].filter(Boolean).join(" ");
          return (
            <div
              key={idx}
              className={cls}
              onClick={() => !won && dispatch({ type: "selectCell", idx } satisfies RikudoAction)}
            >
              {val > 0 ? val : ""}
            </div>
          );
        })}
      </div>

      {!won && (
        <div
          className="rikudo-numpad"
          style={{ gridTemplateColumns: `repeat(${cols4Numpad}, 40px)`, display: "grid" }}
        >
          {Array.from({ length: n }, (_, i) => i + 1).map(v => (
            <button
              key={v}
              onClick={() => dispatch({ type: "enterValue", value: v } satisfies RikudoAction)}
            >
              {v}
            </button>
          ))}
          <button
            className="clear-btn"
            style={{ gridColumn: `1 / span ${cols4Numpad}` }}
            onClick={() => selected !== null && dispatch({ type: "clearCell", idx: selected } satisfies RikudoAction)}
          >
            Clear
          </button>
        </div>
      )}

      <div className="rikudo-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
