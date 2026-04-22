import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TypingSpeedState } from "./state.js";
import { isTerminal, calcScore } from "./state.js";
import type { typingSpeedSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TypingSpeed.css";

type TypingSpeedSettings = SettingsOf<typeof typingSpeedSettings>;

export function TypingSpeed({
  state,
  dispatch,
  onGameOver,
}: GameProps<TypingSpeedState, TypingSpeedSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

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

  // Compute per-char correctness for highlighting
  const chars = state.paragraph.split("").map((ch, i) => {
    const typed = state.typed[i];
    if (typed === undefined) return { ch, status: "pending" };
    return { ch, status: typed === ch ? "correct" : "wrong" };
  });

  const wpm = state.elapsed > 1
    ? Math.round((state.typed.trim().split(/\s+/).filter(Boolean).length / state.elapsed) * 60)
    : 0;

  const acc =
    state.typed.length === 0
      ? 100
      : Math.round(
          (state.typed.split("").filter((c, i) => c === state.paragraph[i]).length /
            state.typed.length) *
            100,
        );

  return (
    <div className="typing-speed">
      <div className="ts-info">
        <span>Time: <strong>{timeLeft.toFixed(0)}s</strong></span>
        <span>WPM: <strong>{wpm}</strong></span>
        <span>Accuracy: <strong>{acc}%</strong></span>
        <span>Score: <strong>{calcScore(state)}</strong></span>
      </div>

      <div className="ts-timer-bar">
        <div className="ts-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="ts-paragraph">
        {chars.map(({ ch, status }, i) => (
          <span key={i} className={`ts-char ${status}`}>
            {ch}
          </span>
        ))}
      </div>

      {terminal ? (
        <div className="ts-ended">
          Done! WPM: {wpm} · Accuracy: {acc}% · Score: {terminal.score}
        </div>
      ) : (
        <textarea
          ref={inputRef}
          className="ts-input"
          value={state.typed}
          onChange={(e) => dispatch({ type: "type", text: e.target.value })}
          placeholder="Start typing here…"
          autoFocus
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      )}
    </div>
  );
}
