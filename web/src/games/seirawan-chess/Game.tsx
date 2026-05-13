import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SeirawanChessState, SeirawanChessAction, SeirawanChessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SeirawanChessGame({ state, dispatch, onGameOver }: GameProps<SeirawanChessState, SeirawanChessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SeirawanChessAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="seirch-wrap"><div className="seirch-done bounce-in"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="seirch-wrap fade-in">
      <div className="seirch-header">
        <span className="seirch-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`seirch-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="seirch-score pulse">{state.score} pts</span>
      </div>
      <div className="seirch-question">{q.question}</div>
      <div className="seirch-choices">
        {q.choices.map((choice, i) => {
          let cls = "seirch-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-seirawan-chess-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as SeirawanChessAction)}><span className="seirch-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`seirch-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="seirch-actions">
        {!isResult && <button className="seirch-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as SeirawanChessAction)}>Submit</button>}
        {isResult && <button className="seirch-btn next" onClick={() => dispatch({ type:"next" } as SeirawanChessAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
