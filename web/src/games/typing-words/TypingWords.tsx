import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TypingWordsState } from "./state.js";
import { isTerminal } from "./state.js";
import type { typingWordsSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TypingWords.css";

type TypingWordsSettings = SettingsOf<typeof typingWordsSettings>;

const VISIBLE_AHEAD = 8;

export function TypingWords({
  state,
  dispatch,
  onGameOver,
}: GameProps<TypingWordsState, TypingWordsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    if (!terminal) inputRef.current?.focus();
  }, [terminal]);

  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);
  const pct = (timeLeft / duration) * 100;

  const visibleWords = state.words.slice(state.currentIndex, state.currentIndex + VISIBLE_AHEAD);
  const total = state.correct + state.incorrect;
  const acc = total === 0 ? 100 : Math.round((state.correct / total) * 100);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      dispatch({ type: "submit" });
    }
  };

  return (
    <div className="typing-words">
      <div className="tw-info">
        <span>Time: <strong>{timeLeft.toFixed(0)}s</strong></span>
        <span>Correct: <strong>{state.correct}</strong></span>
        <span>Accuracy: <strong>{acc}%</strong></span>
      </div>

      <div className="tw-timer-bar">
        <div className="tw-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      <div className="tw-word-stream">
        {visibleWords.map((word, i) => (
          <span
            key={state.currentIndex + i}
            className={`tw-word${i === 0 ? " tw-word-current" : ""}`}
          >
            {word}
          </span>
        ))}
      </div>

      {terminal ? (
        <div className="tw-ended">
          Done! Correct: {state.correct} · Accuracy: {acc}% · Score: {terminal.score}
        </div>
      ) : (
        <input
          ref={inputRef}
          className="tw-input"
          type="text"
          value={state.input}
          onChange={(e) => dispatch({ type: "type", text: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Type here…"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      )}
    </div>
  );
}
