import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TribondClueState, TribondClueAction, TribondClueSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function TribondClueGame({ state, dispatch, onGameOver }: GameProps<TribondClueState, TribondClueSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="trb-wrap">
        <div className="trb-done">
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
    <div className="trb-wrap">
      <div className="trb-header">
        <span className="trb-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="trb-score">{state.score} pts</span>
      </div>
      <div className="trb-prompt"><span className="trb-label">Choose:</span> {r.prompt}</div>
      <div className="trb-choices">
        {r.choices.map((choice, i) => {
          let cls = "trb-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as TribondClueAction)}>
              <span className="trb-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`trb-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="trb-actions">
        {!isResult && (
          <button className="trb-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TribondClueAction)}>Submit</button>
        )}
        {isResult && (
          <button className="trb-btn next" onClick={() => dispatch({ type: "next" } as TribondClueAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
