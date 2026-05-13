import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MissileCommandState, MissileCommandAction, MissileCommandSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./MissileCommand.css";

const PW = 480;
const PH = 540;

export function MissileCommand({
  state,
  dispatch,
  onGameOver,
}: GameProps<MissileCommandState, MissileCommandSettings>): JSX.Element {
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
  const lastTimeRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.over && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as MissileCommandAction);
        }
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
        lastTimeRef.current = null;
      }
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

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, PW, PH);

    const { cities, streaks, explosions, wave } = state;
    const groundY = 0.93 * PH;

    // Ground
    ctx.fillStyle = "#1a2a1a";
    ctx.fillRect(0, groundY, PW, PH - groundY);

    // Cities
    cities.forEach((city) => {
      const cx = city.x * PW;
      const cy = groundY;
      if (city.alive) {
        ctx.fillStyle = "#44cc66";
        // Simple building shape
        ctx.fillRect(cx - 14, cy - 18, 28, 18);
        ctx.fillRect(cx - 6, cy - 28, 12, 10);
      } else {
        ctx.fillStyle = "#553333";
        ctx.fillRect(cx - 12, cy - 8, 24, 8);
      }
    });

    // Streaks (missiles)
    streaks.forEach((s) => {
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x * PW, Math.max(0, s.y * PH - 20));
      ctx.lineTo(s.x * PW, s.y * PH);
      ctx.stroke();
      // Tip
      ctx.fillStyle = "#ff8888";
      ctx.beginPath();
      ctx.arc(s.x * PW, s.y * PH, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Explosions
    explosions.forEach((exp) => {
      const grd = ctx.createRadialGradient(
        exp.x * PW, exp.y * PH, 0,
        exp.x * PW, exp.y * PH, exp.radius * PW,
      );
      grd.addColorStop(0, "rgba(255,220,80,0.9)");
      grd.addColorStop(0.5, "rgba(255,100,20,0.6)");
      grd.addColorStop(1, "rgba(255,40,0,0)");
      ctx.beginPath();
      ctx.arc(exp.x * PW, exp.y * PH, exp.radius * PW, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();
    });

    // Crosshair cursor
    const cx = state.cursorX * PW;
    const cy = state.cursorY * PH;
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    // Wave label
    ctx.fillStyle = "rgba(100,200,255,0.5)";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Wave ${wave} / 6`, 8, 20);
  });

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      dispatch({ type: "aim", x, y } as MissileCommandAction);
    },
    [dispatch],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      dispatch({ type: "aim", x, y } as MissileCommandAction);
      dispatch({ type: "fire" } as MissileCommandAction);
    },
    [dispatch],
  );

  const terminal = isTerminal(state);

  return (
    <div className="mc-game">
      <div className="mc-header">
        <span>Score: {state.score}</span>
        <span>Cities: {state.cities.filter((c) => c.alive).length}</span>
        <span>Wave: {state.wave} / 6</span>
      </div>

      <canvas
        ref={canvasRef}
        className="mc-canvas"
        width={PW}
        height={PH}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
      >
        {terminal && (
          <div className="mc-overlay">
            <h2>{state.won ? "Humanity Saved!" : "Game Over"}</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </canvas>

      {terminal && (
        <div className="mc-overlay" style={{ position: "relative", background: "transparent", color: "#fff" }}>
          <h2 style={{ margin: 0, color: state.won ? "#44cc66" : "#ff4444" }}>
            {state.won ? "Humanity Saved!" : "All Cities Destroyed"}
          </h2>
          <p style={{ margin: 0 }}>Final Score: {terminal.score}</p>
        </div>
      )}

      <div className="mc-hint">Click / tap to fire at incoming missiles — protect your cities!</div>
    </div>
  );
}
