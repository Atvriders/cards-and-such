import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CeeLoQuizState, CeeLoQuizAction, CeeLoQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function CeeLoQuizGame({ state, dispatch, onGameOver }: GameProps<CeeLoQuizState, CeeLoQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CeeLoQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="trivia-wrap"><div className="trivia-done bounce-in"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const qq = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="trivia-wrap fade-in">
      <div className="trivia-header">
        <span className="trivia-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`trivia-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="trivia-score pulse">{state.score} pts</span>
      </div>
      <div className="trivia-question">{qq.question}</div>
      <div className="trivia-choices">
        {qq.choices.map((choice, i) => {
          let cls = "trivia-choice";
          if (isResult) { if (i === qq.correct) cls += " correct"; else if (i === state.selected && state.selected !== qq.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", choice:i } as CeeLoQuizAction)}><span className="trivia-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`trivia-feedback ${state.selected === qq.correct ? "correct" : "wrong"}`}>{state.selected === qq.correct ? "Correct!" : `Wrong! Answer: ${qq.choices[qq.correct]}`}</div>}
      <div className="trivia-actions">
        {!isResult && <button className="trivia-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as CeeLoQuizAction)}>Submit</button>}
        {isResult && <button className="trivia-btn next" onClick={() => dispatch({ type:"next" } as CeeLoQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
