import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VisualMemoryGridState } from "./state.js";
import { isTerminal } from "./state.js";
import type { visualMemoryGridSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./VisualMemoryGrid.css";

type VisualMemoryGridSettings = SettingsOf<typeof visualMemoryGridSettings>;

const SHOW_DURATION_MS = 1400;
const MAX_LIVES = 3;

export function VisualMemoryGrid({
  state,
  dispatch,
  onGameOver,
}: GameProps<VisualMemoryGridState, VisualMemoryGridSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  // Auto-hide pattern after show duration
  useEffect(() => {
    if (state.phase !== "show") return;
    timerRef.current = setTimeout(() => {
      dispatch({ type: "hide" });
    }, SHOW_DURATION_MS);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [state.round, state.phase, dispatch]);

  const showingPattern = state.phase === "show";
  const inRecall = state.phase === "recall";
  const selectedCount = state.selected.filter(Boolean).length;

  return (
    <div className="visual-memory-grid">
      <div className="vmg-info">
        <span>Round: <strong>{state.round}</strong></span>
        <span>Cells: <strong>{state.filledCount}</strong></span>
        <span>Score: <strong>{state.score}</strong></span>
        <span>
          Lives:{" "}
          <strong>
            {"❤️".repeat(state.lives)}{"🖤".repeat(MAX_LIVES - state.lives)}
          </strong>
        </span>
      </div>

      {state.phase === "feedback" && (
        <div className={`vmg-feedback ${state.lastCorrect ? "correct" : "wrong"}`}>
          {state.lastCorrect
            ? `Correct! Next: ${state.filledCount + 1} cells`
            : "Wrong pattern!"}
          <button className="vmg-next-btn" onClick={() => dispatch({ type: "next" })}>
            Next Round
          </button>
        </div>
      )}

      {terminal ? (
        <div className="vmg-ended">Game over! Score: {state.score}</div>
      ) : state.phase !== "feedback" ? (
        <>
          <div className="vmg-phase-label">
            {showingPattern ? "Memorize the pattern!" : "Recreate it — click the lit squares"}
          </div>
          <div
            className="vmg-grid"
            style={{ gridTemplateColumns: `repeat(${state.gridSize}, 64px)` }}
          >
            {state.pattern.map((lit, idx) => {
              const userSelected = state.selected[idx];
              let cls = "vmg-cell";
              if (showingPattern && lit) cls += " vmg-cell-lit";
              if (inRecall && userSelected) cls += " vmg-cell-selected";
              return (
                <div
                  key={idx}
                  className={cls}
                  onClick={() => {
                    if (inRecall) dispatch({ type: "toggle", index: idx });
                  }}
                />
              );
            })}
          </div>

          {inRecall && (
            <button
              className="vmg-submit-btn"
              disabled={selectedCount === 0}
              onClick={() => dispatch({ type: "submit" })}
            >
              Submit ({selectedCount}/{state.filledCount})
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
