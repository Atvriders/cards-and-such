import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CannonShotState, CannonShotAction, CannonShotSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CannonShot.css";

const PW = 480;
const PH = 360;

export function CannonShot({
  state,
  dispatch,
}: GameProps<CannonShotState, CannonShotSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over || !s.projectile) {
      rafRef.current = null;
      lastRef.current = null;
      return;
    }
    if (lastRef.current !== null) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as CannonShotAction);
    }
    lastRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, [dispatch]);

  useEffect(() => {
    if (state.projectile && !state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastRef.current = null;
      }
    };
  }, [!!state.projectile, state.over, tick]);

  // Canvas draw
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PW, PH);

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, PH);
    sky.addColorStop(0, "#87ceeb");
    sky.addColorStop(1, "#e8f4ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, PW, PH);

    // Ground
    ctx.fillStyle = "#5a8a30";
    ctx.fillRect(0, PH * 0.82, PW, PH * 0.18);
    ctx.fillStyle = "#3d6020";
    ctx.fillRect(0, PH * 0.85, PW, PH * 0.15);

    // Cannon base
    const baseX = 0.05 * PW;
    const baseY = 0.75 * PH;
    ctx.fillStyle = "#555";
    ctx.fillRect(baseX - 10, baseY, 28, 18);
    // Cannon barrel
    const rad = (state.angle * Math.PI) / 180;
    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(-rad);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, -6, 40, 12);
    ctx.restore();

    // Target
    const tx = state.targetX * PW;
    const ty = state.targetY * PH;
    const tr = state.targetRadius * PW;
    for (let i = 3; i >= 0; i--) {
      ctx.beginPath();
      ctx.arc(tx, ty, tr * (1 - i * 0.25) + tr * i * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#cc2222" : "#ffffff";
      ctx.fill();
    }
    // Bullseye
    ctx.beginPath();
    ctx.arc(tx, ty, tr * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "#cc2222";
    ctx.fill();

    // Projectile
    if (state.projectile) {
      ctx.beginPath();
      ctx.arc(state.projectile.x * PW, state.projectile.y * PH, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
    }
  });

  const terminal = isTerminal(state);

  return (
    <div className="cannon-game">
      <div className="cannon-hud">
        <span>Round {state.round}/{state.totalRounds}</span>
        <span>Score: {state.score}</span>
        {state.lastHit === true && <span className="cannon-hit">Hit! +pts</span>}
        {state.lastHit === false && <span className="cannon-miss">Miss!</span>}
      </div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="cannon-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="cannon-overlay">
            <h2>Game Over</h2>
            <p>Final Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="cannon-controls">
        <label>
          Angle: {state.angle}°
          <input type="range" min={5} max={85} value={state.angle}
            onChange={e => dispatch({ type: "setAngle", angle: parseInt(e.target.value) } as CannonShotAction)} />
        </label>
        <label>
          Power: {state.power}%
          <input type="range" min={10} max={100} value={state.power}
            onChange={e => dispatch({ type: "setPower", power: parseInt(e.target.value) } as CannonShotAction)} />
        </label>
        <button data-testid="hint-target-cannon-shot-action" className="cannon-fire-btn" disabled={!!state.projectile || state.over}
          onClick={() => dispatch({ type: "fire" } as CannonShotAction)}>
          FIRE!
        </button>
      </div>
    </div>
  );
}
