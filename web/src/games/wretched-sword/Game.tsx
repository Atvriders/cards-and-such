import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WretchedSwordState, WretchedSwordAction, WretchedSwordSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WretchedSwordGame({ state, dispatch, onGameOver }: GameProps<WretchedSwordState, WretchedSwordSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="wrs-wrap"><div className="wrs-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#8e44ad" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="wrs-wrap">
      <div className="wrs-header">
        <span className="wrs-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="wrs-score">{state.score} pts</span>
      </div>
      <div className="wrs-prompt">{p.prompt}</div>
      <div className="wrs-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`wrs-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WretchedSwordAction)}>
            <span className="wrs-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="wrs-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="wrs-actions">
        {isResult && <button className="wrs-btn next" onClick={() => dispatch({ type:"next" } as WretchedSwordAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
