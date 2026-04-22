import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuckShootState } from "./state.js";
import { isTerminal } from "./state.js";
import type { duckShootSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./DuckShoot.css";

type DuckShootSettings = SettingsOf<typeof duckShootSettings>;

const W = 560;
const H = 380;

export function DuckShoot({
  state,
  dispatch,
  onGameOver,
}: GameProps<DuckShootState, DuckShootSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const arenaRef = useRef<SVGSVGElement | null>(null);

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

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (terminal || state.roundOver) return;
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    dispatch({ type: "shoot", x, y });
  };

  const ammo = Array.from({ length: state.ammoPerRound }, (_, i) => i < state.ammoLeft);

  return (
    <div className="duck-shoot">
      <div className="ds-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Round: <strong>{state.round}/{state.totalRounds}</strong></span>
        <div className="ds-ammo">
          {ammo.map((filled, i) => (
            <span key={i} className={filled ? "ds-bullet full" : "ds-bullet empty"}>•</span>
          ))}
        </div>
      </div>

      {terminal && (
        <div className="ds-ended">Game over! Hit {terminal.score}/{state.totalRounds * 6} ducks</div>
      )}

      {state.roundOver && !terminal && (
        <div className="ds-round-over">
          Round {state.round} done — next round starting…
          <button className="ds-next-btn" onClick={() => dispatch({ type: "nextRound" })}>
            Next Round
          </button>
        </div>
      )}

      <svg
        ref={arenaRef}
        className="ds-arena"
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        onClick={handleClick}
        style={{ cursor: (terminal || state.roundOver) ? "default" : "crosshair" }}
      >
        {/* Sky */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#87ceeb" />
            <stop offset="100%" stopColor="#e0f0ff" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#skyGrad)" />
        {/* Ground */}
        <rect x={0} y={H * 0.82} width={W} height={H * 0.18} fill="#5a8a32" />

        {/* Ducks */}
        {state.ducks.map((duck) => (
          <text
            key={duck.id}
            x={duck.x * W}
            y={duck.y * H}
            textAnchor="middle"
            fontSize={duck.hit ? 28 : 32}
            opacity={duck.hit ? 0.3 : 1}
            style={{ transform: duck.vx < 0 ? `scale(-1,1)` : undefined, transformOrigin: `${duck.x * W}px ${duck.y * H}px` }}
          >
            {duck.hit ? "💨" : "🦆"}
          </text>
        ))}
      </svg>
    </div>
  );
}
