import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IronswornVowsState, IronswornVowsAction, IronswornVowsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function IronswornVowsGame({ state, dispatch, onGameOver }: GameProps<IronswornVowsState, IronswornVowsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="iv-wrap"><div className="iv-done bounce-in"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#7dd3fc" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="iv-wrap fade-in">
      <div className="iv-header">
        <span className="iv-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="iv-score pulse">{state.score} pts</span>
      </div>
      <div className="iv-prompt">{p.prompt}</div>
      <div className="iv-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-ironsworn-vows-primary":undefined} key={i} className={`iv-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as IronswornVowsAction)}>
            <span className="iv-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="iv-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="iv-actions">
        {isResult && <button className="iv-btn next" onClick={() => dispatch({ type:"next" } as IronswornVowsAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
