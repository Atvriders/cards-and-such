import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TridokuMiniState, TridokuMiniStateAction, TridokuMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function TridokuMiniGame({ state, dispatch, onGameOver }: GameProps<TridokuMiniState, TridokuMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  if (state.phase === "done") return (
    <div className="tridokuterra-wrap"><div className="tridokuterra-done"><h2>Done!</h2><p>Correct: {state.correct} / {state.puzzles.length}</p><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#27ae60" }}>{state.score} pts</p></div></div>
  );
  const p = state.puzzles[state.idx]!;
  const isResult = state.phase === "result";
  const rows = p.grid.split("|");
  return (
    <div className="tridokuterra-wrap">
      <div className="tridokuterra-header">
        <span className="tridokuterra-progress">Q {state.idx + 1} / {state.puzzles.length}</span>
        <span className="tridokuterra-score">{state.score} pts</span>
      </div>
      <div className="tridokuterra-grid">
        {rows.map((row, ri) => (
          <div key={ri} className="tridokuterra-row">
            {row.split("").map((c, ci) => (
              <span key={ci} className={"tridokuterra-cell" + (c === "." ? " empty" : "")}>{c === "." ? "" : c}</span>
            ))}
          </div>
        ))}
      </div>
      <div className="tridokuterra-question">{p.prompt}</div>
      <div className="tridokuterra-choices">
        {p.choices.map((choice, i) => {
          let cls = "tridokuterra-choice";
          if (isResult) {
            if (i === p.correct) cls += " correct";
            else if (i === state.selected && state.selected !== p.correct) cls += " wrong";
          } else if (i === state.selected) cls += " selected";
          return <button key={i} className={cls} disabled={isResult} onClick={() => dispatch({ type: "select", choice: i } as TridokuMiniStateAction)}><span className="tridokuterra-letter">{LABELS[i]}</span>{choice}</button>;
        })}
      </div>
      <div className="tridokuterra-actions">
        {!isResult && <button className="tridokuterra-btn submit" disabled={state.selected === null} onClick={() => dispatch({ type: "submit" } as TridokuMiniStateAction)}>Submit</button>}
        {isResult && <button className="tridokuterra-btn next" onClick={() => dispatch({ type: "next" } as TridokuMiniStateAction)}>{state.idx + 1 >= state.puzzles.length ? "Finish" : "Next"}</button>}
      </div>
    </div>
  );
}
