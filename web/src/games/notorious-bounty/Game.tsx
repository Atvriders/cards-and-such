import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NotoriousBountyState, NotoriousBountyAction, NotoriousBountySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function NotoriousBountyGame({ state, dispatch, onGameOver }: GameProps<NotoriousBountyState, NotoriousBountySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="nbn-wrap"><div className="nbn-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#dc2626" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="nbn-wrap">
      <div className="nbn-header">
        <span className="nbn-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="nbn-score">{state.score} pts</span>
      </div>
      <div className="nbn-prompt">{p.prompt}</div>
      <div className="nbn-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`nbn-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as NotoriousBountyAction)}>
            <span className="nbn-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="nbn-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="nbn-actions">
        {isResult && <button className="nbn-btn next" onClick={() => dispatch({ type:"next" } as NotoriousBountyAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
