import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FallingCatcherState } from "./state.js";
import { isTerminal } from "./state.js";
import type { fallingCatcherSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./FallingCatcher.css";

type FallingCatcherSettings = SettingsOf<typeof fallingCatcherSettings>;

const W = 400;
const H = 500;
const BASKET_W_PX = 56; // 0.14 * 400

const ITEM_EMOJI: Record<string, string> = {
  coin: "🪙",
  star: "⭐",
  bomb: "💣",
};

export function FallingCatcher({
  state,
  dispatch,
  onGameOver,
}: GameProps<FallingCatcherState, FallingCatcherSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
      return;
    }
    const tick = (now: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = now;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;
      dispatch({ type: "tick", dt });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [terminal, dispatch, onGameOver]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (terminal) return;
      if (e.key === "ArrowLeft") dispatch({ type: "keyMove", dir: "left" });
      if (e.key === "ArrowRight") dispatch({ type: "keyMove", dir: "right" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminal, dispatch]);

  const timeLeft = Math.max(0, 60 - state.elapsed);
  const pct = (timeLeft / 60) * 100;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (terminal) return;
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    dispatch({ type: "move", x });
  };

  const basketLeft = (state.basket - 0.07) * W;

  return (
    <div className="falling-catcher">
      <div className="falling-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Lives: <strong>{"❤️".repeat(state.lives)}</strong></span>
        <span>Time: <strong>{timeLeft.toFixed(0)}s</strong></span>
      </div>

      <div className="falling-timer-bar">
        <div className="falling-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      {terminal && (
        <div className="falling-ended">Done! Score: {terminal.score}</div>
      )}

      <div
        ref={arenaRef}
        className="falling-arena"
        style={{ width: W, height: H }}
        onMouseMove={handleMouseMove}
      >
        {/* Falling items */}
        {state.items.map((item) => (
          <div
            key={item.id}
            className="falling-item"
            style={{ left: item.x * W - 14, top: item.y * H - 14 }}
          >
            {ITEM_EMOJI[item.kind]}
          </div>
        ))}

        {/* Basket */}
        <div
          className="falling-basket"
          style={{ left: basketLeft, top: 0.85 * H, width: BASKET_W_PX }}
        />
      </div>

      <div className="falling-hint">Move mouse or use ← → arrows to move basket</div>
    </div>
  );
}
