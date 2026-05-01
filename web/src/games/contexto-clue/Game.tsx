import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ContextoClueState, ContextoClueAction, ContextoClueSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function ContextoClueGame({ state, dispatch, onGameOver }: GameProps<ContextoClueState, ContextoClueSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ctx-wrap">
        <div className="ctx-done">
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
    <div className="ctx-wrap">
      <div className="ctx-header">
        <span className="ctx-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="ctx-score">{state.score} pts</span>
      </div>
      <div className="ctx-prompt"><span className="ctx-label">Choose:</span> {r.prompt}</div>
      <div className="ctx-choices">
        {r.choices.map((choice, i) => {
          let cls = "ctx-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as ContextoClueAction)}>
              <span className="ctx-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`ctx-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="ctx-actions">
        {!isResult && (
          <button className="ctx-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ContextoClueAction)}>Submit</button>
        )}
        {isResult && (
          <button className="ctx-btn next" onClick={() => dispatch({ type: "next" } as ContextoClueAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
