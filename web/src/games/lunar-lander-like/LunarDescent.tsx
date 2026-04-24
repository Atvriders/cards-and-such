import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LunarDescentState, LunarDescentAction } from "./state.js";
import { SHIP_R, FUEL_MAX, isTerminal } from "./state.js";
import "./LunarDescent.css";

const PW = 480;
const PH = 500;

export function LunarDescent({
  state,
  dispatch,
}: GameProps<LunarDescentState, Record<never, never>>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.lost && !s.won && !s.landed && !s.crashed) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as LunarDescentAction);
        }
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.lost && !state.won && !state.landed && !state.crashed) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.lost, state.won, state.landed, state.crashed, tick]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dispatch({ type: "thrust-start" } as LunarDescentAction);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "rotate-left-start" } as LunarDescentAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "rotate-right-start" } as LunarDescentAction);
      } else if (e.key === "Enter" || e.key === "n" || e.key === "N") {
        dispatch({ type: "next-attempt" } as LunarDescentAction);
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        dispatch({ type: "thrust-stop" } as LunarDescentAction);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        dispatch({ type: "rotate-left-stop" } as LunarDescentAction);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        dispatch({ type: "rotate-right-stop" } as LunarDescentAction);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  const terminal = isTerminal(state);
  const { x, y, angle, fuel, score, lives, terrain, thrustOn, crashed, landed } = state;

  // Build SVG terrain path
  const terrainPath = terrain.points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x * PW},${p.y * PH}`)
    .join(" ") + ` L${PW},${PH} L0,${PH} Z`;

  // Landing pad
  const padPt1 = terrain.points[terrain.padStart]!;
  const padPt2 = terrain.points[terrain.padStart + 1]!;

  // Ship shape (triangle pointing up, rotated)
  const sr = SHIP_R * PW;
  const shipCx = x * PW;
  const shipCy = y * PH;

  return (
    <div className="lunardescent-game">
      <div className="lunardescent-header">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
        <div className="fuel-bar">
          <div className="fuel-bar-fill" style={{ width: `${(fuel / FUEL_MAX) * 100}%` }} />
        </div>
        <span>Fuel: {Math.floor(fuel)}</span>
      </div>

      <div className="lunardescent-playfield" style={{ width: PW, height: PH }}>
        <svg width={PW} height={PH} style={{ display: "block" }}>
          {/* Stars */}
          {[...Array(30)].map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={((i * 157 + 29) % 100) / 100 * PW}
              cy={((i * 83 + 11) % 60) / 100 * PH}
              r={1}
              fill="#fff"
              opacity={0.5}
            />
          ))}

          {/* Terrain */}
          <path d={terrainPath} fill="#888" stroke="#aaa" strokeWidth={2} />

          {/* Landing pad highlight */}
          <line
            x1={padPt1.x * PW} y1={padPt1.y * PH}
            x2={padPt2.x * PW} y2={padPt2.y * PH}
            stroke="#4f4"
            strokeWidth={4}
          />

          {/* Thrust flame */}
          {thrustOn && !crashed && (
            <polygon
              points={`${shipCx},${shipCy + sr * 1.5} ${shipCx - sr * 0.5},${shipCy + sr} ${shipCx + sr * 0.5},${shipCy + sr}`}
              fill="#f90"
              opacity={0.8}
              transform={`rotate(${angle * 180 / Math.PI}, ${shipCx}, ${shipCy})`}
            />
          )}

          {/* Ship */}
          <polygon
            points={`${shipCx},${shipCy - sr} ${shipCx - sr * 0.8},${shipCy + sr} ${shipCx + sr * 0.8},${shipCy + sr}`}
            fill={crashed ? "#f44" : landed ? "#4f4" : "#4af"}
            stroke={crashed ? "#f00" : "#069"}
            strokeWidth={1.5}
            transform={`rotate(${angle * 180 / Math.PI}, ${shipCx}, ${shipCy})`}
          />
        </svg>

        {/* Status overlays */}
        {(crashed || landed) && !terminal && (
          <div className="lunardescent-overlay">
            <h2>{landed ? "Landed!" : "Crashed!"}</h2>
            <p>{landed ? `+${score} pts` : "Too fast or off-pad"}</p>
            <p>Press N / Enter to try again</p>
          </div>
        )}
        {terminal && state.won && (
          <div className="lunardescent-overlay">
            <h2>Mission Complete!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
        {terminal && state.lost && (
          <div className="lunardescent-overlay">
            <h2>Mission Failed</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="lunardescent-controls">
        <button
          onPointerDown={() => dispatch({ type: "rotate-left-start" } as LunarDescentAction)}
          onPointerUp={() => dispatch({ type: "rotate-left-stop" } as LunarDescentAction)}
        >◀ Rotate</button>
        <button
          onPointerDown={() => dispatch({ type: "thrust-start" } as LunarDescentAction)}
          onPointerUp={() => dispatch({ type: "thrust-stop" } as LunarDescentAction)}
        >▲ Thrust</button>
        <button
          onPointerDown={() => dispatch({ type: "rotate-right-start" } as LunarDescentAction)}
          onPointerUp={() => dispatch({ type: "rotate-right-stop" } as LunarDescentAction)}
        >▶ Rotate</button>
      </div>

      <div className="lunardescent-hint">
        Space/W = thrust · A/D = rotate · Land on the green pad slowly and upright!
      </div>
    </div>
  );
}
