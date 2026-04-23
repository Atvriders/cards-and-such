import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WallJumperState, WallJumperAction, WallJumperSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 360;
const PH = 480;

export function WallJumperGame({
  state,
  dispatch,
}: GameProps<WallJumperState, WallJumperSettings>): JSX.Element {
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
        dispatch({ type: "tick", dt } as WallJumperAction);
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
      if (e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        dispatch({ type: "jump" } as WallJumperAction);
      }
    }
    window.addEventListener("keydown", dn);
    return () => window.removeEventListener("keydown", dn);
  }, [dispatch]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, PW, PH);

    // Walls
    const wallW = 30;
    ctx.fillStyle = "#4a7";
    ctx.fillRect(0, 0, wallW, PH);
    ctx.fillRect(PW - wallW, 0, wallW, PH);

    // Targets
    state.targets.forEach((t) => {
      const tx = t.wall === 0 ? wallW : PW - wallW - t.wall * 0 - 0.12 * PW;
      const ty = t.y * PH;
      const tw = 0.12 * PW;
      const th = 0.07 * PH;
      const colors: string[] = ["#ff6", "#f90", "#f44"];
      ctx.fillStyle = colors[t.points - 1] ?? "#fff";
      ctx.fillRect(tx, ty - th / 2, tw, th);
      ctx.fillStyle = "#000";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${t.points}`, tx + tw / 2, ty + 5);
    });
    ctx.textAlign = "left";

    // Player
    const playerX = state.jumping
      ? (state.playerWall === 0
          ? state.jumpProgress * (PW - wallW * 2 - 20)
          : (PW - wallW * 2 - 20) * (1 - state.jumpProgress)) + wallW + 10
      : state.playerWall === 0 ? wallW + 2 : PW - wallW - 22;
    const playerY = state.playerY * PH;
    ctx.fillStyle = "#58f";
    ctx.fillRect(playerX, playerY - 15, 20, 30);

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(`Score: ${state.score}`, 8, 22);
    ctx.fillText(`Lives: ${"♥".repeat(state.lives)}`, 8, 44);
  });

  const terminal = isTerminal(state);

  return (
    <div className="walljumper-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="walljumper-canvas"
          width={PW}
          height={PH}
          onClick={() => dispatch({ type: "jump" } as WallJumperAction)}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button className="arcade-btn" onClick={() => dispatch({ type: "jump" } as WallJumperAction)}>
          Jump →
        </button>
      </div>
      <div className="arcade-hint">Tap / Space / Arrow keys to jump between walls. Hit the colored targets!</div>
    </div>
  );
}
