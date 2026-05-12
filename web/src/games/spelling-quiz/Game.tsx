import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpellingQuizState, SpellingQuizAction, SpellingQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SpellingQuizGame({ state, dispatch, onGameOver }: GameProps<SpellingQuizState, SpellingQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SpellingQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="spellingquiz-wrap"><div className="spellingquiz-done bounce-in"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize: "1.8rem", fontWeight: 900, color: "#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="spellingquiz-wrap fade-in">
      <div className="spellingquiz-header">
        <span className="spellingquiz-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`spellingquiz-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="spellingquiz-score pulse">{state.score} pts</span>
      </div>
      <div className="spellingquiz-question">{q.question}</div>
      <div className="spellingquiz-choices">
        {q.choices.map((choice, i) => {
          let cls = "spellingquiz-choice";
          if (isResult) {
            if (i === q.correct) cls += " correct";
            else if (i === state.selected && state.selected !== q.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type: "select", choice: i } as SpellingQuizAction)}><span className="spellingquiz-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`spellingquiz-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="spellingquiz-actions">
        {!isResult && <button className="spellingquiz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SpellingQuizAction)}>Submit</button>}
        {isResult && <button className="spellingquiz-btn next" onClick={() => dispatch({ type: "next" } as SpellingQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
