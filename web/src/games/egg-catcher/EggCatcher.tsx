import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EggCatcherState, EggCatcherSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./EggCatcher.css";

const W = 400;
const H = 480;

export function EggCatcher({
  state,
  dispatch,
  onGameOver,
}: GameProps<EggCatcherState, EggCatcherSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.1);
      lastRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    dispatch({ type: "move", x });
  }
  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = e.touches[0];
    if (!t) return;
    const x = (t.clientX - rect.left) / rect.width;
    dispatch({ type: "move", x });
  }

  const basketW = 0.14 * W;
  const basketX = state.basket * W - basketW / 2;
  const basketY = 0.88 * H;

  return (
    <div className="egg-catcher" onMouseMove={onMouseMove} onTouchMove={onTouchMove}>
      <div className="ec-hud">
        <span>Score: {state.score}</span>
        <span>{"❤️".repeat(state.lives)}</span>
        <span>Level {state.level}</span>
      </div>
      <div className="ec-field" style={{ width: W, height: H }}>
        {state.eggs.map((egg) => (
          <div
            key={egg.id}
            className="ec-egg"
            style={{ left: egg.x * W - 12, top: egg.y * H - 16 }}
          >
            🥚
          </div>
        ))}
        <div
          className="ec-basket"
          style={{ left: basketX, top: basketY, width: basketW }}
        />
        {terminal && (
          <div className="ec-overlay">
            <h2>Game Over</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="ec-hint">Move mouse / touch to catch eggs</div>
    </div>
  );
}
