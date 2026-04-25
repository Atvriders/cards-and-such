import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EinsteinState, EinsteinSettings, CellMark } from "./state.js";
import { type EinsteinAction, isTerminal } from "./state.js";
import "./Game.css";

const MARK_LABELS: Record<string, string> = {
  "true": "✓",
  "false": "✗",
  "null": "·",
};

function nextMark(m: CellMark): CellMark {
  if (m === null) return true;
  if (m === true) return false;
  return null;
}

export function EinsteinPuzzleGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<EinsteinState, EinsteinSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const { puzzle, marks, won } = state;
  const n = 5;

  function handleCell(cat: number, pos: number, val: number) {
    if (won) return;
    const cur = marks[cat]![pos]![val]!;
    dispatch({ type: "setMark", cat, pos, val, mark: nextMark(cur) } satisfies EinsteinAction);
  }

  return (
    <div className="einstein">
      <div className="einstein-title">{puzzle.title}</div>
      {won && (
        <div className="einstein-won">Solved! Score: {terminal?.score}</div>
      )}
      <div className="einstein-layout">
        <div className="einstein-grid-wrap">
          {puzzle.categories.map((cat, ci) => (
            <div className="einstein-section" key={ci}>
              <div className="einstein-cat-label">{cat}</div>
              <div className="einstein-grid">
                <div className="einstein-header-row">
                  <div className="einstein-corner" />
                  {Array.from({ length: n }, (_, p) => (
                    <div className="einstein-col-head" key={p}>#{p + 1}</div>
                  ))}
                </div>
                {puzzle.values[ci]!.map((val, vi) => (
                  <div className="einstein-row" key={vi}>
                    <div className="einstein-row-head">{val}</div>
                    {Array.from({ length: n }, (_, p) => {
                      const mark = marks[ci]![p]![vi];
                      const cls = mark === true ? "cell-yes" : mark === false ? "cell-no" : "cell-empty";
                      return (
                        <button
                          key={p}
                          className={`einstein-cell ${cls}`}
                          onClick={() => handleCell(ci, p, vi)}
                          aria-label={`${cat} pos ${p + 1} value ${val}: ${MARK_LABELS[String(mark)]}`}
                        >
                          {MARK_LABELS[String(mark)]}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="einstein-clues">
          <div className="einstein-clues-title">Clues</div>
          <ol className="einstein-clue-list">
            {puzzle.clues.map((clue, i) => (
              <li key={i}>{clue}</li>
            ))}
          </ol>
          <button
            className="einstein-reset-btn"
            onClick={() => dispatch({ type: "reset" } satisfies EinsteinAction)}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
