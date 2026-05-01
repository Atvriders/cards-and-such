import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ThousandYearVampireState, ThousandYearVampireAction, ThousandYearVampireSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ThousandYearVampireGame({ state, dispatch, onGameOver }: GameProps<ThousandYearVampireState, ThousandYearVampireSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tyv-wrap"><div className="tyv-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#8e44ad" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="tyv-wrap">
      <div className="tyv-header">
        <span className="tyv-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="tyv-score">{state.score} pts</span>
      </div>
      <div className="tyv-prompt">{p.prompt}</div>
      <div className="tyv-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`tyv-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ThousandYearVampireAction)}>
            <span className="tyv-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="tyv-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="tyv-actions">
        {isResult && <button className="tyv-btn next" onClick={() => dispatch({ type:"next" } as ThousandYearVampireAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
