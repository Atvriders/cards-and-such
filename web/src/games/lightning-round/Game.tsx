import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LightningRoundState, LightningRoundAction, LightningRoundSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function LightningRound({ state, dispatch, onGameOver }: GameProps<LightningRoundState, LightningRoundSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "tick" } as LightningRoundAction);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "countdown") {
    const timeLimit = state.settings.timeLimit;
    return (
      <div className="lr-wrap">
        <div className="lr-countdown">
          <h2>Lightning Round</h2>
          <p>Answer 30 multiple-choice trivia questions in {timeLimit} seconds. No penalty for wrong answers — just click fast!</p>
          <button className="lr-start-btn" onClick={() => dispatch({ type: "start" } as LightningRoundAction)}>
            Start!
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "done") {
    const total = state.questions.length;
    return (
      <div className="lr-wrap">
        <div className="lr-done">
          <h2>Time's Up!</h2>
          <div className="lr-done-score">{state.score} / {total}</div>
          <p className="lr-done-sub">
            You answered {state.score} correctly out of {state.questionIndex + 1} questions reached.
          </p>
          <p className="lr-done-sub">
            {state.score >= 25 ? "Outstanding!" : state.score >= 18 ? "Great job!" : state.score >= 10 ? "Good effort!" : "Keep practising!"}
          </p>
        </div>
      </div>
    );
  }

  const q = state.questions[state.questionIndex]!;
  const timeLimit = parseInt(state.settings.timeLimit);
  const progress = (state.questionIndex / state.questions.length) * 100;
  const isWarning = state.timeLeft <= 10;

  return (
    <div className="lr-wrap">
      <div className="lr-header">
        <span className="lr-title">Lightning Round</span>
        <div className="lr-score-time">
          <span className="lr-score">{state.score} pts</span>
          <span className={`lr-time ${isWarning ? "warning" : ""}`}>{state.timeLeft}s</span>
        </div>
      </div>

      <div className="lr-progress">
        <div className="lr-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="lr-category">{q.category} — Q{state.questionIndex + 1}/{state.questions.length}</div>

      <div className="lr-question">{q.question}</div>

      <div className="lr-options">
        {q.options.map((opt, i) => (
          <button
            key={i}
            className="lr-option"
            onClick={() => dispatch({ type: "answer", choice: i as 0 | 1 | 2 | 3 } as LightningRoundAction)}
          >
            {opt}
          </button>
        ))}
      </div>

      {state.lastCorrect !== null && (
        <div className={`lr-feedback ${state.lastCorrect ? "correct" : "wrong"}`}>
          {state.lastCorrect ? "Correct!" : "Wrong!"}
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "#888" }}>
        Time limit: {timeLimit}s
      </div>
    </div>
  );
}
