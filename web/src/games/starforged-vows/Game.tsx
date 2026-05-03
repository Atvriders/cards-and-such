import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StarforgedVowsState, StarforgedVowsAction, StarforgedVowsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function StarforgedVowsGame({ state, dispatch, onGameOver }: GameProps<StarforgedVowsState, StarforgedVowsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="sfv-wrap"><div className="sfv-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#60a5fa" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="sfv-wrap">
      <div className="sfv-header">
        <span className="sfv-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="sfv-score">{state.score} pts</span>
      </div>
      <div className="sfv-prompt">{p.prompt}</div>
      <div className="sfv-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-starforged-vows-primary":undefined} key={i} className={`sfv-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as StarforgedVowsAction)}>
            <span className="sfv-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="sfv-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="sfv-actions">
        {isResult && <button className="sfv-btn next" onClick={() => dispatch({ type:"next" } as StarforgedVowsAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
