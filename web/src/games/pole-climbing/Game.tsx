import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PoleState, PoleAction } from "./state.js";
import { isTerminal, POLE_HEIGHT } from "./state.js";
import "./Game.css";

export function PoleClimbing({
  state,
  dispatch,
  onGameOver,
}: GameProps<PoleState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase === "done") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 80);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  const d = (a: PoleAction) => dispatch(a);
  const energyColor = state.energy >= 60 ? "#43a047" : state.energy >= 30 ? "#ffa726" : "#ef5350";
  const heightPct = (state.height / POLE_HEIGHT) * 100;
  const poleHeight = 200;

  return (
    <div className="pole-wrap fade-in">
      <div className="pole-header">
        <span className="pole-title">Pole Climbing</span>
        <span className="pole-score pulse">Falls: {state.falls} | Score: {state.score}</span>
      </div>

      <div className="pole-arena">
        <div style={{ position: "relative", width: 24, height: poleHeight, background: "#8d6e63", borderRadius: 4 }}>
          {/* climber */}
          <div className="pole-climber" style={{ bottom: `${heightPct}%` }}>🧗</div>
          {/* obstacles */}
          {state.obstacles.map(o => {
            const obsPct = ((o.height - state.height) / POLE_HEIGHT) * 100;
            if (obsPct < 0 || obsPct > 100) return null;
            return (
              <div key={o.id} className={`pole-obstacle ${o.side}`}
                style={{ bottom: `${obsPct * (poleHeight / 100)}px` }}>
                🪨
              </div>
            );
          })}
        </div>
        <div className="pole-bars">
          <div className="pole-bar-row">
            <span className="pole-bar-label">Height</span>
            <div className="pole-bar">
              <div className="pole-bar-fill" style={{ width: `${heightPct}%`, background: "#1976d2" }} />
            </div>
          </div>
          <div className="pole-bar-row">
            <span className="pole-bar-label">Energy</span>
            <div className="pole-bar">
              <div className="pole-bar-fill" style={{ width: `${state.energy}%`, background: energyColor }} />
            </div>
          </div>
          <div className="pole-stats">
            Speed: {state.speed.toFixed(1)} | Combo: {state.gripCombo}x
          </div>
        </div>
      </div>

      {state.phase === "climbing" && (
        <div className="pole-controls">
          <button data-testid="hint-target-pole-climbing-action" className="pole-btn left" onClick={() => d({ type: "gripLeft" })}>Left Grip</button>
          <button className="pole-btn right" onClick={() => d({ type: "gripRight" })}>Right Grip</button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="pole-done bounce-in">
          <div className="pole-done-score pulse">Reached the top! Score: {state.score}</div>
          <div>{state.falls === 0 ? "Perfect Climb!" : state.falls <= 3 ? "Nice ascent!" : "Made it up!"}</div>
        </div>
      )}
    </div>
  );
}
