import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AliceChessState, AliceChessAction, AliceChessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function AliceChessGame({ state, dispatch, onGameOver }: GameProps<AliceChessState, AliceChessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as AliceChessAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="alice1-wrap"><div className="alice1-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="alice1-wrap">
      <div className="alice1-header">
        <span className="alice1-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`alice1-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="alice1-score">{state.score} pts</span>
      </div>
      <div className="alice1-question">{q.question}</div>
      <div className="alice1-choices">
        {q.choices.map((choice, i) => {
          let cls = "alice1-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-alice-chess-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as AliceChessAction)}><span className="alice1-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`alice1-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="alice1-actions">
        {!isResult && <button className="alice1-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as AliceChessAction)}>Submit</button>}
        {isResult && <button className="alice1-btn next" onClick={() => dispatch({ type:"next" } as AliceChessAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
