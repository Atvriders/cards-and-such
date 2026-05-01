import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KenKenState, KenKenSettings } from "./state.js";
import { type KenKenAction, isTerminal } from "./state.js";
import "./Game.css";

export function KenKen({
  state,
  dispatch,
  onGameOver,
}: GameProps<KenKenState, KenKenSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, board, selected, won, errorCells } = state;
  const { size, cages } = puzzle;

  // Build cage membership map
  const cageOf = new Map<number, number>(); // cell idx -> cage idx
  const cageTopLeft = new Map<number, number>(); // cage idx -> topmost-leftmost cell
  cages.forEach((cage, ci) => {
    cage.cells.forEach((cell) => cageOf.set(cell, ci));
    const topLeft = cage.cells.reduce((best, c) => {
      const br = Math.floor(best / size), bc = best % size;
      const cr = Math.floor(c / size), cc = c % size;
      if (cr < br || (cr === br && cc < bc)) return c;
      return best;
    }, cage.cells[0]!);
    cageTopLeft.set(ci, topLeft);
  });

  // For each cell, determine which borders to thicken
  function getBorderClasses(idx: number): string {
    const r = Math.floor(idx / size);
    const c = idx % size;
    const ci = cageOf.get(idx)!;
    const classes: string[] = [];

    // Top border: thicken if neighbor above is in a different cage (or no neighbor)
    const above = r > 0 ? cageOf.get((r - 1) * size + c) : -1;
    if (above === undefined || above !== ci) classes.push("kenkenclay-cell-border-top");

    // Right border
    const right = c < size - 1 ? cageOf.get(r * size + (c + 1)) : -1;
    if (right === undefined || right !== ci) classes.push("kenkenclay-cell-border-right");

    // Bottom border
    const below = r < size - 1 ? cageOf.get((r + 1) * size + c) : -1;
    if (below === undefined || below !== ci) classes.push("kenkenclay-cell-border-bottom");

    // Left border
    const left = c > 0 ? cageOf.get(r * size + (c - 1)) : -1;
    if (left === undefined || left !== ci) classes.push("kenkenclay-cell-border-left");

    return classes.join(" ");
  }

  const handleDigit = useCallback(
    (d: number) => {
      if (won || selected === null) return;
      dispatch({ type: "enterDigit", digit: d } satisfies KenKenAction);
    },
    [won, selected, dispatch],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (won) return;
      const n = Number(e.key);
      if (n >= 1 && n <= size) handleDigit(n);
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        dispatch({ type: "clearCell" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [won, size, handleDigit, dispatch]);

  return (
    <div className="kenkenclay">
      <div className="kenkenclay-title">KenKen</div>
      <div className={`kenkenclay-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — fill 1–${size} in each row & column, satisfying cage targets`}
      </div>

      <div
        className="kenkenclay-grid"
        style={{ gridTemplateColumns: `repeat(${size}, 54px)`, gridTemplateRows: `repeat(${size}, 54px)` }}
      >
        {Array.from({ length: size * size }, (_, idx) => {
          const isSelected = selected === idx;
          const isError = errorCells.has(idx);
          const ci = cageOf.get(idx)!;
          const cage = cages[ci]!;
          const isTopLeft = cageTopLeft.get(ci) === idx;
          const val = board[idx]!;
          return (
            <div
              key={idx}
              className={[
                "kenkenclay-cell",
                isSelected ? "selected" : "",
                isError ? "error" : "",
                getBorderClasses(idx),
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => dispatch({ type: "selectCell", idx })}
            >
              {isTopLeft && (
                <span className="kenkenclay-cage-label">
                  {cage.target}{cage.op !== "=" ? cage.op : ""}
                </span>
              )}
              {val > 0 ? val : ""}
            </div>
          );
        })}
      </div>

      <div className="kenkenclay-numpad">
        {Array.from({ length: size }, (_, i) => i + 1).map((d) => (
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
