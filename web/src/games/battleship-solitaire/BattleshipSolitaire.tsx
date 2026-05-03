import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BSState, BSSettings } from "./state.js";
import type { BSAction } from "./state.js";
import { isTerminal, computeRowCounts, computeColCounts } from "./state.js";
import "./BattleshipSolitaire.css";

export function BattleshipSolitaire({ state, dispatch, onGameOver }: GameProps<BSState, BSSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, marks, won } = state;
  const { size, rowClues, colClues } = puzzle;
  const rowCounts = computeRowCounts(size, marks);
  const colCounts = computeColCounts(size, marks);

  function handleClick(idx: number): void {
    if (won) return;
    const cur = marks[idx];
    if (puzzle.revealed[idx] !== null) return;
    // Cycle: null → ship → water → null
    const next = cur === null ? true : cur === true ? false : null;
    dispatch({ type: "mark", idx, value: next } satisfies BSAction);
  }

  return (
    <div className="bs">
      <div className="bs-title">Battleship Solitaire</div>
      <div className={`bs-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Mark ships (■) and water (~) to match row and column clues. Moves: ${state.moves}`}
      </div>

      <div>
        <div className="bs-col-clues">
          {colClues.map((clue, c) => (
            <div key={c} className="bs-col-clue" style={{ color: colCounts[c] === clue ? "#27ae60" : "#555" }}>
              {clue}
            </div>
          ))}
        </div>
        <div className="bs-row-area">
          <div className="bs-row-clues">
            {rowClues.map((clue, r) => (
              <div key={r} className="bs-row-clue" style={{ color: rowCounts[r] === clue ? "#27ae60" : "#555" }}>
                {clue}
              </div>
            ))}
          </div>
          <div className="bs-grid" style={{ gridTemplateColumns: `repeat(${size}, 40px)` }}>
            {Array.from({ length: size * size }, (_, idx) => {
              const isRevealed = puzzle.revealed[idx] !== null;
              const mark = marks[idx];
              const cls = [
                "bs-cell",
                mark === true ? "ship" : mark === false ? "water" : "",
                isRevealed ? "revealed" : "",
              ].filter(Boolean).join(" ");
              return (
                <div key={idx} className={cls} onClick={() => handleClick(idx)}>
                  {mark === true ? "■" : mark === false ? "~" : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bs-legend">Click to cycle: unmarked → ship (■) → water (~) → unmarked</div>

      <div className="bs-btns">
        <button data-testid="hint-target-battleship-solitaire-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
