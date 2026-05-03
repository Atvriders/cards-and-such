import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KropkiState, KropkiSettings } from "./state.js";
import type { KropkiAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Kropki.css";

const CELL = 48;

export function Kropki({ state, dispatch, onGameOver }: GameProps<KropkiState, KropkiSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const { puzzle, grid, won } = state;
  const { size, dots, givens } = puzzle;

  const givenSet = new Set(givens.map(([r, c]) => r * size + c));

  function isGiven(idx: number): boolean { return givenSet.has(idx); }

  function cycleValue(idx: number) {
    if (won || isGiven(idx)) return;
    const cur = grid[idx]!;
    const next = cur >= size ? 0 : cur + 1;
    dispatch({ type: "setCell", idx, value: next } satisfies KropkiAction);
  }

  // Check conflicts
  function isWrong(idx: number): boolean {
    const v = grid[idx];
    if (!v) return false;
    const r = Math.floor(idx / size);
    const c = idx % size;
    for (let i = 0; i < size; i++) {
      if (i !== c && grid[r * size + i] === v) return true;
      if (i !== r && grid[i * size + c] === v) return true;
    }
    return false;
  }

  // Find dot between two cells
  function getDot(idx1: number, idx2: number) {
    const r1 = Math.floor(idx1 / size), c1 = idx1 % size;
    const r2 = Math.floor(idx2 / size), c2 = idx2 % size;
    return dots.find(d =>
      (d.r1 === r1 && d.c1 === c1 && d.r2 === r2 && d.c2 === c2) ||
      (d.r1 === r2 && d.c1 === c2 && d.r2 === r1 && d.c2 === c1)
    );
  }

  return (
    <div className="kropki">
      <div className="kropki-title">Kropki</div>
      <div className={`kropki-status${won ? " win" : ""}`}>
        {won ? `Solved! Score: ${terminal?.score ?? 0}` : `Moves: ${state.moves} — fill in the Latin square`}
      </div>

      <div className="kropki-grid-wrap">
        <div className="kropki-grid" style={{ gridTemplateColumns: `repeat(${size}, ${CELL}px)` }}>
          {Array.from({ length: size * size }, (_, idx) => {
            const r = Math.floor(idx / size);
            const c = idx % size;
            const v = grid[idx]!;
            const given = isGiven(idx);
            const wrong = isWrong(idx);
            const rightDot = c + 1 < size ? getDot(idx, idx + 1) : null;
            const downDot = r + 1 < size ? getDot(idx, idx + size) : null;

            return (
              <div
                key={idx}
                className={`kropki-cell${given ? " given" : wrong ? " wrong" : ""}`}
                style={{ width: CELL, height: CELL }}
                onClick={() => cycleValue(idx)}
              >
                {v > 0 ? v : ""}
                {rightDot && (
                  <div className={`kropki-dot right ${rightDot.kind}`} />
                )}
                {downDot && (
                  <div className={`kropki-dot down ${downDot.kind}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="kropki-legend">
        <span>White dot = differ by 1</span>
        <span>Black dot = ratio 2:1</span>
        <span>Click cell to cycle value</span>
      </div>

      <div className="kropki-btns">
        <button data-testid="hint-target-kropki-action" onClick={() => dispatch({ type: "reset" })}>Reset</button>
      </div>
    </div>
  );
}
