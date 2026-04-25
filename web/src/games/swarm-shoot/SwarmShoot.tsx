import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SwarmShootState, SwarmShootSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SwarmShoot.css";

const W = 440;
const H = 480;
const PLAYER_Y_FRAC = 0.9;

export function SwarmShoot({
  state,
  dispatch,
  onGameOver,
}: GameProps<SwarmShootState, SwarmShootSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const autoShootRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const keys = keysRef.current;
      const dx = (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) ? -1
               : (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) ? 1 : 0;
      if (dx !== 0) dispatch({ type: "move", x: state.playerX + dx * 0.5 * dt });
      if (keys.has(" ") || keys.has("ArrowUp")) dispatch({ type: "shoot" });
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [terminal, dispatch, onGameOver, state.playerX]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { keysRef.current.add(e.key); if (e.key === " ") e.preventDefault(); };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch({ type: "move", x: (e.clientX - rect.left) / rect.width });
  }
  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = e.touches[0]; if (!t) return;
    dispatch({ type: "move", x: (t.clientX - rect.left) / rect.width });
    dispatch({ type: "shoot" });
  }

  const { bullets, enemies, playerX } = state;

  return (
    <div className="swarm-shoot">
      <div className="ss2-hud">
        <span>Score: {state.score}</span>
        <span>Wave {state.wave}</span>
        <span>{"❤️".repeat(state.lives)}</span>
      </div>
      <div
        className="ss2-field"
        style={{ width: W, height: H }}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
        onClick={() => dispatch({ type: "shoot" })}
      >
        {enemies.map((e) => (
          <div
            key={e.id}
            className="ss2-enemy"
            style={{ left: e.x * W - 18, top: e.y * H - 18 }}
          >
            👾
          </div>
        ))}
        {bullets.map((b) => (
          <div
            key={b.id}
            className="ss2-bullet"
            style={{ left: b.x * W - 3, top: b.y * H }}
          />
        ))}
        <div
          className="ss2-player"
          style={{ left: playerX * W - 18, top: PLAYER_Y_FRAC * H - 18 }}
        >
          🚀
        </div>
        {terminal && (
          <div className="ss2-overlay">
            <h2>Game Over</h2>
            <p>Wave {state.wave} · Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="ss2-hint">Mouse/touch to aim · Click or Space to shoot · A/D arrows to move</div>
    </div>
  );
}
