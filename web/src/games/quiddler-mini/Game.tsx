import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuiddlerMiniState, QuiddlerMiniAction, QuiddlerMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function QuiddlerMiniGame({ state, dispatch, onGameOver }: GameProps<QuiddlerMiniState, QuiddlerMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="qdm-wrap">
        <div className="qdm-done">
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
    <div className="qdm-wrap">
      <div className="qdm-header">
        <span className="qdm-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="qdm-score">{state.score} pts</span>
      </div>
      <div className="qdm-prompt"><span className="qdm-label">Choose:</span> {r.prompt}</div>
      <div className="qdm-choices">
        {r.choices.map((choice, i) => {
          let cls = "qdm-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as QuiddlerMiniAction)}>
              <span className="qdm-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`qdm-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="qdm-actions">
        {!isResult && (
          <button className="qdm-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as QuiddlerMiniAction)}>Submit</button>
        )}
        {isResult && (
          <button className="qdm-btn next" onClick={() => dispatch({ type: "next" } as QuiddlerMiniAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
