import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TypingQuotesState } from "./state.js";
import { isTerminal, calcScore } from "./state.js";
import type { typingQuotesSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./TypingQuotes.css";

type TypingQuotesSettings = SettingsOf<typeof typingQuotesSettings>;

export function TypingQuotes({
  state,
  dispatch,
  onGameOver,
}: GameProps<TypingQuotesState, TypingQuotesSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (terminal) {
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (!terminal) inputRef.current?.focus();
  }, [terminal]);

  const chars = state.quote.split("").map((ch, i) => {
    const typed = state.typed[i];
    if (typed === undefined) return { ch, status: "pending" };
    return { ch, status: typed === ch ? "correct" : "wrong" };
  });

  const elapsed =
    state.startTime && state.endTime
      ? (state.endTime - state.startTime) / 1000
      : state.startTime
        ? (Date.now() - state.startTime) / 1000
        : 0;

  const wpm =
    elapsed > 0.5
      ? Math.round((state.quote.trim().split(/\s+/).length / elapsed) * 60)
      : 0;

  const acc =
    state.typed.length === 0
      ? 100
      : Math.round(
          (state.typed.split("").filter((c, i) => c === state.quote[i]).length /
            state.typed.length) *
            100,
        );

  return (
    <div className="typing-quotes">
      <div className="tq-info">
        <span>Time: <strong>{elapsed.toFixed(1)}s</strong></span>
        <span>WPM: <strong>{wpm}</strong></span>
        <span>Accuracy: <strong>{acc}%</strong></span>
        <span>Score: <strong>{calcScore(state)}</strong></span>
      </div>

      <div className="tq-quote">
        {chars.map(({ ch, status }, i) => (
          <span key={i} className={`tq-char ${status}`}>
            {ch}
          </span>
        ))}
      </div>

      <div className="tq-progress-bar">
        <div
          className="tq-progress-fill"
          style={{ width: `${(state.typed.length / state.quote.length) * 100}%` }}
        />
      </div>

      {terminal ? (
        <div className="tq-ended">
          Done! {elapsed.toFixed(1)}s · WPM: {wpm} · Accuracy: {acc}% · Score: {terminal.score}
        </div>
      ) : (
        <textarea
          ref={inputRef}
          className="tq-input"
          value={state.typed}
          onChange={(e) => dispatch({ type: "type", text: e.target.value, now: performance.now() })}
          placeholder="Start typing the quote…"
          autoFocus
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
      )}
    </div>
  );
}
