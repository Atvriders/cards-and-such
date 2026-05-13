import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BonzaJigsawState, BonzaJigsawAction, BonzaJigsawSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function BonzaJigsawGame({ state, dispatch, onGameOver }: GameProps<BonzaJigsawState, BonzaJigsawSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="word-wrap">
        <div className="word-done bounce-in">
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
    <div className="word-wrap fade-in">
      <div className="word-header">
        <span className="word-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="word-score pulse">{state.score} pts</span>
      </div>
      <div className="word-prompt"><span className="word-label">Choose:</span> {r.prompt}</div>
      <div className="word-choices">
        {r.choices.map((choice, i) => {
          let cls = "word-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as BonzaJigsawAction)}>
              <span className="word-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`word-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="word-actions">
        {!isResult && (
          <button className="word-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as BonzaJigsawAction)}>Submit</button>
        )}
        {isResult && (
          <button className="word-btn next" onClick={() => dispatch({ type: "next" } as BonzaJigsawAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
