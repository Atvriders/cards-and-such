import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ScarletHeroesQuestState, ScarletHeroesQuestAction, ScarletHeroesQuestSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ScarletHeroesQuestGame({ state, dispatch, onGameOver }: GameProps<ScarletHeroesQuestState, ScarletHeroesQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="shq-wrap"><div className="shq-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#dc2626" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="shq-wrap">
      <div className="shq-header">
        <span className="shq-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="shq-score">{state.score} pts</span>
      </div>
      <div className="shq-prompt">{p.prompt}</div>
      <div className="shq-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`shq-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ScarletHeroesQuestAction)}>
            <span className="shq-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="shq-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="shq-actions">
        {isResult && <button className="shq-btn next" onClick={() => dispatch({ type:"next" } as ScarletHeroesQuestAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
