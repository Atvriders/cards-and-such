import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BottleSpinState, BottleSpinAction, BottleSpinSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./BottleSpin.css";

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 110;

export function BottleSpin({
  state,
  dispatch,
  onGameOver,
}: GameProps<BottleSpinState, BottleSpinSettings>): JSX.Element {
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
      dispatch({ type: "tick", dt } as BottleSpinAction);
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

  // Convert degrees to SVG arc
  function polarToCart(deg: number, r: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
  }

  const tStart = state.targetStart;
  const tEnd = (state.targetStart + state.targetWidth) % 360;
  const p1 = polarToCart(tStart, R);
  const p2 = polarToCart(tEnd, R);
  const largeArc = state.targetWidth > 180 ? 1 : 0;

  // Bottle pointer
  const ptrRad = ((state.angle - 90) * Math.PI) / 180;
  const ptrTip = { x: CX + R * 0.85 * Math.cos(ptrRad), y: CY + R * 0.85 * Math.sin(ptrRad) };
  const ptrTail = { x: CX - R * 0.5 * Math.cos(ptrRad), y: CY - R * 0.5 * Math.sin(ptrRad) };

  const isIdle = !state.spinning && state.lastResult === null;
  const showResult = state.lastResult !== null;

  return (
    <div className="bottle-spin-game">
      <div className="bottle-spin-header">
        <span>Round {state.round}/{state.maxRounds}</span>
        <span>Score: {state.score}</span>
      </div>

      <svg className="bottle-spin-svg" width={SIZE} height={SIZE}>
        {/* Background circle */}
        <circle cx={CX} cy={CY} r={R} fill="#f5f0e0" stroke="#aaa" strokeWidth={2} />

        {/* Target arc */}
        <path
          d={`M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 ${largeArc} 1 ${p2.x} ${p2.y} Z`}
          fill="#44cc66"
          opacity={0.4}
        />

        {/* Degree marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const inner = polarToCart(deg, R - 8);
          const outer = polarToCart(deg, R);
          return <line key={deg} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#888" strokeWidth={2} />;
        })}

        {/* Bottle pointer */}
        <line
          x1={ptrTail.x}
          y1={ptrTail.y}
          x2={ptrTip.x}
          y2={ptrTip.y}
          stroke="#cc3311"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r={10} fill="#555" />

        {showResult && (
          <text
            x={CX}
            y={CY - R - 14}
            textAnchor="middle"
            fill={state.lastResult === "hit" ? "#228833" : "#cc2200"}
            fontSize={18}
            fontWeight="bold"
          >
            {state.lastResult === "hit" ? "HIT! +100" : "Miss!"}
          </text>
        )}
      </svg>

      <div className="bottle-spin-controls">
        {isIdle && !state.over && (
          <button className="bspin-btn" onClick={() => dispatch({ type: "spin" } as BottleSpinAction)}>
            Spin!
          </button>
        )}
        {state.spinning && (
          <button className="bspin-btn bspin-stop" onClick={() => dispatch({ type: "stop" } as BottleSpinAction)}>
            STOP!
          </button>
        )}
        {showResult && !state.over && (
          <button className="bspin-btn" onClick={() => dispatch({ type: "next" } as BottleSpinAction)}>
            Next Round
          </button>
        )}
        {state.over && (
          <div className="bspin-over">Game Over! Score: {state.score}</div>
        )}
      </div>
    </div>
  );
}
