import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CapablancaChessQuizState, CapablancaChessQuizAction, CapablancaChessQuizSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function CapablancaChessQuizGame({ state, dispatch, onGameOver }: GameProps<CapablancaChessQuizState, CapablancaChessQuizSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CapablancaChessQuizAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="capchq-wrap"><div className="capchq-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="capchq-wrap">
      <div className="capchq-header">
        <span className="capchq-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`capchq-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="capchq-score">{state.score} pts</span>
      </div>
      <div className="capchq-question">{q.question}</div>
      <div className="capchq-choices">
        {q.choices.map((choice, i) => {
          let cls = "capchq-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} data-testid={`hint-target-quiz-answer-${i}`} onClick={() => dispatch({ type:"select", choice:i } as CapablancaChessQuizAction)}><span className="capchq-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`capchq-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="capchq-actions">
        {!isResult && <button className="capchq-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as CapablancaChessQuizAction)}>Submit</button>}
        {isResult && <button className="capchq-btn next" onClick={() => dispatch({ type:"next" } as CapablancaChessQuizAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
