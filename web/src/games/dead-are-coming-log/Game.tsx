import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DeadAreComingLogState, DeadAreComingLogAction, DeadAreComingLogSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function DeadAreComingLogGame({ state, dispatch, onGameOver }: GameProps<DeadAreComingLogState, DeadAreComingLogSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="dac-wrap"><div className="dac-done bounce-in"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#65a30d" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="dac-wrap fade-in">
      <div className="dac-header">
        <span className="dac-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="dac-score pulse">{state.score} pts</span>
      </div>
      <div className="dac-prompt">{p.prompt}</div>
      <div className="dac-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-dead-are-coming-log-primary":undefined} key={i} className={`dac-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as DeadAreComingLogAction)}>
            <span className="dac-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="dac-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="dac-actions">
        {isResult && <button className="dac-btn next" onClick={() => dispatch({ type:"next" } as DeadAreComingLogAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
