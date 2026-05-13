import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Sudoku25State, Sudoku25StateAction, Sudoku25Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function Sudoku25Game({ state, dispatch, onGameOver }: GameProps<Sudoku25State, Sudoku25Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return (
    <div className="sudokutwentyfive-wrap"><div className="sudokutwentyfive-done bounce-in"><h2>Done!</h2><p>Correct: {state.correct} / {state.puzzles.length}</p><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#27ae60" }}>{state.score} pts</p></div></div>
  );
  const p = state.puzzles[state.idx]!;
  const isResult = state.phase === "result";
  const rows = p.grid.split("|");
  return (
    <div className="sudokutwentyfive-wrap fade-in">
      <div className="sudokutwentyfive-header">
        <span className="sudokutwentyfive-progress">Q {state.idx + 1} / {state.puzzles.length}</span>
        <span className="sudokutwentyfive-score pulse">{state.score} pts</span>
      </div>
      <div className="sudokutwentyfive-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="sudokutwentyfive-row">
            {row.split("").map((c, ci) => (
              <span key={ci} className={"sudokutwentyfive-cell" + (c === "." ? " empty" : "")}>{c === "." ? "" : c}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="sudokutwentyfive-question">{p.prompt}</div>
      <div className="sudokutwentyfive-choices">
        {p.choices.map((choice, i) => {
          let cls = "sudokutwentyfive-choice";
          if (isResult) {
            if (i === p.correct) cls += " correct";
            else if (i === state.selected && state.selected !== p.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as Sudoku25StateAction)}><span className="sudokutwentyfive-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      <div className="sudokutwentyfive-actions">
        {!isResult && <button className="sudokutwentyfive-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as Sudoku25StateAction)}>Submit</button>}
        {isResult && <button className="sudokutwentyfive-btn next" onClick={() => dispatch({ type: "next" } as Sudoku25StateAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
