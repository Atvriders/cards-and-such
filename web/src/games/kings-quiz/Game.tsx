import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsState, KingsAction, KingsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A","B","C","D"];
export function KingsQuiz({ state, dispatch, onGameOver }: GameProps<KingsState, KingsSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type:"tick" } as KingsAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="trivia-wrap"><div className="trivia-done"><h2>Game Over!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{fontSize:"1.8rem",fontWeight:900,color:"#27ae60"}}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="trivia-wrap">
      <div className="trivia-header"><span className="trivia-progress">Q {state.currentIndex+1} / {state.questions.length}</span><span className={`trivia-timer${urgent?" urgent":""}`}>{state.timeLeft}s</span><span className="trivia-score">{state.score} pts</span></div>
      <div className="trivia-question">{q.question}</div>
      <div className="trivia-choices">{q.choices.map((choice,i) => { let cls="trivia-choice"; if(isResult){if(i===q.correct) cls+=" correct"; else if(i===state.selected&&state.selected!==q.correct) cls+=" wrong";} else if(i===state.selected) cls+=" selected"; return <button key={i} className={cls} disabled={isResult} onClick={()=>dispatch({type:"select",choice:i} as KingsAction)}><span className="trivia-choice-letter">{LABELS[i]}</span>{choice}</button>; })}</div>
      {isResult && <div className={`trivia-feedback ${state.selected===q.correct?"correct":"wrong"}`}>{state.selected===q.correct?"Correct! +100 pts + speed bonus":`Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="trivia-actions">{!isResult && <button className="trivia-btn submit" disabled={state.selected===null} onClick={()=>dispatch({type:"submit"} as KingsAction)}>Submit</button>}{isResult && <button className="trivia-btn next" onClick={()=>dispatch({type:"next"} as KingsAction)}>{state.currentIndex+1>=state.questions.length?"Finish":"Next"}</button>}</div>
    </div>
  );
}
