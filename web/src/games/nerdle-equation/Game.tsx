import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NerdleEquationState, NerdleEquationAction, NerdleEquationSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function NerdleEquationGame({ state, dispatch, onGameOver }: GameProps<NerdleEquationState, NerdleEquationSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ndl-wrap">
        <div className="ndl-done">
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
    <div className="ndl-wrap">
      <div className="ndl-header">
        <span className="ndl-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="ndl-score">{state.score} pts</span>
      </div>
      <div className="ndl-prompt"><span className="ndl-label">Choose:</span> {r.prompt}</div>
      <div className="ndl-choices">
        {r.choices.map((choice, i) => {
          let cls = "ndl-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as NerdleEquationAction)}>
              <span className="ndl-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`ndl-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="ndl-actions">
        {!isResult && (
          <button className="ndl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as NerdleEquationAction)}>Submit</button>
        )}
        {isResult && (
          <button className="ndl-btn next" onClick={() => dispatch({ type: "next" } as NerdleEquationAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
