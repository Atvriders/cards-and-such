import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SigilWizardState, SigilWizardAction, SigilWizardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function SigilWizardGame({ state, dispatch, onGameOver }: GameProps<SigilWizardState, SigilWizardSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sgw-wrap"><div className="sgw-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#fde047" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="sgw-wrap">
      <div className="sgw-header">
        <span className="sgw-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="sgw-score">{state.score} pts</span>
      </div>
      <div className="sgw-prompt">{p.prompt}</div>
      <div className="sgw-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`sgw-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as SigilWizardAction)}>
            <span className="sgw-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="sgw-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="sgw-actions">
        {isResult && <button className="sgw-btn next" onClick={() => dispatch({ type:"next" } as SigilWizardAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
