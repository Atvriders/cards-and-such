import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeirawanChessQuizState, SeirawanChessQuizAction, SeirawanChessQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SeirawanChessQuizGame({ state, dispatch, onGameOver }: GameProps<SeirawanChessQuizState, SeirawanChessQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SeirawanChessQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="seirchq-wrap"><div className="seirchq-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="seirchq-wrap">
      <div className="seirchq-header">
        <span className="seirchq-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`seirchq-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="seirchq-score">{state.score} pts</span>
      </div>
      <div className="seirchq-question">{q.question}</div>
      <div className="seirchq-choices">
        {q.choices.map((choice, i) => {
          let cls = "seirchq-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", choice:i } as SeirawanChessQuizAction)}><span className="seirchq-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`seirchq-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="seirchq-actions">
        {!isResult && <button className="seirchq-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as SeirawanChessQuizAction)}>Submit</button>}
        {isResult && <button className="seirchq-btn next" onClick={() => dispatch({ type:"next" } as SeirawanChessQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
