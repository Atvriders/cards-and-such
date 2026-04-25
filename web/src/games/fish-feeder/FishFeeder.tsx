import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FishFeederState, FishFeederSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./FishFeeder.css";

const W = 500;
const H = 380;

export function FishFeeder({
  state,
  dispatch,
  onGameOver,
}: GameProps<FishFeederState, FishFeederSettings>): JSX.Element {
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
    dispatch({ type: "move", x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }
  function onTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = e.touches[0]; if (!t) return;
    dispatch({ type: "move", x: (t.clientX - rect.left) / rect.width, y: (t.clientY - rect.top) / rect.height });
  }

  const { player, fishes } = state;

  return (
    <div className="fish-feeder">
      <div className="ff-hud">
        <span>Score: {state.score}</span>
        <span>Size: {(player.size * 100).toFixed(0)}%</span>
      </div>
      <div
        className="ff-ocean"
        style={{ width: W, height: H }}
        onMouseMove={onMouseMove}
        onTouchMove={onTouchMove}
      >
        {fishes.map((f) => {
          const px = f.size * W * 5;
          const isSmall = f.size < player.size;
          return (
            <div
              key={f.id}
              className={`ff-fish ${isSmall ? "ff-fish--small" : "ff-fish--big"}`}
              style={{
                left: f.x * W - px / 2,
                top: f.y * H - px / 2,
                width: px,
                height: px * 0.6,
                fontSize: px * 0.7,
              }}
            >
              {f.vx >= 0 ? "🐟" : "🐠"}
            </div>
          );
        })}
        <div
          className="ff-player"
          style={{
            left: player.x * W - (player.size * W * 5) / 2,
            top: player.y * H - (player.size * H * 5 * 0.6) / 2,
            width: player.size * W * 5,
            height: player.size * H * 5 * 0.6,
            fontSize: player.size * W * 5 * 0.7,
          }}
        >
          🐡
        </div>
        {terminal && (
          <div className="ff-overlay">
            <h2>Eaten!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="ff-hint">Move mouse/touch to guide your fish · Eat smaller fish, avoid bigger ones</div>
    </div>
  );
}
