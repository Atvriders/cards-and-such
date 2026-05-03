import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WanderhomeJourneyState, WanderhomeJourneyAction, WanderhomeJourneySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WanderhomeJourneyGame({ state, dispatch, onGameOver }: GameProps<WanderhomeJourneyState, WanderhomeJourneySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="whj-wrap"><div className="whj-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#65a30d" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="whj-wrap">
      <div className="whj-header">
        <span className="whj-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="whj-score">{state.score} pts</span>
      </div>
      <div className="whj-prompt">{p.prompt}</div>
      <div className="whj-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-wanderhome-journey-primary":undefined} key={i} className={`whj-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WanderhomeJourneyAction)}>
            <span className="whj-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="whj-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="whj-actions">
        {isResult && <button className="whj-btn next" onClick={() => dispatch({ type:"next" } as WanderhomeJourneyAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
