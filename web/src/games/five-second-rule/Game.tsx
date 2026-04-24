import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FiveSecState, FiveSecAction, FiveSecSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function FiveSecondRule({ state, dispatch, onGameOver }: GameProps<FiveSecState, FiveSecSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase === "playing") {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "tick" } as FiveSecAction);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.phase, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="fsr-wrap">
        <div className="fsr-done">
          <h2>Time's Up!</h2>
          <p>Got: <strong>{state.succeeded}</strong> / Failed: <strong>{state.failed}</strong></p>
          <p>Score: {state.succeeded}</p>
        </div>
      </div>
    );
  }

  const prompt = state.prompts[state.currentIndex]!;
  const timeLimit = parseInt(state.settings.timeLimit, 10);
  const timerClass = state.timeLeft <= 2 ? "warn" : "ok";

  if (state.phase === "result") {
    return (
      <div className="fsr-wrap">
        <div className="fsr-header">
          <span>Round {state.currentIndex + 1} / {state.prompts.length}</span>
          <span className="fsr-score">Got it: {state.succeeded}</span>
        </div>
        <div className={`fsr-result ${state.lastResult === "success" ? "success" : "fail"}`}>
          {state.lastResult === "success" ? "Got it! +1" : "Time's up or passed!"}
        </div>
        <button className="fsr-next-btn" onClick={() => dispatch({ type: "next" } as FiveSecAction)}>
          {state.currentIndex + 1 >= state.prompts.length ? "Finish" : "Next Prompt"}
        </button>
      </div>
    );
  }

  return (
    <div className="fsr-wrap">
      <div className="fsr-header">
        <span>Round {state.currentIndex + 1} / {state.prompts.length}</span>
        <span className="fsr-score">Got it: {state.succeeded}</span>
      </div>
      <div className={`fsr-timer ${timerClass}`}>{state.timeLeft}s</div>
      <div className="fsr-card">{prompt}</div>
      <div className="fsr-buttons">
        <button className="fsr-btn-got" onClick={() => dispatch({ type: "got-it" } as FiveSecAction)}>
          Got It!
        </button>
        <button className="fsr-btn-pass" onClick={() => dispatch({ type: "pass" } as FiveSecAction)}>
          Pass
        </button>
      </div>
      <div style={{ fontSize: "0.85rem", color: "#aaa" }}>Timer resets: {timeLimit}s per round</div>
    </div>
  );
}
