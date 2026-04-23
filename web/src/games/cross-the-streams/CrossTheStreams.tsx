import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CTSState, CTSSettings } from "./state.js";
import type { CTSAction } from "./state.js";
import { isTerminal, rowsMatch, colsMatch } from "./state.js";
import "./CrossTheStreams.css";

export function CrossTheStreams({ state, dispatch, onGameOver }: GameProps<CTSState, CTSSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, marks, won } = state;
  const { rows, cols, rowClues, colClues } = puzzle;
  const rowMatched = rowsMatch(puzzle, marks);
  const colMatched = colsMatch(puzzle, marks);

  function handleClick(idx: number): void {
    if (won) return;
    // Cycle: null → filled → empty → null
    const cur = marks[idx];
    const next = cur === null ? true : cur === true ? false : null;
    dispatch({ type: "mark", idx, value: next } satisfies CTSAction);
  }

  return (
    <div className="cts">
      <div className="cts-title">Cross the Streams</div>
      <div className={`cts-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Fill cells to match the run-length clues. Moves: ${state.moves}`}
      </div>

      <div className="cts-outer">
        <div className="cts-col-header">
          {colClues.map((clue, c) => (
            <div key={c} className={`cts-col-clue${colMatched[c] ? " cts-clue-matched" : ""}`}>
              {clue[0] === 0 ? "0" : clue.map((n, i) => <div key={i}>{n}</div>)}
            </div>
          ))}
        </div>
        <div className="cts-row-area">
          <div className="cts-row-clues">
            {rowClues.map((clue, r) => (
              <div key={r} className={`cts-row-clue${rowMatched[r] ? " cts-clue-matched" : ""}`}>
                {clue[0] === 0 ? "0" : clue.join(" ")}
              </div>
            ))}
          </div>
          <div className="cts-grid" style={{ gridTemplateColumns: `repeat(${cols}, 36px)` }}>
            {Array.from({ length: rows * cols }, (_, idx) => {
              const mark = marks[idx];
              const cls = ["cts-cell", mark === true ? "filled" : mark === false ? "empty" : ""].filter(Boolean).join(" ");
              return (
                <div key={idx} className={cls} onClick={() => handleClick(idx)}>
                  {mark === false ? "×" : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cts-legend">Click to cycle: blank → filled (■) → empty (×) → blank. Row/col clues turn green when matched.</div>

      <div className="cts-btns">
        <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
