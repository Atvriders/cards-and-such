import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NHIEState, NHIEAction, NHIESettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function NeverHaveIEver({ state, dispatch, onGameOver }: GameProps<NHIEState, NHIESettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="nhie-wrap">
        <div className="nhie-done">
          <h2>Round Over!</h2>
          <p>You had done <strong>{state.drankCount} / {state.statements.length}</strong> things!</p>
          <p style={{ fontSize: "0.9rem", color: "#888" }}>Score = things you've done</p>
        </div>
      </div>
    );
  }

  const stmt = state.statements[state.currentIndex]!;

  return (
    <div className="nhie-wrap">
      <div className="nhie-header">
        <span>Card {state.currentIndex + 1} / {state.statements.length}</span>
        <span className="nhie-count">Done it: {state.drankCount}</span>
      </div>
      <div className="nhie-card">{stmt}</div>
      <div className="nhie-buttons">
        <button
          className="nhie-btn nhie-btn-did"
          onClick={() => dispatch({ type: "did-it" } as NHIEAction)}
        >
          I've Done It!
        </button>
        <button
          className="nhie-btn nhie-btn-never"
          onClick={() => dispatch({ type: "never" } as NHIEAction)}
        >
          Never!
        </button>
      </div>
    </div>
  );
}
