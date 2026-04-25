import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TubeColorState, TubeColorSettings, TubeColorAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./TubeColor.css";

const COLORS = [
  "#e74c3c", // 1 red
  "#3498db", // 2 blue
  "#2ecc71", // 3 green
  "#f39c12", // 4 orange
  "#9b59b6", // 5 purple
  "#1abc9c", // 6 teal
  "#e67e22", // 7 dark orange
  "#95a5a6", // 8 gray
];

function isTubeComplete(tube: readonly number[]): boolean {
  if (tube.length !== 4) return false;
  return tube.every(c => c === tube[0]);
}

export function TubeColor({
  state,
  dispatch,
  onGameOver,
}: GameProps<TubeColorState, TubeColorSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  function handleSelect(i: number) {
    if (state.won) return;
    dispatch({ type: "select", tube: i } as TubeColorAction);
  }

  return (
    <div className="tube-color">
      <div className="tube-color-info">
        <span>Pours: {state.moves}</span>
        <span>Sort all colors into single tubes</span>
      </div>

      <div className={`tube-color-status${state.won ? " win" : ""}`}>
        {state.won ? "All sorted! Puzzle complete!" : "Select a tube then select where to pour"}
      </div>

      <div className="tube-color-rack">
        {state.tubes.map((tube, i) => {
          const complete = isTubeComplete(tube);
          const selected = state.selectedTube === i;
          return (
            <div key={i} className="tube-wrapper" onClick={() => handleSelect(i)}>
              <div className={`tube ${selected ? "selected" : ""} ${complete ? "complete" : ""}`}>
                {tube.map((color, j) => (
                  <div
                    key={j}
                    className="tube-segment"
                    style={{ background: COLORS[(color - 1) % COLORS.length] }}
                  />
                ))}
              </div>
              <span className="tube-label">{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
