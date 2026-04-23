import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TapRunnerState, TapRunnerAction, TapRunnerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 480;
const PH = 220;
const GROUND_Y = 0.38;
const SCALE_Y = PH / 0.5;
const SCALE_X = PW;

function gameYtoScreenY(y: number): number {
  return PH - (GROUND_Y + y) * SCALE_Y;
}

export function TapRunnerGame({
  state,
  dispatch,
}: GameProps<TapRunnerState, TapRunnerSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over) { rafRef.current = null; lastRef.current = null; return; }
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as TapRunnerAction);
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
      if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); dispatch({ type: "tapDown" } as TapRunnerAction); }
    }
    function up(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp") dispatch({ type: "tapUp" } as TapRunnerAction);
    }
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [dispatch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const groundScreenY = gameYtoScreenY(0);

    ctx.fillStyle = "#d4eeff";
    ctx.fillRect(0, 0, PW, groundScreenY);
    ctx.fillStyle = "#8b7";
    ctx.fillRect(0, groundScreenY, PW, PH - groundScreenY);
    ctx.fillStyle = "#5a8";
    ctx.fillRect(0, groundScreenY, PW, 4);

    // Obstacles
    state.obstacles.forEach((obs) => {
      const ox = obs.x * SCALE_X;
      const ow = obs.w * SCALE_X;
      const oh = obs.h * SCALE_Y;
      ctx.fillStyle = obs.kind === "low" ? "#e65" : "#c33";
      ctx.fillRect(ox, groundScreenY - oh, ow, oh);
    });

    // Player
    const px = 0.12 * SCALE_X;
    const py = gameYtoScreenY(state.playerY + 0.10);
    const pw2 = 0.04 * SCALE_X;
    const ph2 = 0.10 * SCALE_Y;
    ctx.fillStyle = state.holding && state.playerY > 0.01 ? "#88f" : "#44c";
    ctx.fillRect(px, py, pw2, ph2);

    // Glide wings
    if (state.holding && state.playerY > 0.01) {
      ctx.fillStyle = "#aaf";
      ctx.fillRect(px - 12, py + 5, 12, 4);
      ctx.fillRect(px + pw2, py + 5, 12, 4);
    }

    ctx.fillStyle = "#224";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(`${Math.floor(state.distance * 100)}m`, 8, 18);
  });

  const terminal = isTerminal(state);

  return (
    <div className="tap-runner-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="tap-runner-canvas"
          width={PW}
          height={PH}
          onPointerDown={() => dispatch({ type: "tapDown" } as TapRunnerAction)}
          onPointerUp={() => dispatch({ type: "tapUp" } as TapRunnerAction)}
          onPointerLeave={() => dispatch({ type: "tapUp" } as TapRunnerAction)}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Game Over</h2>
            <p>Distance: {terminal.score}m</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button className="arcade-btn"
          onPointerDown={() => dispatch({ type: "tapDown" } as TapRunnerAction)}
          onPointerUp={() => dispatch({ type: "tapUp" } as TapRunnerAction)}
          onPointerLeave={() => dispatch({ type: "tapUp" } as TapRunnerAction)}
        >Tap / Hold</button>
      </div>
      <div className="arcade-hint">Tap = jump. Hold = glide over tall obstacles. Avoid all blocks!</div>
    </div>
  );
}
