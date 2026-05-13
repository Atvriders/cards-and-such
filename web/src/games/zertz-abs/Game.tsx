import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ZertzAbsState, ZertzAbsAction, ZertzAbsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ZertzAbsGame({ state, dispatch, onGameOver }: GameProps<ZertzAbsState, ZertzAbsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as ZertzAbsAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="zrz-wrap"><div className="zrz-done bounce-in"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="zrz-wrap fade-in">
      <div className="zrz-header">
        <span className="zrz-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`zrz-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="zrz-score pulse">{state.score} pts</span>
      </div>
      <div className="zrz-question">{q.question}</div>
      <div className="zrz-choices">
        {q.choices.map((choice, i) => {
          let cls = "zrz-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-zertz-abs-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as ZertzAbsAction)}><span className="zrz-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`zrz-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="zrz-actions">
        {!isResult && <button className="zrz-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as ZertzAbsAction)}>Submit</button>}
        {isResult && <button className="zrz-btn next" onClick={() => dispatch({ type:"next" } as ZertzAbsAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
