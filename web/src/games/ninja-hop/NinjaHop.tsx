import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NinjaHopState, NinjaHopSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./NinjaHop.css";

const W = 340;
const H = 480;

export function NinjaHop({
  state,
  dispatch,
  onGameOver,
}: GameProps<NinjaHopState, NinjaHopSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      const keys = keysRef.current;
      const dx = (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) ? -1
               : (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) ? 1 : 0;
      if (dx !== 0) dispatch({ type: "move", dx });
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        dispatch({ type: "jump" });
      }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [dispatch]);

  const { platforms, playerX, playerY, scrollY } = state;

  return (
    <div className="ninja-hop">
      <div className="nh-hud">
        <span>Score: {state.score}</span>
        <span>Height: {Math.floor(scrollY * 200)}</span>
      </div>
      <div className="nh-field" style={{ width: W, height: H }}>
        <div className="nh-player" style={{ left: playerX * W - 14, top: playerY * H - 28 }}>
          🥷
        </div>
        {platforms.map((p) => {
          const screenY = (p.y + scrollY) * H;
          if (screenY < -10 || screenY > H + 10) return null;
          return (
            <div
              key={p.id}
              className="nh-platform"
              style={{ left: p.x * W, top: screenY, width: p.w * W }}
            />
          );
        })}
        {terminal && (
          <div className="nh-overlay">
            <h2>Fell Down!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="nh-controls">
        <button onPointerDown={() => dispatch({ type: "move", dx: -1 })}>◀</button>
        <button onPointerDown={() => dispatch({ type: "jump" })}>Jump</button>
        <button onPointerDown={() => dispatch({ type: "move", dx: 1 })}>▶</button>
      </div>
      <div className="nh-hint">Arrow keys / WASD · Space to jump</div>
    </div>
  );
}
