import { useEffect, useCallback, useMemo } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KillerSudokuState, KillerSudokuAction, KillerSudokuSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./KillerSudoku.css";

export function KillerSudoku({
  state,
  dispatch,
  onGameOver,
}: GameProps<KillerSudokuState, KillerSudokuSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const handleCell = useCallback(
    (idx: number) => {
      if (terminal) return;
      dispatch({ type: "select", index: state.selected === idx ? null : idx } as KillerSudokuAction);
    },
    [dispatch, state.selected, terminal],
  );

  const handleDigit = useCallback(
    (d: number) => {
      if (terminal) return;
      dispatch({ type: "enter", digit: d } as KillerSudokuAction);
    },
    [dispatch, terminal],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (terminal) return;
      if (e.key >= "1" && e.key <= "9") handleDigit(Number(e.key));
      else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") handleDigit(0);
    },
    [handleDigit, terminal],
  );

  // Build cage-top-left map: index -> cage label (sum)
  const cageLabelMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const cage of state.puzzle.cages) {
      // top-left cell of cage = min index
      const indices = cage.cells.map(([r, c]) => r * 9 + c);
      const topLeft = Math.min(...indices);
      m.set(topLeft, cage.sum);
    }
    return m;
  }, [state.puzzle]);

  const errorSet = new Set(state.errorCells);
  const highlightSet = new Set<number>();
  if (state.selected !== null) {
    const r = Math.floor(state.selected / 9);
    const c = state.selected % 9;
    for (let i = 0; i < 9; i++) {
      highlightSet.add(r * 9 + i);
      highlightSet.add(i * 9 + c);
    }
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let dr = 0; dr < 3; dr++)
      for (let dc = 0; dc < 3; dc++)
        highlightSet.add((br + dr) * 9 + (bc + dc));
  }

  return (
    <div className="killer-sudoku" tabIndex={0} onKeyDown={handleKey}>
      <div className="killer-sudoku-info">
        <span>Difficulty: {state.settings.difficulty}</span>
        <span>Moves: {state.movesMade}</span>
      </div>

      {terminal && (
        <div className="killer-sudoku-game-over">
          Solved! Score: {terminal.score}
        </div>
      )}

      <div className="killer-sudoku-grid">
        {Array.from({ length: 81 }, (_, idx) => {
          const row = Math.floor(idx / 9);
          const col = idx % 9;
          const val = state.current[idx]!;
          const isSelected = state.selected === idx;
          const isError = errorSet.has(idx);
          const isHighlight = highlightSet.has(idx) && !isSelected;
          const cageLabel = cageLabelMap.get(idx);

          let cls = "killer-sudoku-cell";
          if (isSelected) cls += " selected";
          else if (isError) cls += " error";
          else if (isHighlight) cls += " highlight";

          return (
            <div
              key={idx}
              className={cls}
              data-row={row}
              data-col={col}
              onClick={() => handleCell(idx)}
            >
              {cageLabel !== undefined && <span className="cage-sum">{cageLabel}</span>}
              {val !== 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="killer-sudoku-numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <button key={d} onClick={() => handleDigit(d)} disabled={!!terminal}>{d}</button>
        ))}
        <button className="erase" onClick={() => handleDigit(0)} disabled={!!terminal}>✕</button>
      </div>
    </div>
  );
}
