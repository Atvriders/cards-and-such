import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrosswordleMiniState, CrosswordleMiniAction, CrosswordleMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function CrosswordleMiniGame({ state, dispatch, onGameOver }: GameProps<CrosswordleMiniState, CrosswordleMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="cwd-wrap">
        <div className="cwd-done">
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
    <div className="cwd-wrap">
      <div className="cwd-header">
        <span className="cwd-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="cwd-score">{state.score} pts</span>
      </div>
      <div className="cwd-prompt"><span className="cwd-label">Choose:</span> {r.prompt}</div>
      <div className="cwd-choices">
        {r.choices.map((choice, i) => {
          let cls = "cwd-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as CrosswordleMiniAction)}>
              <span className="cwd-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`cwd-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="cwd-actions">
        {!isResult && (
          <button className="cwd-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as CrosswordleMiniAction)}>Submit</button>
        )}
        {isResult && (
          <button className="cwd-btn next" onClick={() => dispatch({ type: "next" } as CrosswordleMiniAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
