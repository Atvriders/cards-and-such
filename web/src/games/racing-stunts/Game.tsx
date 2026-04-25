import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RacingStuntsState, RacingStuntsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function RacingStuntsGame({ state, dispatch, onGameOver }: GameProps<RacingStuntsState, RacingStuntsSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const isOver = state.gameOver;
  const trackPct = Math.min(100, state.position);

  const resultColor = state.lastResult === "perfect" ? "#4caf50" :
                      state.lastResult === "good" ? "#ff9800" :
                      state.lastResult === "fail" ? "#f44336" : "#333";

  return (
    <div className="racing-stunts">
      <div className="rs-header">
        <span>Lap {Math.min(state.lap, state.totalLaps)}/{state.totalLaps}</span>
        <span>Score: {state.score}</span>
        <span>Speed: {state.speed}</span>
      </div>

      <div className="rs-track-container">
        <div className="rs-track">
          <div className="rs-car" style={{ left: `${trackPct}%` }}>🏎</div>
        </div>
        <div className="rs-track-markers">
          <span>Start</span>
          <span>Finish</span>
        </div>
      </div>

      <div className="rs-message" style={{ color: resultColor }}>{state.lastStunt}</div>

      {state.stuntZone && !isOver && (
        <div className="rs-stunt-zone">
          <div className="rs-stunt-label">Stunt Zone!</div>
          <div className="rs-stunt-btns">
            <button onClick={() => dispatch({ type: "stunt", stuntType: "drift" })}>Drift</button>
            <button onClick={() => dispatch({ type: "stunt", stuntType: "jump" })}>Jump</button>
            <button onClick={() => dispatch({ type: "stunt", stuntType: "boost" })}>Boost</button>
          </div>
        </div>
      )}

      <div className="rs-controls">
        {!isOver && (
          <button className="rs-accel" onClick={() => dispatch({ type: "accelerate" })}>
            Accelerate
          </button>
        )}
        <button className="rs-restart" onClick={() => dispatch({ type: "restart" })}>
          New Race
        </button>
      </div>

      {isOver && (
        <div className="rs-gameover">Race Finished! Final Score: {state.score}</div>
      )}
    </div>
  );
}
