import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HeadsUpState, HeadsUpAction, HeadsUpSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HeadsUp({ state, dispatch, onGameOver }: GameProps<HeadsUpState, HeadsUpSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "tick" } as HeadsUpAction);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="hu-wrap">
        <div className="hu-done">
          <h2>Time's Up!</h2>
          <p>Guessed: <strong>{state.guessed}</strong> | Skipped: <strong>{state.skipped}</strong></p>
          <p>Score: {state.guessed}</p>
        </div>
      </div>
    );
  }

  const word = state.words[state.currentIndex]!;
  const timerClass = state.timeLeft <= 5 ? "danger" : state.timeLeft <= 15 ? "warn" : "";

  return (
    <div className="hu-wrap">
      <div className="hu-header">
        <span className="hu-guessed">Guessed: {state.guessed}</span>
        <span>Skipped: {state.skipped}</span>
      </div>
      <div className={`hu-timer ${timerClass}`}>{state.timeLeft}s</div>
      <div className="hu-card">{word}</div>
      <p className="hu-hint">Hold the phone to your forehead — friends describe the word without saying it!</p>
      <div className="hu-buttons">
        <button data-testid="hint-target-heads-up-action" className="hu-btn-correct" onClick={() => dispatch({ type: "correct" } as HeadsUpAction)}>
          Got It!
        </button>
        <button className="hu-btn-skip" onClick={() => dispatch({ type: "skip" } as HeadsUpAction)}>
          Skip
        </button>
      </div>
    </div>
  );
}
