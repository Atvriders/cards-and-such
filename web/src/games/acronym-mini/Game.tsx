import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AcronymMiniState, AcronymMiniAction, AcronymMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function AcronymMiniGame({ state, dispatch, onGameOver }: GameProps<AcronymMiniState, AcronymMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as AcronymMiniAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="acr-wrap"><div className="acr-done bounce-in"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="acr-wrap fade-in">
      <div className="acr-header">
        <span className="acr-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`acr-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="acr-score pulse">{state.score} pts</span>
      </div>
      <div className="acr-question">{q.question}</div>
      <div className="acr-choices">
        {q.choices.map((choice, i) => {
          let cls = "acr-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button data-testid={`hint-target-acronym-mini-answer-${i}`} key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as AcronymMiniAction)}><span className="acr-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`acr-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="acr-actions">
        {!isResult && <button className="acr-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as AcronymMiniAction)}>Submit</button>}
        {isResult && <button className="acr-btn next" onClick={() => dispatch({ type:"next" } as AcronymMiniAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
