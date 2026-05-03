import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StarforgedSagaState, StarforgedSagaAction, StarforgedSagaSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function StarforgedSagaGame({ state, dispatch, onGameOver }: GameProps<StarforgedSagaState, StarforgedSagaSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sfs-wrap"><div className="sfs-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#d946ef" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="sfs-wrap">
      <div className="sfs-header">
        <span className="sfs-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="sfs-score">{state.score} pts</span>
      </div>
      <div className="sfs-prompt">{p.prompt}</div>
      <div className="sfs-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-starforged-saga-primary":undefined} key={i} className={`sfs-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as StarforgedSagaAction)}>
            <span className="sfs-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="sfs-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="sfs-actions">
        {isResult && <button className="sfs-btn next" onClick={() => dispatch({ type:"next" } as StarforgedSagaAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
