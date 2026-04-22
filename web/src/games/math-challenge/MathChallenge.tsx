import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MathChallengeState } from "./state.js";
import { isTerminal } from "./state.js";
import type { mathChallengeSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./MathChallenge.css";

type MathChallengeSettings = SettingsOf<typeof mathChallengeSettings>;

export function MathChallenge({
  state,
  dispatch,
  onGameOver,
}: GameProps<MathChallengeState, MathChallengeSettings>): JSX.Element {
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

  // Focus input when problem changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [state.problem.display]);

  const duration = parseInt(state.settings.duration, 10);
  const timeLeft = Math.max(0, duration - state.elapsed);
  const pct = (timeLeft / duration) * 100;
  const problemPct = Math.max(0, (1 - state.problemElapsed / 5) * 100);
  const accuracy = state.attempted > 0 ? Math.round((state.correct / state.attempted) * 100) : 100;

  return (
    <div className="math-challenge">
      <div className="mc-info">
        <span>Score: <strong>{state.score}</strong></span>
        <span>Accuracy: <strong>{accuracy}%</strong></span>
        <span>Time: <strong>{timeLeft.toFixed(0)}s</strong></span>
      </div>

      <div className="mc-timer-bar">
        <div className="mc-timer-fill" style={{ width: `${pct}%` }} />
      </div>

      {terminal ? (
        <div className="mc-ended">
          Done! Score: {terminal.score} · {state.correct}/{state.attempted} correct
        </div>
      ) : (
        <>
          <div className="mc-problem">{state.problem.display}</div>

          <div className="mc-problem-bar-wrap">
            <div className="mc-problem-bar" style={{ width: `${problemPct}%` }} />
          </div>

          <form
            className="mc-form"
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({ type: "submit" });
            }}
          >
            <input
              ref={inputRef}
              className="mc-input"
              type="text"
              inputMode="numeric"
              value={state.typed}
              onChange={(e) => dispatch({ type: "type", text: e.target.value })}
              placeholder="Answer"
              autoFocus
              autoComplete="off"
            />
            <button type="submit" className="mc-submit">Enter</button>
          </form>
        </>
      )}
    </div>
  );
}
