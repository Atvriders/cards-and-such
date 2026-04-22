import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GravityLanderState, GravityLanderAction, GravityLanderSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./GravityLander.css";

const PW = 480;
const PH = 500;

export function GravityLander({
  state,
  dispatch,
}: GameProps<GravityLanderState, GravityLanderSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over || s.won) {
        rafRef.current = null;
        lastTimeRef.current = null;
        return;
      }
      if (lastTimeRef.current !== null) {
        const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as GravityLanderAction);
      }
      lastTimeRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.over && !state.won) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [state.over, state.won, tick]);

  // Keyboard
  useEffect(() => {
    function dn(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === " ") {
        e.preventDefault();
        dispatch({ type: "thrust", on: true } as GravityLanderAction);
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        dispatch({ type: "rotateLeft", on: true } as GravityLanderAction);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        dispatch({ type: "rotateRight", on: true } as GravityLanderAction);
      }
    }
    function up(e: KeyboardEvent) {
      if (e.key === "ArrowUp" || e.key === " ") dispatch({ type: "thrust", on: false } as GravityLanderAction);
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") dispatch({ type: "rotateLeft", on: false } as GravityLanderAction);
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") dispatch({ type: "rotateRight", on: false } as GravityLanderAction);
    }
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [dispatch]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, PW, PH);

    const { terrain, padX, padWidth, padY, x, y, angle, thrusting, fuel } = state;

    // Stars
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    for (let i = 0; i < 50; i++) {
      const sx = ((i * 37 + 13) % 100) / 100 * PW;
      const sy = ((i * 53 + 7) % 100) / 100 * PH * 0.75;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Terrain
    ctx.beginPath();
    ctx.moveTo(0, PH);
    terrain.forEach((p) => ctx.lineTo(p.x * PW, p.y * PH));
    ctx.lineTo(PW, PH);
    ctx.closePath();
    ctx.fillStyle = "#2a3a2a";
    ctx.fill();
    ctx.strokeStyle = "#4a6a4a";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Landing pad
    const padLeft = (padX - padWidth / 2) * PW;
    const padRight = (padX + padWidth / 2) * PW;
    const padYPx = padY * PH;
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(padLeft, padYPx - 4, padRight - padLeft, 4);
    // Pad markers
    ctx.fillStyle = "#ff8800";
    ctx.fillRect(padLeft, padYPx - 8, 4, 8);
    ctx.fillRect(padRight - 4, padYPx - 8, 4, 8);

    // Ship
    const sx = x * PW;
    const sy = y * PH;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(angle);
    // Body
    ctx.fillStyle = "#ccccdd";
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(8, 10);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8888aa";
    ctx.lineWidth = 1;
    ctx.stroke();
    // Legs
    ctx.strokeStyle = "#aaaacc";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-6, 10); ctx.lineTo(-12, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, 10); ctx.lineTo(12, 18); ctx.stroke();
    // Thruster flame
    if (thrusting && fuel > 0) {
      ctx.fillStyle = "#ff8800";
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.lineTo(4, 10);
      ctx.lineTo(0, 24 + Math.random() * 6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // HUD: velocity arrows
    const hudX = 12;
    const hudY = 12;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "11px monospace";
    ctx.fillText(`VX: ${state.vx.toFixed(3)}`, hudX, hudY + 14);
    ctx.fillText(`VY: ${state.vy.toFixed(3)}`, hudX, hudY + 28);
    ctx.fillText(`ANGLE: ${(state.angle * 180 / Math.PI).toFixed(1)}°`, hudX, hudY + 42);
  });

  const terminal = isTerminal(state);
  const fuelPct = Math.max(0, (state.fuel / 100) * 100);

  return (
    <div className="lander-game">
      <div className="lander-header">
        <span>Fuel: <span className="lander-fuel-bar"><span className="lander-fuel-fill" style={{ width: `${fuelPct}%` }} /></span></span>
        {state.won && <span style={{ color: "#44cc66" }}>Score: {state.score}</span>}
      </div>

      <div style={{ position: "relative" }}>
        <canvas ref={canvasRef} className="lander-canvas" width={PW} height={PH} />
        {terminal && (
          <div className="lander-overlay">
            <h2>{state.won ? "Safe Landing!" : "Crashed"}</h2>
            <p>{state.won ? `Score: ${terminal.score}` : "Too fast or wrong angle"}</p>
          </div>
        )}
      </div>

      <div className="lander-controls">
        <button
          className={`lander-btn${state.rotatingLeft ? " active" : ""}`}
          onPointerDown={() => dispatch({ type: "rotateLeft", on: true } as GravityLanderAction)}
          onPointerUp={() => dispatch({ type: "rotateLeft", on: false } as GravityLanderAction)}
          onPointerLeave={() => dispatch({ type: "rotateLeft", on: false } as GravityLanderAction)}
        >↺ Rotate</button>
        <button
          className={`lander-btn${state.thrusting ? " active" : ""}`}
          onPointerDown={() => dispatch({ type: "thrust", on: true } as GravityLanderAction)}
          onPointerUp={() => dispatch({ type: "thrust", on: false } as GravityLanderAction)}
          onPointerLeave={() => dispatch({ type: "thrust", on: false } as GravityLanderAction)}
        >🔥 Thrust</button>
        <button
          className={`lander-btn${state.rotatingRight ? " active" : ""}`}
          onPointerDown={() => dispatch({ type: "rotateRight", on: true } as GravityLanderAction)}
          onPointerUp={() => dispatch({ type: "rotateRight", on: false } as GravityLanderAction)}
          onPointerLeave={() => dispatch({ type: "rotateRight", on: false } as GravityLanderAction)}
        >Rotate ↻</button>
      </div>

      <div className="lander-hint">
        Arrow Up / Space = thrust · A/D or ← → = rotate · Land on the yellow pad gently
      </div>
    </div>
  );
}
