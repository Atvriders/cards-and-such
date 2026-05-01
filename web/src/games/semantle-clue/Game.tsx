import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SemantleClueState, SemantleClueAction, SemantleClueSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function SemantleClueGame({ state, dispatch, onGameOver }: GameProps<SemantleClueState, SemantleClueSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="smt-wrap">
        <div className="smt-done">
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
    <div className="smt-wrap">
      <div className="smt-header">
        <span className="smt-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="smt-score">{state.score} pts</span>
      </div>
      <div className="smt-prompt"><span className="smt-label">Choose:</span> {r.prompt}</div>
      <div className="smt-choices">
        {r.choices.map((choice, i) => {
          let cls = "smt-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as SemantleClueAction)}>
              <span className="smt-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`smt-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="smt-actions">
        {!isResult && (
          <button className="smt-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SemantleClueAction)}>Submit</button>
        )}
        {isResult && (
          <button className="smt-btn next" onClick={() => dispatch({ type: "next" } as SemantleClueAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
