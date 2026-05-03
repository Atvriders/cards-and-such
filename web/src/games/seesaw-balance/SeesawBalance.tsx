import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeesawBalanceState, SeesawBalanceAction, SeesawBalanceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SeesawBalance.css";

export function SeesawBalance({
  state,
  dispatch,
  onGameOver,
}: GameProps<SeesawBalanceState, SeesawBalanceSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over) { rafRef.current = null; lastTimeRef.current = null; return; }
    if (lastTimeRef.current !== null) {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as SeesawBalanceAction);
    }
    lastTimeRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, [dispatch]);

  useEffect(() => {
    if (!state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.over, tick]);

  const angleRad = (state.angle * Math.PI) / 180;
  const beamLen = 200;
  const leftEnd = {
    x: 160 - Math.cos(angleRad) * beamLen,
    y: 160 + Math.sin(angleRad) * beamLen,
  };
  const rightEnd = {
    x: 160 + Math.cos(angleRad) * beamLen,
    y: 160 - Math.sin(angleRad) * beamLen,
  };

  return (
    <div className="seesaw-game">
      <div className="seesaw-header">
        <span>Round {state.round} / {state.maxRounds}</span>
        <span>Score: {state.score}</span>
      </div>

      <svg className="seesaw-svg" width="320" height="260" viewBox="0 0 320 260">
        {/* Pivot */}
        <polygon points="160,185 150,215 170,215" fill="#888" />
        {/* Beam */}
        <line
          x1={leftEnd.x} y1={leftEnd.y}
          x2={rightEnd.x} y2={rightEnd.y}
          stroke="#885533" strokeWidth="10" strokeLinecap="round"
        />
        {/* Weights labels */}
        <text x={leftEnd.x} y={leftEnd.y - 10} textAnchor="middle" fill="#222" fontSize="13" fontWeight="bold">
          L:{state.leftWeight}
        </text>
        <text x={rightEnd.x} y={rightEnd.y - 10} textAnchor="middle" fill="#222" fontSize="13" fontWeight="bold">
          R:{state.rightWeight}
        </text>
        {/* Angle indicator */}
        <text x="160" y="240" textAnchor="middle" fill={Math.abs(state.angle) > 30 ? "#cc0000" : "#444"} fontSize="12">
          {state.angle.toFixed(1)}°
        </text>
      </svg>

      {state.pendingBall && (
        <div className="seesaw-pending">
          <div className="seesaw-ball-label">
            Next ball: weight <strong>{state.pendingBall.weight}</strong>
          </div>
          <div className="seesaw-controls">
            <button
              className="seesaw-btn seesaw-btn-left"
              onClick={() => dispatch({ type: "placeLeft" } as SeesawBalanceAction)}
            >
              Place Left
            </button>
            <button
              className="seesaw-btn seesaw-btn-right"
              onClick={() => dispatch({ type: "placeRight" } as SeesawBalanceAction)}
            >
              Place Right
            </button>
          </div>
        </div>
      )}

      {!state.pendingBall && !state.over && (
        <div className="seesaw-feedback">
          <div className="seesaw-message">{state.message}</div>
          <button data-testid="hint-target-seesaw-balance-action"
            className="seesaw-btn"
            onClick={() => dispatch({ type: "next" } as SeesawBalanceAction)}
          >
            Next Ball
          </button>
        </div>
      )}

      {state.over && (
        <div className="seesaw-overlay">
          <div className="seesaw-end">
            <div>Game Over!</div>
            <div>Final Score: {state.score}</div>
          </div>
        </div>
      )}
    </div>
  );
}
