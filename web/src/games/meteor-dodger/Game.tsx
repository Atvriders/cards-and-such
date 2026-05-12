import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MeteorDodgerState, MeteorDodgerAction, MeteorDodgerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 400;
const PH = 400;

export function MeteorDodgerGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<MeteorDodgerState, MeteorDodgerSettings>): JSX.Element {
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  const sendMove = useCallback(() => {
    const keys = keysRef.current;
    let dx: -1|0|1 = 0;
    let dy: -1|0|1 = 0;
    if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) dx = -1;
    if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) dx = 1;
    if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) dy = -1;
    if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) dy = 1;
    dispatch({ type: "move", dx, dy } as MeteorDodgerAction);
  }, [dispatch]);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over) { rafRef.current = null; lastRef.current = null; return; }
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as MeteorDodgerAction);
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
      keysRef.current.add(e.key);
      sendMove();
    }
    function up(e: KeyboardEvent) {
      keysRef.current.delete(e.key);
      sendMove();
    }
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [sendMove]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#05050f";
    ctx.fillRect(0, 0, PW, PH);

    // Stars (static decorative)
    ctx.fillStyle = "#ffffff44";
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 137 + 50) % PW);
      const sy = ((i * 97 + 20) % PH);
      ctx.fillRect(sx, sy, 1, 1);
    }

    // Meteors
    state.meteors.forEach((m) => {
      const mx = m.x * PW;
      const my = m.y * PH;
      const mr = m.r * PH;
      const grad = ctx.createRadialGradient(mx - mr * 0.3, my - mr * 0.3, 0, mx, my, mr);
      grad.addColorStop(0, "#fff8e0");
      grad.addColorStop(0.4, "#c84");
      grad.addColorStop(1, "#62000088");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    });

    // Ship
    const sx = state.shipX * PW;
    const sy = state.shipY * PH;
    const sr = 0.025 * PH;
    ctx.fillStyle = "#4af";
    ctx.beginPath();
    ctx.moveTo(sx, sy - sr * 1.4);
    ctx.lineTo(sx - sr, sy + sr);
    ctx.lineTo(sx + sr, sy + sr);
    ctx.closePath();
    ctx.fill();
    // Engine glow
    ctx.fillStyle = "#ff8833";
    ctx.beginPath();
    ctx.arc(sx, sy + sr * 1.2, sr * 0.4, 0, Math.PI * 2);
    ctx.fill();

    // HUD
    ctx.fillStyle = "#aef";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(`Time: ${state.elapsed.toFixed(1)}s`, 8, 22);
  });

  const terminal = isTerminal(state);

  return (
    <div className="meteor-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="meteor-canvas"
          width={PW}
          height={PH}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Destroyed!</h2>
            <p>Survived: {terminal.score}s</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button className="arcade-btn" onPointerDown={() => dispatch({ type: "move", dx: -1, dy: 0 } as MeteorDodgerAction)} onPointerUp={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)} onPointerLeave={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)}>←</button>
        <button className="arcade-btn" onPointerDown={() => dispatch({ type: "move", dx: 0, dy: -1 } as MeteorDodgerAction)} onPointerUp={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)} onPointerLeave={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)}>↑</button>
        <button className="arcade-btn" onPointerDown={() => dispatch({ type: "move", dx: 0, dy: 1 } as MeteorDodgerAction)} onPointerUp={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)} onPointerLeave={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)}>↓</button>
        <button className="arcade-btn" onPointerDown={() => dispatch({ type: "move", dx: 1, dy: 0 } as MeteorDodgerAction)} onPointerUp={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)} onPointerLeave={() => dispatch({ type: "move", dx: 0, dy: 0 } as MeteorDodgerAction)}>→</button>
      </div>
      <div className="arcade-hint">WASD or arrow keys. Move the ship. Avoid every meteor!</div>
    </div>
  );
}
