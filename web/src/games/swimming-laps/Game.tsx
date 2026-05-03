import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwimState, SwimAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SwimmingLaps({
  state,
  dispatch,
  onGameOver,
}: GameProps<SwimState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 80);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  const d = (a: SwimAction) => dispatch(a);
  const staminaColor = state.stamina >= 60 ? "#29b6f6" : state.stamina >= 30 ? "#ffa726" : "#ef5350";

  return (
    <div className="swim-wrap">
      <div className="swim-header">
        <span className="swim-title">Swimming Laps</span>
        <span className="swim-lap">Lap {Math.min(state.lap, state.totalLaps)}/{state.totalLaps}</span>
        <span className="swim-score">Score: {state.score}</span>
      </div>

      <div className="swim-bar-row">
        <span>Progress</span>
        <div className="swim-bar">
          <div className="swim-bar-fill" style={{ width: `${state.progress}%`, background: "#29b6f6" }} />
        </div>
      </div>
      <div className="swim-bar-row">
        <span>Stamina</span>
        <div className="swim-bar">
          <div className="swim-bar-fill" style={{ width: `${state.stamina}%`, background: staminaColor }} />
        </div>
      </div>

      <div className="swim-pool">
        {[0, 1, 2].map(lane => {
          const isActive = lane === state.lane;
          const hasObstacle = state.obstacles.some(o => o.laneOffset === lane - 1 && o.distance < 30 && o.distance > 0);
          return (
            <div key={lane} className={`swim-lane${isActive ? " active" : ""}`}>
              {isActive && <span className="swim-swimmer">🏊</span>}
              {hasObstacle && <span className="swim-obstacle" style={{ marginLeft: "auto" }}>🚧</span>}
              {!isActive && !hasObstacle && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>Lane {lane + 1}</span>}
            </div>
          );
        })}
      </div>

      <div className="swim-stroke">Stroke: {state.stroke} | Combo: {state.strokeCombo}x</div>
      <div className="swim-info">Hits: {state.hits} | Speed: {state.speed.toFixed(1)}</div>

      {state.phase === "playing" && (
        <div className="swim-controls">
          <button data-testid="hint-target-swimming-laps-action" className="swim-btn lane-l" onClick={() => d({ type: "changeLane", dir: -1 })}>← Lane</button>
          <button className="swim-btn stroke-l" onClick={() => d({ type: "stroke", key: "L" })}>L Stroke</button>
          <button className="swim-btn stroke-r" onClick={() => d({ type: "stroke", key: "R" })}>R Stroke</button>
          <button className="swim-btn lane-r" onClick={() => d({ type: "changeLane", dir: 1 })}>Lane →</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="swim-done">
          <div>Race Over! Score: {state.score}</div>
          <div>{state.hits} obstacles hit</div>
          <div>{state.score >= 200 ? "Gold Medal!" : state.score >= 100 ? "Silver!" : "Bronze!"}</div>
        </div>
      )}
    </div>
  );
}
