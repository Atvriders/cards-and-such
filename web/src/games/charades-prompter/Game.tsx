import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CharadesState, CharadesAction, CharadesSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CharadesPrompter({ state, dispatch, onGameOver }: GameProps<CharadesState, CharadesSettings>): JSX.Element {
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
      dispatch({ type: "tick" } as CharadesAction);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.phase, dispatch]);

  if (state.phase === "done") {
    return (
      <div className="charades-wrap">
        <div className="charades-done">
          <h2>Round Over!</h2>
          <p>Completed: <strong style={{ color: "#27ae60" }}>{state.completedCount}</strong></p>
          <p>Skipped: <strong style={{ color: "#e74c3c" }}>{state.skippedCount}</strong></p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>Score: {state.completedCount}</p>
        </div>
      </div>
    );
  }

  const prompt = state.prompts[state.currentIndex] ?? "—";
  const urgent = state.timeLeft <= 15;

  return (
    <div className="charades-wrap">
      <div className="charades-header">
        <div className="charades-stats">
          <span className="charades-completed">✓ {state.completedCount}</span>
          <span className="charades-skipped">✗ {state.skippedCount}</span>
        </div>
        <span className={`charades-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
      </div>

      <div className="charades-card">
        <div className="charades-card-label">Act it out!</div>
        <div className="charades-card-word">{prompt}</div>
      </div>

      <div className="charades-hint">
        Act, mime, or describe this word to your partner — no words that give it away!
      </div>

      <div className="charades-actions">
        <button
          className="charades-btn complete"
          onClick={() => dispatch({ type: "complete" } as CharadesAction)}
        >
          Got it!
        </button>
        <button
          className="charades-btn skip"
          onClick={() => dispatch({ type: "skip" } as CharadesAction)}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
