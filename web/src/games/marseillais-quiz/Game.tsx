import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MarseillaisQuizState, MarseillaisQuizAction, MarseillaisQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function MarseillaisQuizGame({ state, dispatch, onGameOver }: GameProps<MarseillaisQuizState, MarseillaisQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MarseillaisQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="marschq-wrap"><div className="marschq-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="marschq-wrap">
      <div className="marschq-header">
        <span className="marschq-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`marschq-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="marschq-score">{state.score} pts</span>
      </div>
      <div className="marschq-question">{q.question}</div>
      <div className="marschq-choices">
        {q.choices.map((choice, i) => {
          let cls = "marschq-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", choice:i } as MarseillaisQuizAction)}><span className="marschq-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`marschq-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="marschq-actions">
        {!isResult && <button className="marschq-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as MarseillaisQuizAction)}>Submit</button>}
        {isResult && <button className="marschq-btn next" onClick={() => dispatch({ type:"next" } as MarseillaisQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
