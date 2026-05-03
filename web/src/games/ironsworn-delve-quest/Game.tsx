import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { IronswornDelveQuestState, IronswornDelveQuestAction, IronswornDelveQuestSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function IronswornDelveQuestGame({ state, dispatch, onGameOver }: GameProps<IronswornDelveQuestState, IronswornDelveQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="idq-wrap"><div className="idq-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#fbbf24" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="idq-wrap">
      <div className="idq-header">
        <span className="idq-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="idq-score">{state.score} pts</span>
      </div>
      <div className="idq-prompt">{p.prompt}</div>
      <div className="idq-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-ironsworn-delve-quest-primary":undefined} key={i} className={`idq-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as IronswornDelveQuestAction)}>
            <span className="idq-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="idq-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="idq-actions">
        {isResult && <button className="idq-btn next" onClick={() => dispatch({ type:"next" } as IronswornDelveQuestAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
