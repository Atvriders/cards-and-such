import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FloodItState, FloodItSettings } from "./state.js";
import { isTerminal, SIZE } from "./state.js";
import "./FloodIt.css";

const COLORS = ["#e74c3c", "#3498db", "#2ecc71", "#f39c12", "#9b59b6", "#1abc9c"];

export function FloodIt({ state, dispatch }: GameProps<FloodItState, FloodItSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const currentColor = state.grid[0]![0]!;

  return (
    <div className="floodit-game">
      <div className="floodit-header">
        <span>Moves: {state.moves} / {state.maxMoves}</span>
      </div>

      <div
        className="floodit-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 34px)` }}
      >
        {state.grid.map((row, r) =>
          row.map((color, c) => (
            <div
              key={`${r},${c}`}
              className={`floodit-cell${r === 0 && c === 0 ? " floodit-cell--flooded" : ""}`}
              style={{ background: COLORS[color % COLORS.length] }}
            />
          ))
        )}
      </div>

      <div className="floodit-palette">
        {Array.from({ length: state.numColors }, (_, i) => (
          <button
            key={i}
            className={`floodit-btn${i === currentColor ? " floodit-btn--active" : ""}`}
            style={{ background: COLORS[i % COLORS.length] }}
            onClick={() => !state.over && dispatch({ type: "flood", color: i })}
            disabled={state.over}
          />
        ))}
      </div>

      {terminal && (
        <div className="floodit-overlay">
          <h2>{state.won ? "Flooded!" : "Out of Moves"}</h2>
          <p>Score: {terminal.score}</p>
        </div>
      )}
    </div>
  );
}
