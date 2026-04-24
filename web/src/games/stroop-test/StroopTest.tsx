import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StroopTestState, ColorName } from "./state.js";
import { isTerminal, calcScore } from "./state.js";
import type { stroopTestSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./StroopTest.css";

type StroopTestSettings = SettingsOf<typeof stroopTestSettings>;

const COLOR_MAP: Record<ColorName, string> = {
  red: "#e53e3e",
  green: "#38a169",
  blue: "#3182ce",
  yellow: "#d69e2e",
  purple: "#805ad5",
  orange: "#dd6b20",
};

const ALL_COLORS: ColorName[] = ["red", "green", "blue", "yellow", "purple", "orange"];

export function StroopTest({
  state,
  dispatch,
  onGameOver,
}: GameProps<StroopTestState, StroopTestSettings>): JSX.Element {
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

  const card = state.deck[state.currentIndex];
  const total = state.correct + state.incorrect;
  const acc = total === 0 ? 100 : Math.round((state.correct / total) * 100);

  return (
    <div className="stroop-test">
      <div className="st-info">
        <span>Card: <strong>{state.currentIndex}/{state.deck.length}</strong></span>
        <span>Correct: <strong>{state.correct}</strong></span>
        <span>Accuracy: <strong>{acc}%</strong></span>
        <span>Score: <strong>{calcScore(state)}</strong></span>
      </div>

      {state.lastResult && (
        <div className={`st-result ${state.lastResult}`}>
          {state.lastResult === "correct" ? "Correct!" : "Wrong!"}
        </div>
      )}

      {terminal ? (
        <div className="st-ended">
          Done! Correct: {state.correct}/{state.deck.length} · Score: {terminal.score}
        </div>
      ) : card ? (
        <>
          <div
            className="st-card"
            style={{ color: COLOR_MAP[card.ink] }}
          >
            {card.word.toUpperCase()}
          </div>
          <div className="st-prompt">What color is the ink?</div>
          <div className="st-buttons">
            {ALL_COLORS.map(color => (
              <button
                key={color}
                className="st-btn"
                style={{ background: COLOR_MAP[color] }}
                onClick={() => dispatch({ type: "answer", color })}
              >
                {color}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
