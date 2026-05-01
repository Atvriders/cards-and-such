import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TextTwistMiniState, TextTwistMiniAction, TextTwistMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const LABELS = ["A", "B", "C", "D"];

export function TextTwistMiniGame({ state, dispatch, onGameOver }: GameProps<TextTwistMiniState, TextTwistMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="ttw-wrap">
        <div className="ttw-done">
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
    <div className="ttw-wrap">
      <div className="ttw-header">
        <span className="ttw-progress">Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="ttw-score">{state.score} pts</span>
      </div>
      <div className="ttw-prompt"><span className="ttw-label">Unscramble:</span> {r.prompt}</div>
      <div className="ttw-choices">
        {r.choices.map((choice, i) => {
          let cls = "ttw-choice";
          if (isResult) {
            if (i === r.correct) cls += " correct";
            else if (i === state.selected && state.selected !== r.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return (
            <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as TextTwistMiniAction)}>
              <span className="ttw-choice-letter">{LABELS[i]}</span>{choice}
            </button>
          );
        })}
      </div>
      {isResult && (
        <div className={`ttw-feedback ${state.selected === r.correct ? "correct" : "wrong"}`}>
          {state.selected === r.correct ? "Correct!" : `Answer: ${r.choices[r.correct]}`}
        </div>
      )}
      <div className="ttw-actions">
        {!isResult && (
          <button className="ttw-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TextTwistMiniAction)}>Submit</button>
        )}
        {isResult && (
          <button className="ttw-btn next" onClick={() => dispatch({ type: "next" } as TextTwistMiniAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}
