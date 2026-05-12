import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HelicopterState, HelicopterAction, HelicopterSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 480;
const PH = 280;

export function HelicopterGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<HelicopterState, HelicopterSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const endedRef = useRef(false);
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) { endedRef.current = true; onGameOver(t.score); }
  }, [state, onGameOver]);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over) { rafRef.current = null; lastRef.current = null; return; }
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as HelicopterAction);
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    },
    [dispatch],
  );

  useEffect(() => {
    if (!state.over) rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; lastRef.current = null; }
    };
  }, [state.over, tick]);

  useEffect(() => {
    function dn(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); dispatch({ type: "hold", on: true } as HelicopterAction); }
    }
    function up(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp") dispatch({ type: "hold", on: false } as HelicopterAction);
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

    ctx.fillStyle = "#c8e4f8";
    ctx.fillRect(0, 0, PW, PH);

    // Walls
    state.walls.forEach((w) => {
      const wx = w.x * PW;
      const ww = 0.05 * PW;
      ctx.fillStyle = "#6b4";
      ctx.fillRect(wx, 0, ww, w.topH * PH);
      ctx.fillRect(wx, PH - w.botH * PH, ww, w.botH * PH);
      ctx.fillStyle = "#4a3";
      ctx.fillRect(wx, w.topH * PH - 8, ww + 6, 8);
      ctx.fillRect(wx, PH - w.botH * PH, ww + 6, 8);
    });

    // Helicopter
    const hx = 0.15 * PW;
    const hy = state.heliY * PH;
    const hw = 0.06 * PW;
    const hh = 0.05 * PH;
    // Body
    ctx.fillStyle = "#e63";
    ctx.fillRect(hx, hy - hh / 2, hw, hh);
    // Rotor
    ctx.fillStyle = "#555";
    ctx.fillRect(hx - hw * 0.2, hy - hh / 2 - 4, hw * 1.4, 3);
    // Tail
    ctx.fillStyle = "#c52";
    ctx.fillRect(hx + hw, hy - 3, hw * 0.6, 6);
    ctx.fillStyle = "#888";
    ctx.fillRect(hx + hw * 1.5, hy - hh * 0.5, 3, hh);

    // Distance
    ctx.fillStyle = "#224";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Distance: ${Math.floor(state.distance * 100)}m`, 8, 20);
  });

  const terminal = isTerminal(state);

  return (
    <div className="heli-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="heli-canvas"
          width={PW}
          height={PH}
          onPointerDown={() => dispatch({ type: "hold", on: true } as HelicopterAction)}
          onPointerUp={() => dispatch({ type: "hold", on: false } as HelicopterAction)}
          onPointerLeave={() => dispatch({ type: "hold", on: false } as HelicopterAction)}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Crashed!</h2>
            <p>Distance: {terminal.score}m</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button className="arcade-btn"
          onPointerDown={() => dispatch({ type: "hold", on: true } as HelicopterAction)}
          onPointerUp={() => dispatch({ type: "hold", on: false } as HelicopterAction)}
          onPointerLeave={() => dispatch({ type: "hold", on: false } as HelicopterAction)}
        >Hold to Rise ↑</button>
      </div>
      <div className="arcade-hint">Hold Space / Up / button to rise. Release to fall. Avoid the walls!</div>
    </div>
  );
}
