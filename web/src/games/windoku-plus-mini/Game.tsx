import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WindokuPlusMiniState, WindokuPlusMiniStateAction, WindokuPlusMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WindokuPlusMiniGame({ state, dispatch, onGameOver }: GameProps<WindokuPlusMiniState, WindokuPlusMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return (
    <div className="nlp-wrap"><div className="nlp-done"><h2>Done!</h2><p>Correct: {state.correct} / {state.puzzles.length}</p><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#27ae60" }}>{state.score} pts</p></div></div>
  );
  const p = state.puzzles[state.idx]!;
  const isResult = state.phase === "result";
  const rows = p.grid.split("|");
  return (
    <div className="nlp-wrap">
      <div className="nlp-header">
        <span className="nlp-progress">Q {state.idx + 1} / {state.puzzles.length}</span>
        <span className="nlp-score">{state.score} pts</span>
      </div>
      <div className="nlp-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="nlp-row">
            {row.split("").map((c, ci) => (
              <span key={ci} className={"nlp-cell" + (c === "." ? " empty" : "")}>{c === "." ? "" : c}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="nlp-question">{p.prompt}</div>
      <div className="nlp-choices">
        {p.choices.map((choice, i) => {
          let cls = "nlp-choice";
          if (isResult) {
            if (i === p.correct) cls += " correct";
            else if (i === state.selected && state.selected !== p.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as WindokuPlusMiniStateAction)}><span className="nlp-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      <div className="nlp-actions">
        {!isResult && <button className="nlp-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as WindokuPlusMiniStateAction)}>Submit</button>}
        {isResult && <button className="nlp-btn next" onClick={() => dispatch({ type: "next" } as WindokuPlusMiniStateAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
