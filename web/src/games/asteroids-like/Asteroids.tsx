import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AsteroidsState, AsteroidsAction, AsteroidsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Asteroids.css";

const PW = 560;
const PH = 560;

function asteroidRadius(size: number): number {
  return size === 3 ? 0.06 : size === 2 ? 0.035 : 0.018;
}

export function Asteroids({
  state,
  dispatch,
}: GameProps<AsteroidsState, AsteroidsSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // ── rAF tick + draw ───────────────────────────────────────────────────────
  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (!s.over && !s.won) {
        if (lastTimeRef.current !== null) {
          const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
          dispatch({ type: "tick", dt } as AsteroidsAction);
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

  // ── Draw onto canvas ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { ship, asteroids, bullets, invincible } = state;

    ctx.clearRect(0, 0, PW, PH);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, PW, PH);

    // Asteroids
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 2;
    for (const ast of asteroids) {
      const r = asteroidRadius(ast.size) * PW;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rr = r * (0.8 + 0.2 * Math.sin(ast.id * 7 + i));
        const px = ast.x * PW + Math.cos(a) * rr;
        const py = ast.y * PH + Math.sin(a) * rr;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Bullets
    ctx.fillStyle = "#ff0";
    for (const b of bullets) {
      ctx.beginPath();
      ctx.arc(b.x * PW, b.y * PH, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ship (flickering when invincible)
    const showShip = invincible === 0 || Math.floor(invincible / 4) % 2 === 0;
    if (showShip) {
      const sx = ship.x * PW;
      const sy = ship.y * PH;
      const a = ship.angle;
      const r = 14;

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(a + Math.PI / 2);

      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(-r * 0.6, r * 0.8);
      ctx.lineTo(0, r * 0.4);
      ctx.lineTo(r * 0.6, r * 0.8);
      ctx.closePath();
      ctx.stroke();

      // Thrust flame
      if (state.thrusting) {
        ctx.strokeStyle = "#f84";
        ctx.beginPath();
        ctx.moveTo(-5, r * 0.4);
        ctx.lineTo(0, r * 1.4);
        ctx.lineTo(5, r * 0.4);
        ctx.stroke();
      }

      ctx.restore();
    }
  }, [state]);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          dispatch({ type: "rotate", dir: "left" } as AsteroidsAction);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          dispatch({ type: "rotate", dir: "right" } as AsteroidsAction);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          dispatch({ type: "thrust", on: true } as AsteroidsAction);
          break;
        case " ":
        case "Spacebar":
          e.preventDefault();
          dispatch({ type: "fire" } as AsteroidsAction);
          break;
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          dispatch({ type: "rotate", dir: null } as AsteroidsAction);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dispatch({ type: "rotate", dir: null } as AsteroidsAction);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          dispatch({ type: "thrust", on: false } as AsteroidsAction);
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [dispatch]);

  const terminal = isTerminal(state);
  const maxLives = 3;

  return (
    <div className="asteroids-game">
      <div className="asteroids-header">
        <span>Score: {state.score}</span>
        <div className="asteroids-lives">
          {Array.from({ length: maxLives }, (_, i) => (
            <span
              key={i}
              className={`asteroids-life${i >= state.lives ? " asteroids-life--lost" : ""}`}
            />
          ))}
        </div>
        <span>Rocks: {state.asteroids.length}</span>
      </div>

      <div className="asteroids-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="asteroids-canvas"
          width={PW}
          height={PH}
        />

        {terminal && (
          <div className="asteroids-overlay">
            <h2>{state.won ? "Cleared!" : "Game Over"}</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>

      <div className="asteroids-hint">
        ← → Rotate · ↑/W Thrust · Space Fire
      </div>
    </div>
  );
}
