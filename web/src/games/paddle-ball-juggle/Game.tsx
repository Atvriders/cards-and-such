import { useEffect, useRef, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PaddleBallState, PaddleBallAction, PaddleBallSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const PW = 400;
const PH = 500;

export function PaddleBallJuggleGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<PaddleBallState, PaddleBallSettings>): JSX.Element {
  const stateRef = useRef(state);
  stateRef.current = state;
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const endedRef = useRef(false);

  const tick = useCallback(
    (now: number) => {
      const s = stateRef.current;
      if (s.over) { rafRef.current = null; lastRef.current = null; return; }
      if (lastRef.current !== null) {
        const dt = Math.min((now - lastRef.current) / 1000, 0.05);
        dispatch({ type: "tick", dt } as PaddleBallAction);
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

  // Mouse/touch move
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      dispatch({ type: "movePaddle", x } as PaddleBallAction);
    }
    function onTouch(e: TouchEvent) {
      const touch = e.touches[0];
      if (touch) {
        const rect = canvas!.getBoundingClientRect();
        const x = (touch.clientX - rect.left) / rect.width;
        dispatch({ type: "movePaddle", x } as PaddleBallAction);
      }
    }
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    return () => { canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("touchmove", onTouch); };
  }, [dispatch]);

  useEffect(() => {
    function dn(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "a") { e.preventDefault(); dispatch({ type: "tapLeft" } as PaddleBallAction); }
      if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); dispatch({ type: "tapRight" } as PaddleBallAction); }
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

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, PW, PH);

    // Power-ups
    state.powerUps.forEach((p) => {
      const px2 = p.x * PW;
      const py = p.y * PH;
      const colors: Record<string, string> = { wide: "#4f4", multiball: "#f8f", slow: "#48f" };
      ctx.fillStyle = colors[p.kind] ?? "#fff";
      ctx.fillRect(px2 - 15, py - 8, 30, 16);
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.kind === "wide" ? "W+" : p.kind === "multiball" ? "+B" : "SLO", px2, py + 4);
    });
    ctx.textAlign = "left";

    // Balls
    state.balls.forEach((b) => {
      ctx.fillStyle = "#ff8";
      ctx.beginPath();
      ctx.arc(b.x * PW, b.y * PH, b.r * PH, 0, Math.PI * 2);
      ctx.fill();
    });

    // Paddle
    const pLeft = (state.paddleX - state.paddleW / 2) * PW;
    const pTop = 0.92 * PH - 0.025 * PH;
    const pW = state.paddleW * PW;
    const pH = 0.025 * PH;
    const grad = ctx.createLinearGradient(pLeft, pTop, pLeft, pTop + pH);
    grad.addColorStop(0, "#66aaff");
    grad.addColorStop(1, "#224488");
    ctx.fillStyle = grad;
    ctx.fillRect(pLeft, pTop, pW, pH);

    // HUD
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(`Score: ${state.score}`, 8, 22);
    ctx.fillText(`Lives: ${"♥".repeat(state.lives)}`, 8, 44);
    ctx.fillText(`Balls: ${state.balls.length}`, 8, 66);
  });

  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  return (
    <div className="paddle-game">
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          className="paddle-canvas"
          width={PW}
          height={PH}
        />
        {terminal && (
          <div className="arcade-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="arcade-controls">
        <button className="arcade-btn"
          onPointerDown={() => dispatch({ type: "tapLeft" } as PaddleBallAction)}
        >← Left</button>
        <button className="arcade-btn"
          onPointerDown={() => dispatch({ type: "tapRight" } as PaddleBallAction)}
        >Right →</button>
      </div>
      <div className="arcade-hint">Move mouse over canvas or use ←/→ arrow keys. Catch power-ups!</div>
    </div>
  );
}
