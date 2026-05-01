import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WorldleCountryState, WorldleCountryAction, WorldleCountrySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function WorldleCountryGame({ state, dispatch, onGameOver }: GameProps<WorldleCountryState, WorldleCountrySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="wdl-wrap">
        <div className="wdl-done">
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
    <div className="wdl-wrap">
      <div className="wdl-header">
        <span className="wdl-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="wdl-score">{state.score} pts</span>
      </div>
      <div className="wdl-prompt"><span className="wdl-label">Choose:</span> {r.prompt}</div>
      <div className="wdl-choices">
        {r.choices.map((choice, i) => {
          let cls = "wdl-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as WorldleCountryAction)}>
              <span className="wdl-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`wdl-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="wdl-actions">
        {!isResult && (
          <button className="wdl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as WorldleCountryAction)}>Submit</button>
        )}
        {isResult && (
          <button className="wdl-btn next" onClick={() => dispatch({ type: "next" } as WorldleCountryAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
