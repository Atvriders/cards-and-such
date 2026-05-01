import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GlobleCountryState, GlobleCountryAction, GlobleCountrySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function GlobleCountryGame({ state, dispatch, onGameOver }: GameProps<GlobleCountryState, GlobleCountrySettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="gbl-wrap">
        <div className="gbl-done">
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
    <div className="gbl-wrap">
      <div className="gbl-header">
        <span className="gbl-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="gbl-score">{state.score} pts</span>
      </div>
      <div className="gbl-prompt"><span className="gbl-label">Choose:</span> {r.prompt}</div>
      <div className="gbl-choices">
        {r.choices.map((choice, i) => {
          let cls = "gbl-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as GlobleCountryAction)}>
              <span className="gbl-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`gbl-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="gbl-actions">
        {!isResult && (
          <button className="gbl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as GlobleCountryAction)}>Submit</button>
        )}
        {isResult && (
          <button className="gbl-btn next" onClick={() => dispatch({ type: "next" } as GlobleCountryAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
