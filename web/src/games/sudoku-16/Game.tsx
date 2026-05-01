import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { Sudoku16State, Sudoku16StateAction, Sudoku16Settings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function Sudoku16Game({ state, dispatch, onGameOver }: GameProps<Sudoku16State, Sudoku16Settings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return (
    <div className="sudokusixteen-wrap"><div className="sudokusixteen-done"><h2>Done!</h2><p>Correct: {state.correct} / {state.puzzles.length}</p><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#27ae60" }}>{state.score} pts</p></div></div>
  );
  const p = state.puzzles[state.idx]!;
  const isResult = state.phase === "result";
  const rows = p.grid.split("|");
  return (
    <div className="sudokusixteen-wrap">
      <div className="sudokusixteen-header">
        <span className="sudokusixteen-progress">Q {state.idx + 1} / {state.puzzles.length}</span>
        <span className="sudokusixteen-score">{state.score} pts</span>
      </div>
      <div className="sudokusixteen-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="sudokusixteen-row">
            {row.split("").map((c, ci) => (
              <span key={ci} className={"sudokusixteen-cell" + (c === "." ? " empty" : "")}>{c === "." ? "" : c}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="sudokusixteen-question">{p.prompt}</div>
      <div className="sudokusixteen-choices">
        {p.choices.map((choice, i) => {
          let cls = "sudokusixteen-choice";
          if (isResult) {
            if (i === p.correct) cls += " correct";
            else if (i === state.selected && state.selected !== p.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as Sudoku16StateAction)}><span className="sudokusixteen-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      <div className="sudokusixteen-actions">
        {!isResult && <button className="sudokusixteen-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as Sudoku16StateAction)}>Submit</button>}
        {isResult && <button className="sudokusixteen-btn next" onClick={() => dispatch({ type: "next" } as Sudoku16StateAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
