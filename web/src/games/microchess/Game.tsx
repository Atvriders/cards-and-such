import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MicrochessState, MicrochessAction, MicrochessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function MicrochessGame({ state, dispatch, onGameOver }: GameProps<MicrochessState, MicrochessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MicrochessAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="microch-wrap"><div className="microch-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="microch-wrap">
      <div className="microch-header">
        <span className="microch-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`microch-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="microch-score">{state.score} pts</span>
      </div>
      <div className="microch-question">{q.question}</div>
      <div className="microch-choices">
        {q.choices.map((choice, i) => {
          let cls = "microch-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-microchess-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as MicrochessAction)}><span className="microch-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`microch-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="microch-actions">
        {!isResult && <button className="microch-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as MicrochessAction)}>Submit</button>}
        {isResult && <button className="microch-btn next" onClick={() => dispatch({ type:"next" } as MicrochessAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
