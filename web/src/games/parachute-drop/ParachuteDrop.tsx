import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ParachuteDropState, ParachuteDropSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./ParachuteDrop.css";

const W = 400;
const H = 480;

export function ParachuteDrop({
  state,
  dispatch,
  onGameOver,
}: GameProps<ParachuteDropState, ParachuteDropSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.1);
      lastRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch({ type: "move", x: (e.clientX - rect.left) / rect.width });
  }
  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = e.touches[0]; if (!t) return;
    dispatch({ type: "move", x: (t.clientX - rect.left) / rect.width });
  }

  const zoneLeft = (state.zone - state.zoneW / 2) * W;
  const zoneWidth = state.zoneW * W;

  return (
    <div className="parachute-drop">
      <div className="pd-hud">
        <span>Score: {state.score}</span>
        <span>{"❤️".repeat(state.lives)}</span>
      </div>
      <div
        className="pd-sky"
        style={{ width: W, height: H }}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      >
        {state.parachutists.map((p) => (
          <div
            key={p.id}
            className="pd-parachutist"
            style={{ left: p.x * W - 16, top: p.y * H - 24 }}
          >
            🪂
          </div>
        ))}
        {/* Ground */}
        <div className="pd-ground" />
        {/* Landing zone */}
        <div className="pd-zone" style={{ left: zoneLeft, width: zoneWidth }} />
        {terminal && (
          <div className="pd-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="pd-hint">Move mouse/touch to position the landing zone</div>
    </div>
  );
}
