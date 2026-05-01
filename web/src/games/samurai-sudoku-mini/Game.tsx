import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SamuraiSudokuMiniState, SamuraiSudokuMiniStateAction, SamuraiSudokuMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SamuraiSudokuMiniGame({ state, dispatch, onGameOver }: GameProps<SamuraiSudokuMiniState, SamuraiSudokuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return (
    <div className="samuraiimperial-wrap"><div className="samuraiimperial-done"><h2>Done!</h2><p>Correct: {state.correct} / {state.puzzles.length}</p><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#27ae60" }}>{state.score} pts</p></div></div>
  );
  const p = state.puzzles[state.idx]!;
  const isResult = state.phase === "result";
  const rows = p.grid.split("|");
  return (
    <div className="samuraiimperial-wrap">
      <div className="samuraiimperial-header">
        <span className="samuraiimperial-progress">Q {state.idx + 1} / {state.puzzles.length}</span>
        <span className="samuraiimperial-score">{state.score} pts</span>
      </div>
      <div className="samuraiimperial-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="samuraiimperial-row">
            {row.split("").map((c, ci) => (
              <span key={ci} className={"samuraiimperial-cell" + (c === "." ? " empty" : "")}>{c === "." ? "" : c}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="samuraiimperial-question">{p.prompt}</div>
      <div className="samuraiimperial-choices">
        {p.choices.map((choice, i) => {
          let cls = "samuraiimperial-choice";
          if (isResult) {
            if (i === p.correct) cls += " correct";
            else if (i === state.selected && state.selected !== p.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as SamuraiSudokuMiniStateAction)}><span className="samuraiimperial-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      <div className="samuraiimperial-actions">
        {!isResult && <button className="samuraiimperial-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as SamuraiSudokuMiniStateAction)}>Submit</button>}
        {isResult && <button className="samuraiimperial-btn next" onClick={() => dispatch({ type: "next" } as SamuraiSudokuMiniStateAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
