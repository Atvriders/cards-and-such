import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TimeTrialState, TimeTrialSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function TimeTrialGame({ state, dispatch, onGameOver }: GameProps<TimeTrialState, TimeTrialSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.gameOver;
  const gate = state.gates[state.currentGate];

  return (
    <div className="time-trial">
      <div className="tt-header">
        <span>Gate: {Math.min(state.currentGate + 1, state.gates.length)}/{state.gates.length}</span>
        <span>Score: {state.score}</span>
        <span>Penalties: {state.penalties}</span>
      </div>

      <div className="tt-track">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`tt-lane ${i === state.carPosition ? "car" : ""} ${gate && i === gate.position ? "gate" : ""}`}
          >
            {i === state.carPosition && "🏎"}
            {gate && i === gate.position && i !== state.carPosition && "|"}
          </div>
        ))}
      </div>

      {gate && (
        <div className="tt-gate-info">Gate at lane {gate.position + 1} — You at lane {state.carPosition + 1}</div>
      )}

      <div className="tt-message">{state.message}</div>

      <div className="tt-history">
        {state.gates.map((g, i) => (
          <span key={i} className={`tt-gate-dot ${g.status}`} title={`Gate ${i + 1}`} />
        ))}
      </div>

      {!isOver && (
        <div className="tt-controls">
          <button onClick={() => dispatch({ type: "moveLeft" })}>Left</button>
          <button onClick={() => dispatch({ type: "pass" })}>Pass Gate</button>
          <button onClick={() => dispatch({ type: "moveRight" })}>Right</button>
        </div>
      )}

      {isOver && (
        <div className="tt-gameover">
          Time trial complete! Score: {terminal ? terminal.score : state.score}
        </div>
      )}

      <button className="tt-restart" onClick={() => dispatch({ type: "restart" })}>New Trial</button>
    </div>
  );
}
