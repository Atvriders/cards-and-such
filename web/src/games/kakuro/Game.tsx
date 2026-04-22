import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KakuroState, KakuroSettings } from "./state.js";
import { type KakuroAction, isTerminal } from "./state.js";
import "./Game.css";

export function Kakuro({
  state,
  dispatch,
  onGameOver,
}: GameProps<KakuroState, KakuroSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, board, selected, won, errorCells } = state;
  const { rows, cols, cells } = puzzle;

  const handleCellClick = useCallback(
    (idx: number) => {
      if (won) return;
      dispatch({ type: "selectCell", idx } satisfies KakuroAction);
    },
    [won, dispatch],
  );

  const handleDigit = useCallback(
    (d: number) => {
      if (won || selected === null) return;
      dispatch({ type: "enterDigit", digit: d } satisfies KakuroAction);
    },
    [won, selected, dispatch],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (won) return;
      if (e.key >= "1" && e.key <= "9") handleDigit(Number(e.key));
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        dispatch({ type: "clearCell" } satisfies KakuroAction);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [won, handleDigit, dispatch]);

  return (
    <div className="kakuro">
      <div className="kakuro-title">Kakuro</div>
      <div className={`kakuro-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — fill digits 1–9 so each run sums to its clue`}
      </div>

      <div
        className="kakuro-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, 48px)`, gridTemplateRows: `repeat(${rows}, 48px)` }}
      >
        {cells.map((cell, idx) => {
          if (cell.isBlack) {
            return (
              <div key={idx} className="kakuro-cell black">
                <div className="kakuro-clue-wrap">
                  {cell.downClue > 0 && <span className="kakuro-clue-down">{cell.downClue}</span>}
                  {cell.acrossClue > 0 && <span className="kakuro-clue-across">{cell.acrossClue}</span>}
                </div>
              </div>
            );
          }
          const isSelected = selected === idx;
          const isError = errorCells.has(idx);
          const val = board[idx]!;
          return (
            <div
              key={idx}
              className={[
                "kakuro-cell white",
                isSelected ? "selected" : "",
                isError ? "error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleCellClick(idx)}
            >
              {val > 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="kakuro-numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} onClick={() => handleDigit(d)}>
            {d}
          </button>
        ))}
        <button className="clear" onClick={() => dispatch({ type: "clearCell" })}>
          Clear
        </button>
      </div>
    </div>
  );
}
