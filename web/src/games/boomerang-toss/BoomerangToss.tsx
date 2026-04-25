import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BoomerangTossState, BoomerangTossAction, BoomerangTossSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./BoomerangToss.css";

const CW = 360;
const CH = 420;

export function BoomerangToss({
  state,
  dispatch,
  onGameOver,
}: GameProps<BoomerangTossState, BoomerangTossSettings>): JSX.Element {
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
      dispatch({ type: "tick", dt } as BoomerangTossAction);
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

  function handleFieldClick(e: React.MouseEvent<SVGSVGElement>) {
    const s = stateRef.current;
    if (s.phase === "caught" || s.phase === "missed") {
      dispatch({ type: "nextThrow" } as BoomerangTossAction);
      return;
    }
    if (s.phase !== "aim") return;
    // Compute angle from thrower to click
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / CW;
    const my = (e.clientY - rect.top) / CH;
    const dx = mx - 0.5;
    const dy = 0.85 - my;
    const angle = (Math.atan2(dx, dy) * 180) / Math.PI + 90;
    const clamped = Math.max(10, Math.min(170, angle));
    // Update angle then release on second click — for now release immediately
    dispatch({ type: "release" } as BoomerangTossAction);
    void clamped;
  }

  const bx = state.boomerangX * CW;
  const by = state.boomerangY * CH;

  return (
    <div className="boomerang-game">
      <div className="boomerang-header">
        <span>Throw {state.throws}/{state.maxThrows}</span>
        <span>Score: {state.score}</span>
      </div>

      <svg
        className="boomerang-field"
        width={CW}
        height={CH}
        onClick={handleFieldClick}
        style={{ cursor: state.phase === "aim" || state.phase === "caught" || state.phase === "missed" ? "pointer" : "default" }}
      >
        {/* Sky background */}
        <rect width={CW} height={CH} fill="#a0d4f5" />
        <rect y={CH * 0.8} width={CW} height={CH * 0.2} fill="#7ec850" />

        {/* Rings */}
        {state.rings.map((ring) => (
          <circle
            key={ring.id}
            cx={ring.x * CW}
            cy={ring.y * CH}
            r={ring.radius * CW}
            fill="none"
            stroke={ring.hit ? "#ffcc00" : "#ff4422"}
            strokeWidth={ring.hit ? 5 : 4}
            opacity={ring.hit ? 0.5 : 1}
          />
        ))}

        {/* Thrower */}
        <ellipse cx={0.5 * CW} cy={0.85 * CH} rx={14} ry={18} fill="#664422" />

        {/* Boomerang */}
        {state.phase !== "aim" && (
          <g transform={`translate(${bx},${by}) rotate(${state.boomerangAngle})`}>
            <path d="M-14,0 Q0,-16 14,0 Q0,10 -14,0" fill="#cc8833" stroke="#885522" strokeWidth={2} />
          </g>
        )}

        {/* Aim indicator */}
        {state.phase === "aim" && (
          <line
            x1={0.5 * CW}
            y1={0.85 * CH}
            x2={0.5 * CW + Math.cos((state.angle * Math.PI) / 180 - Math.PI / 2) * 80}
            y2={0.85 * CH + Math.sin((state.angle * Math.PI) / 180 - Math.PI / 2) * 80}
            stroke="#fff"
            strokeWidth={2}
            strokeDasharray="6 4"
            opacity={0.7}
          />
        )}

        {/* Phase text */}
        {state.phase === "caught" && (
          <text x={CW / 2} y={40} textAnchor="middle" fill="#fff" fontSize={18} fontWeight="bold">
            Caught! {state.over ? "Game Over!" : "Click to throw again"}
          </text>
        )}
        {state.phase === "aim" && (
          <text x={CW / 2} y={30} textAnchor="middle" fill="#333" fontSize={14}>
            Click to throw!
          </text>
        )}
      </svg>
    </div>
  );
}
