import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SubmarineHuntState, SubmarineHuntAction, SubmarineSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SubmarineHunt.css";

const CELL_ICONS: Record<string, string> = {
  miss: "·",
  hit: "💥",
  sunk: "🚢",
};

export function SubmarineHunt({
  state,
  dispatch,
  onGameOver,
}: GameProps<SubmarineHuntState, SubmarineSettings>): JSX.Element {
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const terminal = isTerminal(state);
  const sunkenCount = state.subSunk.filter(Boolean).length;
  const accuracy = state.shots > 0 ? Math.round((state.hits / state.shots) * 100) : 0;

  return (
    <div className="sub-game fade-in">
      <div className="sub-header">
        <span>Sunk: {sunkenCount}/{state.submarines.length}</span>
        <span>Shots: {state.shots}</span>
        <span>Accuracy: {accuracy}%</span>
        <span>Score: {state.score}</span>
      </div>

      <div
        className="sub-grid"
        style={{ gridTemplateColumns: `repeat(${state.gridSize}, 38px)` }}
      >
        {state.grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r},${c}`}
              className={`sub-cell sub-cell--${cell}`}
              onClick={() =>
                !terminal && cell === "unknown"
                  ? dispatch({ type: "fire", row: r, col: c } as SubmarineHuntAction)
                  : undefined
              }
            >
              {CELL_ICONS[cell] ?? ""}
            </div>
          ))
        )}
      </div>

      {terminal ? (
        <div className="sub-overlay">
          <h2>All Submarines Sunk!</h2>
          <p>Score: {terminal.score} · {state.shots} shots · {accuracy}% accuracy</p>
        </div>
      ) : (
        <div className="sub-hint">Click to fire depth charges. Find and sink all submarines!</div>
      )}
    </div>
  );
}
