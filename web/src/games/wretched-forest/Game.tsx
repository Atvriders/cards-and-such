import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WretchedForestState, WretchedForestAction, WretchedForestSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WretchedForestGame({ state, dispatch, onGameOver }: GameProps<WretchedForestState, WretchedForestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="wrf-wrap"><div className="wrf-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#dc2626" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="wrf-wrap">
      <div className="wrf-header">
        <span className="wrf-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="wrf-score">{state.score} pts</span>
      </div>
      <div className="wrf-prompt">{p.prompt}</div>
      <div className="wrf-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-wretched-forest-primary":undefined} key={i} className={`wrf-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WretchedForestAction)}>
            <span className="wrf-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="wrf-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="wrf-actions">
        {isResult && <button className="wrf-btn next" onClick={() => dispatch({ type:"next" } as WretchedForestAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
