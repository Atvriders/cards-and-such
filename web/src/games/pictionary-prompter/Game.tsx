import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PictionaryState, PictionaryAction, PictionarySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function PictionaryPrompter({ state, dispatch, onGameOver }: GameProps<PictionaryState, PictionarySettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (state.phase !== "playing") {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" } as PictionaryAction);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="pictionary-wrap">
        <div className="pictionary-done bounce-in">
          <h2>Round Over!</h2>
          <p>Completed: <strong style={{ color: "#27ae60" }}>{state.completedCount}</strong></p>
          <p>Skipped: <strong style={{ color: "#e74c3c" }}>{state.skippedCount}</strong></p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f5576c" }}>Score: {state.completedCount}</p>
        </div>
      </div>
    );
  }

  const prompt = state.prompts[state.currentIndex];
  if (!prompt) return <div className="pictionary-wrap">Loading…</div>;
  const urgent = state.timeLeft <= 15;

  return (
    <div className="pictionary-wrap fade-in">
      <div className="pictionary-header">
        <div className="pictionary-stats">
          <span className="pictionary-completed">✓ {state.completedCount}</span>
          <span className="pictionary-skipped">✗ {state.skippedCount}</span>
        </div>
        <span className={`pictionary-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
      </div>

      <div className="pictionary-card">
        <div className="pictionary-category-row">
          <span className="pictionary-cat-badge">{prompt.category}</span>
          <span className={`pictionary-diff-badge ${prompt.difficulty}`}>{prompt.difficulty}</span>
        </div>
        <div className="pictionary-card-label">Draw this!</div>
        <div className="pictionary-card-word">{prompt.word}</div>
      </div>

      <div className="pictionary-hint">
        Draw on paper (no words or letters) — your team guesses what it is!
      </div>

      <div className="pictionary-actions">
        <button
          className="pictionary-btn complete"
          onClick={() => dispatch({ type: "complete" } as PictionaryAction)}
        >
          Guessed!
        </button>
        <button
          className="pictionary-btn skip"
          onClick={() => dispatch({ type: "skip" } as PictionaryAction)}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
