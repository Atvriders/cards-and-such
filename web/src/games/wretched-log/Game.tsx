import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WretchedLogState, WretchedLogAction, WretchedLogSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WretchedLogGame({ state, dispatch, onGameOver }: GameProps<WretchedLogState, WretchedLogSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="wrl-wrap"><div className="wrl-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#dc2626" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="wrl-wrap">
      <div className="wrl-header">
        <span className="wrl-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="wrl-score">{state.score} pts</span>
      </div>
      <div className="wrl-prompt">{p.prompt}</div>
      <div className="wrl-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`wrl-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WretchedLogAction)}>
            <span className="wrl-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="wrl-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="wrl-actions">
        {isResult && <button className="wrl-btn next" onClick={() => dispatch({ type:"next" } as WretchedLogAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
