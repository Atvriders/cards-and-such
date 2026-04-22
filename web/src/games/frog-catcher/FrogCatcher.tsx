import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FrogCatcherState } from "./state.js";
import { isTerminal } from "./state.js";
import type { frogCatcherSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./FrogCatcher.css";

type FrogCatcherSettings = SettingsOf<typeof frogCatcherSettings>;

const W = 520;
const H = 380;

export function FrogCatcher({
  state,
  dispatch,
  onGameOver,
}: GameProps<FrogCatcherState, FrogCatcherSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);
  const pct = (timeLeft / duration) * 100;

  const frogPx = state.frog.x * W;
  const frogPy = state.frog.y * H;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (terminal) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const tx = (e.clientX - rect.left) / rect.width;
    const ty = (e.clientY - rect.top) / rect.height;
    dispatch({ type: "extend", tx, ty });
  };

  // Tongue tip position
  let tongueTipX = frogPx;
  let tongueTipY = frogPy;
  if (state.tongue) {
    const t = state.tongue;
    tongueTipX = frogPx + (t.tx * W - frogPx) * t.progress;
    tongueTipY = frogPy + (t.ty * H - frogPy) * t.progress;
  }

  return (
    <div className="frog-catcher">
      <div className="fc-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Flies: <strong>{state.flies.length}</strong></span>
        <span>Time: <strong>{timeLeft.toFixed(1)}s</strong></span>
      </div>

      <div className="fc-timer-bar">
        <div className="fc-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      {terminal && (
        <div className="fc-ended">Done! Caught {terminal.score} flies!</div>
      )}

      <svg
        ref={svgRef}
        className="fc-arena"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        onClick={handleClick}
        style={{ cursor: terminal ? "default" : "crosshair" }}
      >
        {/* Pond background */}
        <rect width={W} height={H} fill="#1a5276" rx={8} />
        {/* Lily pad */}
        <ellipse cx={frogPx} cy={frogPy + 14} rx={34} ry={10} fill="#1d8348" opacity={0.8} />

        {/* Tongue */}
        {state.tongue && (
          <line
            x1={frogPx} y1={frogPy - 4}
            x2={tongueTipX} y2={tongueTipY}
            stroke="#e74c3c"
            strokeWidth={5}
            strokeLinecap="round"
          />
        )}

        {/* Frog */}
        <text x={frogPx} y={frogPy + 5} textAnchor="middle" fontSize={28}>🐸</text>

        {/* Flies */}
        {state.flies.map((f) => (
          <text key={f.id} x={f.x * W} y={f.y * H} textAnchor="middle" fontSize={18}>🪰</text>
        ))}
      </svg>
    </div>
  );
}
