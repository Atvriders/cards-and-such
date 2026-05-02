import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ProverbQuizState, ProverbQuizAction, ProverbQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ProverbQuizGame({ state, dispatch, onGameOver }: GameProps<ProverbQuizState, ProverbQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ProverbQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="proverbquiz-wrap"><div className="proverbquiz-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="proverbquiz-wrap">
      <div className="proverbquiz-header">
        <span className="proverbquiz-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`proverbquiz-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="proverbquiz-score">{state.score} pts</span>
      </div>
      <div className="proverbquiz-question">{q.question}</div>
      <div className="proverbquiz-choices">
        {q.choices.map((choice, i) => {
          let cls = "proverbquiz-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type: "select", choice: i } as ProverbQuizAction)}><span className="proverbquiz-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`proverbquiz-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="proverbquiz-actions">
        {!isResult && <button className="proverbquiz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as ProverbQuizAction)}>Submit</button>}
        {isResult && <button className="proverbquiz-btn next" onClick={() => dispatch({ type: "next" } as ProverbQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
