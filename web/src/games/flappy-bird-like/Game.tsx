import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FlappyBirdState, FlappyBirdAction, FlappyBirdSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 400;
const PH = 400;

export function FlappyBirdGame({
  state,
  dispatch,
}: GameProps<FlappyBirdState, FlappyBirdSettings>): JSX.Element {
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
        dispatch({ type: "tick", dt } as FlappyBirdAction);
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
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dispatch({ type: "flap" } as FlappyBirdAction);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Sky
    ctx.fillStyle = "#87ceeb";
    ctx.fillRect(0, 0, PW, PH);

    // Pipes
    const PIPE_W = 0.075 * PW;
    const PIPE_GAP = 0.22 * PH;
    state.pipes.forEach((p) => {
      const px = p.x * PW;
      const gapCY = p.gapY * PH;
      const gapTop = gapCY - PIPE_GAP / 2;
      const gapBot = gapCY + PIPE_GAP / 2;
      ctx.fillStyle = "#3a8c3a";
      // Top pipe
      ctx.fillRect(px, 0, PIPE_W, gapTop);
      ctx.fillStyle = "#2d6e2d";
      ctx.fillRect(px - 3, gapTop - 18, PIPE_W + 6, 18);
      // Bottom pipe
      ctx.fillStyle = "#3a8c3a";
      ctx.fillRect(px, gapBot, PIPE_W, PH - gapBot);
      ctx.fillStyle = "#2d6e2d";
      ctx.fillRect(px - 3, gapBot, PIPE_W + 6, 18);
    });

    // Bird
    const bx = 0.18 * PW;
    const by = state.birdY * PH;
    const br = 0.025 * PH;
    ctx.fillStyle = "#ffdd00";
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff8800";
    ctx.beginPath();
    ctx.moveTo(bx + br * 0.5, by);
    ctx.lineTo(bx + br * 1.3, by - br * 0.3);
    ctx.lineTo(bx + br * 1.3, by + br * 0.3);
    ctx.closePath();
    ctx.fill();
    // Eye
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(bx + br * 0.3, by - br * 0.3, br * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${state.score}`, PW / 2, 36);
    ctx.textAlign = "left";
  });

  const terminal = isTerminal(state);

  return (
    <div className="flappy-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="flappy-canvas"
          data-testid="hint-target-flappy-canvas"
          width={PW}
          height={PH}
          onClick={() => dispatch({ type: "flap" } as FlappyBirdAction)}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score} pipes</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button
          className="arcade-btn"
          data-testid="hint-target-flappy-flap"
          onClick={() => dispatch({ type: "flap" } as FlappyBirdAction)}
        >
          Flap ↑
        </button>
      </div>
      <div className="arcade-hint">Space / Up / Tap = flap. Avoid the pipes!</div>
    </div>
  );
}
