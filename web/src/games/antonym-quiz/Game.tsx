import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AntonymQuizState, AntonymQuizAction, AntonymQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function AntonymQuizGame({ state, dispatch, onGameOver }: GameProps<AntonymQuizState, AntonymQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as AntonymQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="antonymquiz-wrap"><div className="antonymquiz-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="antonymquiz-wrap">
      <div className="antonymquiz-header">
        <span className="antonymquiz-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`antonymquiz-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="antonymquiz-score">{state.score} pts</span>
      </div>
      <div className="antonymquiz-question">{q.question}</div>
      <div className="antonymquiz-choices">
        {q.choices.map((choice, i) => {
          let cls = "antonymquiz-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type: "select", choice: i } as AntonymQuizAction)}><span className="antonymquiz-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`antonymquiz-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="antonymquiz-actions">
        {!isResult && <button className="antonymquiz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as AntonymQuizAction)}>Submit</button>}
        {isResult && <button className="antonymquiz-btn next" onClick={() => dispatch({ type: "next" } as AntonymQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
