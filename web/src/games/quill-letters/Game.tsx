import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuillLettersState, QuillLettersAction, QuillLettersSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function QuillLettersGame({ state, dispatch, onGameOver }: GameProps<QuillLettersState, QuillLettersSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="qll-wrap"><div className="qll-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#7c2d12" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="qll-wrap">
      <div className="qll-header">
        <span className="qll-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="qll-score">{state.score} pts</span>
      </div>
      <div className="qll-prompt">{p.prompt}</div>
      <div className="qll-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`qll-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as QuillLettersAction)}>
            <span className="qll-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="qll-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="qll-actions">
        {isResult && <button className="qll-btn next" onClick={() => dispatch({ type:"next" } as QuillLettersAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
