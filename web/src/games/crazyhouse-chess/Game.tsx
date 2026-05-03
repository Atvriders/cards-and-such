import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CrazyhouseChessState, CrazyhouseChessAction, CrazyhouseChessSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function CrazyhouseChessGame({ state, dispatch, onGameOver }: GameProps<CrazyhouseChessState, CrazyhouseChessSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as CrazyhouseChessAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="czch-wrap"><div className="czch-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="czch-wrap">
      <div className="czch-header">
        <span className="czch-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`czch-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="czch-score">{state.score} pts</span>
      </div>
      <div className="czch-question">{q.question}</div>
      <div className="czch-choices">
        {q.choices.map((choice, i) => {
          let cls = "czch-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-crazyhouse-chess-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as CrazyhouseChessAction)}><span className="czch-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`czch-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="czch-actions">
        {!isResult && <button className="czch-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as CrazyhouseChessAction)}>Submit</button>}
        {isResult && <button className="czch-btn next" onClick={() => dispatch({ type:"next" } as CrazyhouseChessAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
