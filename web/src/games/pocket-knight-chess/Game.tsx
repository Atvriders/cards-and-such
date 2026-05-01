import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PocketKnightChessState, PocketKnightChessAction, PocketKnightChessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function PocketKnightChessGame({ state, dispatch, onGameOver }: GameProps<PocketKnightChessState, PocketKnightChessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as PocketKnightChessAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="pockknt-wrap"><div className="pockknt-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="pockknt-wrap">
      <div className="pockknt-header">
        <span className="pockknt-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`pockknt-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="pockknt-score">{state.score} pts</span>
      </div>
      <div className="pockknt-question">{q.question}</div>
      <div className="pockknt-choices">
        {q.choices.map((choice, i) => {
          let cls = "pockknt-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as PocketKnightChessAction)}><span className="pockknt-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`pockknt-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="pockknt-actions">
        {!isResult && <button className="pockknt-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as PocketKnightChessAction)}>Submit</button>}
        {isResult && <button className="pockknt-btn next" onClick={() => dispatch({ type:"next" } as PocketKnightChessAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
