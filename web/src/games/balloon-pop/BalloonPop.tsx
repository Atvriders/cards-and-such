import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BalloonPopState, BalloonPopSettings } from "./state.js";
import { isTerminal, findGroup } from "./state.js";
import "./BalloonPop.css";

const BALLOON_COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6"];
const BALLOON_EMOJIS = ["🔴", "🔵", "🟢", "🟡", "🟣"];

export function BalloonPop({
  state,
  dispatch,
  onGameOver,
}: GameProps<BalloonPopState, BalloonPopSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function getCellClass(r: number, c: number): string {
    const cell = state.grid[r]?.[c];
    if (cell === null || cell === undefined) return "bp-cell empty";
    return `bp-cell color-${cell}`;
  }

  function handleClick(r: number, c: number): void {
    if (state.over) return;
    const cell = state.grid[r]?.[c];
    if (cell === null || cell === undefined) return;
    const group = findGroup(state.grid, r, c);
    if (group.length < 2) return;
    dispatch({ type: "pop", row: r, col: c });
  }

  return (
    <div className="bp-game fade-in">
      <div className="bp-title">Balloon Pop</div>

      <div className="bp-score pulse">Score: {state.score}</div>

      <div className="bp-grid">
        {Array.from({ length: 8 }, (_, r) => (
          <div key={r} className="bp-row">
            {Array.from({ length: 8 }, (_, c) => {
              const cell = state.grid[r]?.[c];
              const isEmpty = cell === null || cell === undefined;
              const group = !isEmpty && !state.over ? findGroup(state.grid, r, c) : [];
              const isPopable = group.length >= 2;
              return (
                <div
                  key={c}
                  className={`${getCellClass(r, c)} ${!isEmpty && isPopable ? "popable" : ""}`}
                  onClick={() => handleClick(r, c)}
                  title={!isEmpty ? `${group.length} balloon group` : ""}
                >
                  {!isEmpty ? BALLOON_EMOJIS[cell!] : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {state.over && (
        <div className="bp-game-over bounce-in">
          {state.grid.every((r) => r.every((c) => c === null)) ? "Board cleared! +500 bonus!" : "No moves left!"}<br />
          <span className="bp-final-score">Score: {terminal?.score}</span>
        </div>
      )}

      <div className="bp-hint">Click groups of 2+ same-color balloons to pop them</div>
    </div>
  );
}
