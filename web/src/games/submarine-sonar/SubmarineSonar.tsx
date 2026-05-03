import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SubmarineSonarState, SubmarineSonarSettings } from "./state.js";
import { reducer, isTerminal } from "./state.js";
import "./SubmarineSonar.css";

export function SubmarineSonar({ state, dispatch, onGameOver }: GameProps<SubmarineSonarState, SubmarineSonarSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const cellIcons: Record<string, string> = {
    unknown: "",
    miss: "〰",
    hit: "💥",
    sunk: "🚢",
  };

  return (
    <div className="submarine-sonar">
      <div className="submarine-sonar-hud">
        <span>Pings: {state.pings}</span>
        <span>Hits: {state.hitsFound}/{state.subLength}</span>
      </div>
      <div
        className="submarine-sonar-grid"
        style={{ gridTemplateColumns: `repeat(${state.size}, 44px)` }}
      >
        {state.grid.map((cell, i) => (
          <div data-testid="hint-target-submarine-sonar-action"
            key={i}
            className={`submarine-sonar-cell ${cell}`}
            onClick={() => dispatch({ type: "ping", cell: i })}
          >
            {cellIcons[cell]}
          </div>
        ))}
      </div>
      {state.won && (
        <div className="submarine-sonar-status">
          Submarine sunk in {state.pings} pings! Score: {terminal?.score}
        </div>
      )}
      <div className="submarine-sonar-hint">
        Click cells to send sonar pings. Find and sink the hidden submarine.
      </div>
      {state.gameOver && (
        <button onClick={() => dispatch({ type: "restart" })}>Play Again</button>
      )}
    </div>
  );
}
