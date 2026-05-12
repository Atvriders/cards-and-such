import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LosAlamosChessState, LosAlamosChessAction, LosAlamosChessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function LosAlamosChessGame({ state, dispatch, onGameOver }: GameProps<LosAlamosChessState, LosAlamosChessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as LosAlamosChessAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="losal-wrap"><div className="losal-done bounce-in"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="losal-wrap fade-in">
      <div className="losal-header">
        <span className="losal-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`losal-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="losal-score pulse">{state.score} pts</span>
      </div>
      <div className="losal-question">{q.question}</div>
      <div className="losal-choices">
        {q.choices.map((choice, i) => {
          let cls = "losal-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-los-alamos-chess-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as LosAlamosChessAction)}><span className="losal-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`losal-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="losal-actions">
        {!isResult && <button className="losal-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as LosAlamosChessAction)}>Submit</button>}
        {isResult && <button className="losal-btn next" onClick={() => dispatch({ type:"next" } as LosAlamosChessAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
