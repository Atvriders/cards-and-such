import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TappleLettersState, TappleLettersAction, TappleLettersSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function TappleLettersGame({ state, dispatch, onGameOver }: GameProps<TappleLettersState, TappleLettersSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="tpl-wrap">
        <div className="tpl-done">
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
    <div className="tpl-wrap">
      <div className="tpl-header">
        <span className="tpl-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="tpl-score">{state.score} pts</span>
      </div>
      <div className="tpl-prompt"><span className="tpl-label">Choose:</span> {r.prompt}</div>
      <div className="tpl-choices">
        {r.choices.map((choice, i) => {
          let cls = "tpl-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as TappleLettersAction)}>
              <span className="tpl-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`tpl-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="tpl-actions">
        {!isResult && (
          <button className="tpl-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TappleLettersAction)}>Submit</button>
        )}
        {isResult && (
          <button className="tpl-btn next" onClick={() => dispatch({ type: "next" } as TappleLettersAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
