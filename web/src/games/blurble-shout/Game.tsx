import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BlurbleShoutState, BlurbleShoutAction, BlurbleShoutSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function BlurbleShoutGame({ state, dispatch, onGameOver }: GameProps<BlurbleShoutState, BlurbleShoutSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="blr-wrap">
        <div className="blr-done">
          <h2>Done!</h2>
          <p>Correct: {state.correctCount} / {state.rounds.length}</p>
          <p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const isResult = state.phase === "result";

  return (
    <div className="blr-wrap">
      <div className="blr-header">
        <span className="blr-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="blr-score pulse">{state.score} pts</span>
      </div>
      <div className="blr-prompt"><span className="blr-label">Choose:</span> {r.prompt}</div>
      <div className="blr-choices">
        {r.choices.map((choice, i) => {
          let cls = "blr-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as BlurbleShoutAction)}>
              <span className="blr-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`blr-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="blr-actions">
        {!isResult && (
          <button className="blr-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as BlurbleShoutAction)}>Submit</button>
        )}
        {isResult && (
          <button className="blr-btn next" onClick={() => dispatch({ type: "next" } as BlurbleShoutAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
