import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuillGothicLettersState, QuillGothicLettersAction, QuillGothicLettersSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function QuillGothicLettersGame({ state, dispatch, onGameOver }: GameProps<QuillGothicLettersState, QuillGothicLettersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="qlg-wrap"><div className="qlg-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#b91c1c" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="qlg-wrap">
      <div className="qlg-header">
        <span className="qlg-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="qlg-score">{state.score} pts</span>
      </div>
      <div className="qlg-prompt">{p.prompt}</div>
      <div className="qlg-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-quill-gothic-letters-primary":undefined} key={i} className={`qlg-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as QuillGothicLettersAction)}>
            <span className="qlg-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="qlg-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="qlg-actions">
        {isResult && <button className="qlg-btn next" onClick={() => dispatch({ type:"next" } as QuillGothicLettersAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
