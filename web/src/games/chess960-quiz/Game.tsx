import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Chess960QuizState, Chess960QuizAction, Chess960QuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function Chess960QuizGame({ state, dispatch, onGameOver }: GameProps<Chess960QuizState, Chess960QuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as Chess960QuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="ch960q-wrap"><div className="ch960q-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="ch960q-wrap">
      <div className="ch960q-header">
        <span className="ch960q-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`ch960q-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="ch960q-score">{state.score} pts</span>
      </div>
      <div className="ch960q-question">{q.question}</div>
      <div className="ch960q-choices">
        {q.choices.map((choice, i) => {
          let cls = "ch960q-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", choice:i } as Chess960QuizAction)}><span className="ch960q-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`ch960q-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="ch960q-actions">
        {!isResult && <button className="ch960q-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as Chess960QuizAction)}>Submit</button>}
        {isResult && <button className="ch960q-btn next" onClick={() => dispatch({ type:"next" } as Chess960QuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
