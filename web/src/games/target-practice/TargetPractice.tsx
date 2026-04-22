import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TargetPracticeState } from "./state.js";
import { isTerminal } from "./state.js";
import type { targetPracticeSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TargetPractice.css";

type TargetPracticeSettings = SettingsOf<typeof targetPracticeSettings>;

const ARENA_W = 600;
const ARENA_H = 400;

export function TargetPractice({
  state,
  dispatch,
  onGameOver,
}: GameProps<TargetPracticeState, TargetPracticeSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

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

  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);
  const pct = (timeLeft / duration) * 100;

  return (
    <div className="target-practice">
      <div className="tp-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Misses: <strong>{state.misses}</strong></span>
        <span>Time: <strong>{timeLeft.toFixed(1)}s</strong></span>
      </div>

      <div className="tp-timer-bar">
        <div className="tp-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      {terminal && (
        <div className="tp-ended">Game over! Final score: {terminal.score}</div>
      )}

      <div
        className="tp-arena"
        style={{ width: ARENA_W, height: ARENA_H }}
        onClick={() => !terminal && dispatch({ type: "miss" })}
      >
        {state.targets.map((t) => {
          const pctLife = t.age / t.lifetime;
          const opacity = 1 - pctLife * 0.5;
          return (
            <button
              key={t.id}
              className="tp-target"
              style={{
                left: t.x * ARENA_W - t.radius,
                top: t.y * ARENA_H - t.radius,
                width: t.radius * 2,
                height: t.radius * 2,
                opacity,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!terminal) dispatch({ type: "hit", id: t.id });
              }}
              aria-label="Target"
            />
          );
        })}
      </div>
    </div>
  );
}
