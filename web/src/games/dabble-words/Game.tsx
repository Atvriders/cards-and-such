import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DabbleWordsState, DabbleWordsAction, DabbleWordsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function DabbleWordsGame({ state, dispatch, onGameOver }: GameProps<DabbleWordsState, DabbleWordsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="dbw-wrap">
        <div className="dbw-done bounce-in">
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
    <div className="dbw-wrap fade-in">
      <div className="dbw-header">
        <span className="dbw-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="dbw-score pulse">{state.score} pts</span>
      </div>
      <div className="dbw-prompt"><span className="dbw-label">Choose:</span> {r.prompt}</div>
      <div className="dbw-choices">
        {r.choices.map((choice, i) => {
          let cls = "dbw-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as DabbleWordsAction)}>
              <span className="dbw-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`dbw-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="dbw-actions">
        {!isResult && (
          <button className="dbw-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as DabbleWordsAction)}>Submit</button>
        )}
        {isResult && (
          <button className="dbw-btn next" onClick={() => dispatch({ type: "next" } as DabbleWordsAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
