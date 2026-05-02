import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SimileQuizState, SimileQuizAction, SimileQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SimileQuizGame({ state, dispatch, onGameOver }: GameProps<SimileQuizState, SimileQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SimileQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="similequiz-wrap"><div className="similequiz-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="similequiz-wrap">
      <div className="similequiz-header">
        <span className="similequiz-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`similequiz-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="similequiz-score">{state.score} pts</span>
      </div>
      <div className="similequiz-question">{q.question}</div>
      <div className="similequiz-choices">
        {q.choices.map((choice, i) => {
          let cls = "similequiz-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type: "select", choice: i } as SimileQuizAction)}><span className="similequiz-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`similequiz-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="similequiz-actions">
        {!isResult && <button className="similequiz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SimileQuizAction)}>Submit</button>}
        {isResult && <button className="similequiz-btn next" onClick={() => dispatch({ type: "next" } as SimileQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
