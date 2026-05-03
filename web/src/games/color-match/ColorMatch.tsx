import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ColorMatchState } from "./state.js";
import { isTerminal } from "./state.js";
import type { colorMatchSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./ColorMatch.css";

type ColorMatchSettings = SettingsOf<typeof colorMatchSettings>;

export function ColorMatch({
  state,
  dispatch,
  onGameOver,
}: GameProps<ColorMatchState, ColorMatchSettings>): JSX.Element {
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !terminal) {
        e.preventDefault();
        dispatch({ type: "tap" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminal, dispatch]);

  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);
  const pct = (timeLeft / duration) * 100;
  const isMatch = state.currentColor === state.targetColor;

  return (
    <div className="color-match">
      <div className="cm-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Misses: <strong>{state.misses}</strong></span>
        <span>Time: <strong>{timeLeft.toFixed(1)}s</strong></span>
      </div>

      <div className="cm-timer-bar">
        <div className="cm-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="cm-target-banner">
        <span className="cm-label">Target color:</span>
        <div className="cm-swatch" style={{ background: state.targetColor }} />
      </div>

      {terminal ? (
        <div className="cm-ended">Done! Score: {terminal.score}</div>
      ) : (
        <>
          <button data-testid="hint-target-color-match-action"
            className={`cm-circle ${isMatch ? "match" : ""}`}
            style={{ background: state.currentColor }}
            onClick={() => dispatch({ type: "tap" })}
            aria-label="Color circle — tap when it matches the target"
          />
          <div className="cm-hint">Tap the circle (or press Space) when it matches the target color!</div>
        </>
      )}
    </div>
  );
}
