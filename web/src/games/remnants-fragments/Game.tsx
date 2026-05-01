import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RemnantsFragmentsState, RemnantsFragmentsAction, RemnantsFragmentsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function RemnantsFragmentsGame({ state, dispatch, onGameOver }: GameProps<RemnantsFragmentsState, RemnantsFragmentsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="rmf-wrap"><div className="rmf-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#22d3ee" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="rmf-wrap">
      <div className="rmf-header">
        <span className="rmf-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="rmf-score">{state.score} pts</span>
      </div>
      <div className="rmf-prompt">{p.prompt}</div>
      <div className="rmf-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`rmf-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as RemnantsFragmentsAction)}>
            <span className="rmf-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="rmf-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="rmf-actions">
        {isResult && <button className="rmf-btn next" onClick={() => dispatch({ type:"next" } as RemnantsFragmentsAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
