import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GipfAbsState, GipfAbsAction, GipfAbsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function GipfAbsGame({ state, dispatch, onGameOver }: GameProps<GipfAbsState, GipfAbsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as GipfAbsAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="gpf-wrap"><div className="gpf-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="gpf-wrap">
      <div className="gpf-header">
        <span className="gpf-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`gpf-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="gpf-score">{state.score} pts</span>
      </div>
      <div className="gpf-question">{q.question}</div>
      <div className="gpf-choices">
        {q.choices.map((choice, i) => {
          let cls = "gpf-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-gipf-abs-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as GipfAbsAction)}><span className="gpf-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`gpf-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="gpf-actions">
        {!isResult && <button className="gpf-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as GipfAbsAction)}>Submit</button>}
        {isResult && <button className="gpf-btn next" onClick={() => dispatch({ type:"next" } as GipfAbsAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
