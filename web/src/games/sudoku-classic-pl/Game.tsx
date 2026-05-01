import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SudokuClassicPlState, SudokuClassicPlAction, SudokuClassicPlSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SudokuClassicPlGame({ state, dispatch, onGameOver }: GameProps<SudokuClassicPlState, SudokuClassicPlSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as SudokuClassicPlAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") return <div className="sudokuclassic-wrap"><div className="sudokuclassic-done"><h2>Done!</h2><p>Correct: {state.correctCount} / {state.questions.length}</p><p style={{ fontSize:"1.8rem",fontWeight:900,color:"#27ae60" }}>{state.score} pts</p></div></div>;
  const q = state.questions[state.currentIndex]!;
  const isResult = state.phase === "result";
  const urgent = state.timeLeft <= 5 && !state.submitted;
  return (
    <div className="sudokuclassic-wrap">
      <div className="sudokuclassic-header">
        <span className="sudokuclassic-progress">Q {state.currentIndex + 1} / {state.questions.length}</span>
        <span className={`sudokuclassic-timer${urgent ? " urgent" : ""}`}>{state.timeLeft}s</span>
        <span className="sudokuclassic-score">{state.score} pts</span>
      </div>
      <div className="sudokuclassic-question">{q.question}</div>
      <div className="sudokuclassic-choices">
        {q.choices.map((choice, i) => {
          let cls = "sudokuclassic-choice";
          if (isResult) { if (i === q.correct) cls += " correct"; else if (i === state.selected && state.selected !== q.correct) cls += " wrong"; }
          else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type:"select", choice:i } as SudokuClassicPlAction)}><span className="sudokuclassic-choice-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      {isResult && <div className={`sudokuclassic-feedback ${state.selected === q.correct ? "correct" : "wrong"}`}>{state.selected === q.correct ? "Correct!" : `Wrong! Answer: ${q.choices[q.correct]}`}</div>}
      <div className="sudokuclassic-actions">
        {!isResult && <button className="sudokuclassic-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type:"submit" } as SudokuClassicPlAction)}>Submit</button>}
        {isResult && <button className="sudokuclassic-btn next" onClick={() => dispatch({ type:"next" } as SudokuClassicPlAction)}>{state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
