import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CatapultCastleState, CatapultCastleAction, CatapultCastleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./CatapultCastle.css";

const PW = 480;
const PH = 340;

export function CatapultCastle({
  state,
  dispatch,
  onGameOver,
}: GameProps<CatapultCastleState, CatapultCastleSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  const tick = useCallback((now: number) => {
    const s = stateRef.current;
    if (s.over || !s.boulder) { rafRef.current = null; lastRef.current = null; return; }
    if (lastRef.current !== null) {
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      dispatch({ type: "tick", dt } as CatapultCastleAction);
    }
    lastRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, [dispatch]);

  useEffect(() => {
    if (state.boulder && !state.over) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastRef.current = null; } };
  }, [!!state.boulder, state.over, tick]);

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
    sky.addColorStop(1, "#cce8ff");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, PW, PH);

    // Ground
    ctx.fillStyle = "#4a7a20";
    ctx.fillRect(0, PH * 0.78, PW, PH * 0.22);

    // Catapult
    const cx = 0.07 * PW;
    const cy = 0.72 * PH;
    ctx.fillStyle = "#6b3a10";
    ctx.fillRect(cx - 18, cy - 4, 36, 14);
    const rad = (state.angle * Math.PI) / 180;
    ctx.strokeStyle = "#8b5a2b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * 30, cy - Math.sin(rad) * 30);
    ctx.stroke();

    // Castle blocks
    state.blocks.forEach(block => {
      if (block.destroyed) return;
      ctx.fillStyle = "#8a8a9a";
      ctx.fillRect(block.x * PW, block.y * PH, block.w * PW, block.h * PH);
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.strokeRect(block.x * PW, block.y * PH, block.w * PW, block.h * PH);
      // Rubble lines
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(block.x * PW + block.w * PW * 0.3, block.y * PH);
      ctx.lineTo(block.x * PW + block.w * PW * 0.1, block.y * PH + block.h * PH);
      ctx.stroke();
    });

    // Destroyed block rubble
    state.blocks.forEach(block => {
      if (!block.destroyed) return;
      ctx.fillStyle = "rgba(100,80,60,0.4)";
      ctx.fillRect(block.x * PW + 2, block.y * PH + block.h * PH - 6, block.w * PW - 4, 6);
    });

    // Boulder
    if (state.boulder) {
      ctx.beginPath();
      ctx.arc(state.boulder.x * PW, state.boulder.y * PH, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#555";
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });

  const terminal = isTerminal(state);
  const remaining = state.totalBoulders - state.bouldersUsed;

  return (
    <div className="catapult-game">
      <div className="catapult-hud">
        <span>Boulders: {remaining}</span>
        <span>Score: {state.score}</span>
        {state.lastPts !== null && state.lastPts > 0 && (
          <span className="catapult-hit">+{state.lastPts}</span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="catapult-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="catapult-overlay">
            <h2>{state.blocks.every(b => b.destroyed) ? "Castle Destroyed!" : "Out of Boulders!"}</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="catapult-controls">
        <label>
          Angle: {state.angle}°
          <input type="range" min={10} max={75} value={state.angle}
            onChange={e => dispatch({ type: "setAngle", angle: parseInt(e.target.value) } as CatapultCastleAction)} />
        </label>
        <label>
          Power: {state.power}%
          <input type="range" min={20} max={100} value={state.power}
            onChange={e => dispatch({ type: "setPower", power: parseInt(e.target.value) } as CatapultCastleAction)} />
        </label>
        <button className="catapult-fire-btn"
          disabled={!!state.boulder || state.bouldersUsed >= state.totalBoulders || state.over}
          onClick={() => dispatch({ type: "launch" } as CatapultCastleAction)}>
          LAUNCH!
        </button>
      </div>
    </div>
  );
}
