import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SamuraiSliceState, SamuraiSliceSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./SamuraiSlice.css";

const W = 420;
const H = 480;

export function SamuraiSlice({
  state,
  dispatch,
  onGameOver,
}: GameProps<SamuraiSliceState, SamuraiSliceSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (terminal) { onGameOver(terminal.score); return; }
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
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

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    dispatch({ type: "slice", x, y });
  }
  function handleTouch(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i]!;
      dispatch({ type: "slice", x: (t.clientX - rect.left) / rect.width, y: (t.clientY - rect.top) / rect.height });
    }
  }

  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);

  return (
    <div className="samurai-slice">
      <div className="ss-hud">
        <span>Score: {state.score}</span>
        <span>{"❤️".repeat(state.lives)}</span>
        <span>{timeLeft.toFixed(1)}s</span>
      </div>
      <div
        className="ss-field"
        style={{ width: W, height: H }}
        onClick={handleClick}
        onTouchStart={handleTouch}
      >
        {state.targets.map((t) => (
          <div
            key={t.id}
            className={`ss-target ${t.sliced ? "ss-target--sliced" : ""} ${t.kind === "bomb" ? "ss-target--bomb" : ""}`}
            style={{ left: t.x * W - 24, top: t.y * H - 24, fontSize: 36 }}
          >
            {t.kind === "bomb" ? "💣" : "🍎"}
          </div>
        ))}
        {terminal && (
          <div className="ss-overlay">
            <h2>Time Up!</h2>
            <p>Score: {terminal.score}</p>
          </div>
        )}
      </div>
      <div className="ss-hint">Click/tap to slash · Slice fruit, avoid bombs</div>
    </div>
  );
}
