import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Minichess5x5State, Minichess5x5Action, Minichess5x5Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function Minichess5x5Game({ state, dispatch, onGameOver }: GameProps<Minichess5x5State, Minichess5x5Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as Minichess5x5Action), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="mini5x5-wrap"><div className="mini5x5-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="mini5x5-wrap">
      <div className="mini5x5-header">
        <span className="mini5x5-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`mini5x5-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="mini5x5-score">{state.score} pts</span>
      </div>
      <div className="mini5x5-question">{q.question}</div>
      <div className="mini5x5-choices">
        {q.choices.map((choice, i) => {
          let cls = "mini5x5-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as Minichess5x5Action)}><span className="mini5x5-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`mini5x5-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="mini5x5-actions">
        {!isResult && <button className="mini5x5-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as Minichess5x5Action)}>Submit</button>}
        {isResult && <button className="mini5x5-btn next" onClick={() => dispatch({ type:"next" } as Minichess5x5Action)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
