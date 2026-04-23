import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoodleJumpState, DoodleJumpAction, DoodleJumpSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 360;
const PH = 540;

export function DoodleJumpGame({
  state,
  dispatch,
}: GameProps<DoodleJumpState, DoodleJumpSettings>): JSX.Element {
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
        dispatch({ type: "tick", dt } as DoodleJumpAction);
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
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { e.preventDefault(); dispatch({ type: "dir", dir: -1 } as DoodleJumpAction); }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { e.preventDefault(); dispatch({ type: "dir", dir: 1 } as DoodleJumpAction); }
    }
    function up(e: KeyboardEvent) {
      if (["ArrowLeft","a","A","ArrowRight","d","D"].includes(e.key)) dispatch({ type: "dir", dir: 0 } as DoodleJumpAction);
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

    const worldToScreen = (worldY: number) => (worldY - state.cameraY) * PH;

    ctx.fillStyle = "#e8f8ff";
    ctx.fillRect(0, 0, PW, PH);

    // Platforms
    state.platforms.forEach((p) => {
      const sx = p.x * PW;
      const sy = worldToScreen(p.y);
      const sw = p.w * PW;
      const sh = 10;
      ctx.fillStyle = "#4caf50";
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = "#388e3c";
      ctx.fillRect(sx, sy, sw, 3);
    });

    // Player
    const px = (state.playerX - 0.03) * PW;
    const py = worldToScreen(state.playerY - 0.03);
    const pw2 = 0.06 * PW;
    const ph2 = 0.06 * PH;
    ctx.fillStyle = "#ff6600";
    ctx.fillRect(px, py, pw2, ph2);
    // Eyes
    ctx.fillStyle = "#fff";
    ctx.fillRect(px + 4, py + 5, 6, 6);
    ctx.fillRect(px + pw2 - 10, py + 5, 6, 6);
    ctx.fillStyle = "#000";
    ctx.fillRect(px + 6, py + 7, 3, 3);
    ctx.fillRect(px + pw2 - 8, py + 7, 3, 3);

    // Score
    ctx.fillStyle = "#224";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`Height: ${state.score}`, 8, 22);
  });

  const terminal = isTerminal(state);

  return (
    <div className="doodle-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="doodle-canvas"
          width={PW}
          height={PH}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Game Over</h2>
            <p>Height: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button className="arcade-btn"
          onPointerDown={() => dispatch({ type: "dir", dir: -1 } as DoodleJumpAction)}
          onPointerUp={() => dispatch({ type: "dir", dir: 0 } as DoodleJumpAction)}
          onPointerLeave={() => dispatch({ type: "dir", dir: 0 } as DoodleJumpAction)}
        >← Left</button>
        <button className="arcade-btn"
          onPointerDown={() => dispatch({ type: "dir", dir: 1 } as DoodleJumpAction)}
          onPointerUp={() => dispatch({ type: "dir", dir: 0 } as DoodleJumpAction)}
          onPointerLeave={() => dispatch({ type: "dir", dir: 0 } as DoodleJumpAction)}
        >Right →</button>
      </div>
      <div className="arcade-hint">Arrow keys or A/D to move. Land on platforms to jump higher!</div>
    </div>
  );
}
