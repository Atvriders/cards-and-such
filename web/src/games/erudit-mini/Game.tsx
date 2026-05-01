import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { EruditMiniState, EruditMiniAction, EruditMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function EruditMiniGame({ state, dispatch, onGameOver }: GameProps<EruditMiniState, EruditMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="eru-wrap">
        <div className="eru-done">
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
    <div className="eru-wrap">
      <div className="eru-header">
        <span className="eru-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="eru-score">{state.score} pts</span>
      </div>
      <div className="eru-prompt"><span className="eru-label">Choose:</span> {r.prompt}</div>
      <div className="eru-choices">
        {r.choices.map((choice, i) => {
          let cls = "eru-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as EruditMiniAction)}>
              <span className="eru-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`eru-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="eru-actions">
        {!isResult && (
          <button className="eru-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as EruditMiniAction)}>Submit</button>
        )}
        {isResult && (
          <button className="eru-btn next" onClick={() => dispatch({ type: "next" } as EruditMiniAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
