import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SkyscrapersState, SkyscrapersSettings } from "./state.js";
import { type SkyscrapersAction, isTerminal } from "./state.js";
import "./Game.css";

const CELL = 50;

export function Skyscrapers({
  state,
  dispatch,
  onGameOver,
}: GameProps<SkyscrapersState, SkyscrapersSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, board, selected, won, errorCells } = state;
  const { size: N, topClues, bottomClues, leftClues, rightClues } = puzzle;

  const handleDigit = useCallback(
    (d: number) => {
      if (won || selected === null) return;
      dispatch({ type: "enterDigit", digit: d } satisfies SkyscrapersAction);
    },
    [won, selected, dispatch],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (won) return;
      const n = Number(e.key);
      if (n >= 1 && n <= N) handleDigit(n);
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        dispatch({ type: "clearCell" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [won, N, handleDigit, dispatch]);

  // Grid: (N+2) × (N+2), with clues on edges
  const total = N + 2;

  function renderCell(row: number, col: number) {
    const key = `${row}-${col}`;
    const isTopClue = row === 0 && col >= 1 && col <= N;
    const isBottomClue = row === N + 1 && col >= 1 && col <= N;
    const isLeftClue = col === 0 && row >= 1 && row <= N;
    const isRightClue = col === N + 1 && row >= 1 && row <= N;
    const isCorner = (row === 0 || row === N + 1) && (col === 0 || col === N + 1);

    if (isCorner) {
      return (
        <div key={key} className="skyscrapersdeco-cell empty-clue" style={{ width: CELL, height: CELL }} />
      );
    }
    if (isTopClue) {
      const c = col - 1;
      return (
        <div key={key} className="skyscrapersdeco-clue" style={{ width: CELL, height: CELL }}>
          {topClues[c] || ""}
        </div>
      );
    }
    if (isBottomClue) {
      const c = col - 1;
      return (
        <div key={key} className="skyscrapersdeco-clue" style={{ width: CELL, height: CELL }}>
          {bottomClues[c] || ""}
        </div>
      );
    }
    if (isLeftClue) {
      const r = row - 1;
      return (
        <div key={key} className="skyscrapersdeco-clue" style={{ width: CELL, height: CELL }}>
          {leftClues[r] || ""}
        </div>
      );
    }
    if (isRightClue) {
      const r = row - 1;
      return (
        <div key={key} className="skyscrapersdeco-clue" style={{ width: CELL, height: CELL }}>
          {rightClues[r] || ""}
        </div>
      );
    }

    // Interior cell
    const r = row - 1;
    const c = col - 1;
    const idx = r * N + c;
    const val = board[idx]!;
    const isSelected = selected === idx;
    const isError = errorCells.has(idx);

    return (
      <div
        key={key}
        className={[
          "skyscrapersdeco-cell",
          isSelected ? "selected" : "",
          isError ? "error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ width: CELL, height: CELL }}
        onClick={() => dispatch({ type: "selectCell", idx })}
      >
        {val > 0 ? val : ""}
      </div>
    );
  }

  return (
    <div className="skyscrapers">
      <div className="skyscrapers-title">Skyscrapers</div>
      <div className={`skyscrapers-status${won ? " win" : ""}`}>
        {won
          ? `Solved! Score: ${terminal?.score ?? 0}`
          : `Moves: ${state.moves} — fill heights 1–${N}; clues show visible buildings from that edge`}
      </div>

      <div
        className="skyscrapersdeco-wrap"
        style={{
          gridTemplateColumns: `repeat(${total}, ${CELL}px)`,
          gridTemplateRows: `repeat(${total}, ${CELL}px)`,
          display: "inline-grid",
        }}
      >
        {Array.from({ length: total * total }, (_, k) => {
          const row = Math.floor(k / total);
          const col = k % total;
          return renderCell(row, col);
        })}
      </div>

      <div className="skyscrapers-numpad">
        {Array.from({ length: N }, (_, i) => i + 1).map((d) => (
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
