import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DrawfulQuizState, DrawfulQuizAction, DrawfulQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function DrawfulQuizGame({ state, dispatch, onGameOver }: GameProps<DrawfulQuizState, DrawfulQuizSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="trivia-wrap"><div className="trivia-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem", fontWeight:900, color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  return (
    <div className="trivia-wrap">
      <div className="trivia-header">
        <span className="trivia-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className="trivia-score">{state.score} pts</span>
      </div>
      <div className="trivia-question">{q.question}</div>
      <div className="trivia-choices">
        {q.choices.map((choice, i) => {
          let cls = "trivia-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as DrawfulQuizAction)}><span className="trivia-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`trivia-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="trivia-actions">
        {!isResult && <button className="trivia-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as DrawfulQuizAction)}>Submit</button>}
        {isResult && <button className="trivia-btn next" onClick={() => dispatch({ type:"next" } as DrawfulQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
