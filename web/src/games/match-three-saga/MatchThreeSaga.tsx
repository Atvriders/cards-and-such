import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MatchThreeSagaState, MatchThreeSagaAction, MatchThreeSagaSettings } from "./state.js";
import { isTerminal, COLS, ROWS, NUM_COLORS } from "./state.js";
import "./MatchThreeSaga.css";

const GEM_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];
const GEM_LABELS = ["♦", "●", "▲", "★", "■"];

export function MatchThreeSaga({
  state,
  dispatch,
  onGameOver,
}: GameProps<MatchThreeSagaState, MatchThreeSagaSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const progressPct = Math.min(100, (state.score / state.targetScore) * 100);

  return (
    <div className="mts-game">
      <div className="mts-header">
        <span>Level {state.level}/{state.maxLevels}</span>
        <span>Moves: {state.movesLeft}</span>
        <span>Score: {state.score}</span>
      </div>

      <div className="mts-progress-bar">
        <div className="mts-progress-fill" style={{ width: `${progressPct}%` }} />
        <span className="mts-progress-label">Target: {state.targetScore}</span>
      </div>

      <div className="mts-grid">
        {state.grid.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = state.selected?.[0] === r && state.selected?.[1] === c;
            const colorIdx = cell !== null ? Math.min(cell, NUM_COLORS - 1) : -1;
            return (
              <div
                key={`${r}-${c}`}
                className={`mts-cell${isSelected ? " mts-selected" : ""}${cell === null ? " mts-empty" : ""}`}
                style={cell !== null ? { background: GEM_COLORS[colorIdx]! } : {}}
                onClick={() => dispatch({ type: "select", row: r, col: c } as MatchThreeSagaAction)}
              >
                {cell !== null ? GEM_LABELS[colorIdx] : ""}
              </div>
            );
          })
        )}
      </div>

      <div className="mts-message">{state.message}</div>

      {state.over && (
        <div className="mts-over">
          {state.won ? "You Win!" : "Game Over!"} Final Score: {state.score}
        </div>
      )}
    </div>
  );
}
