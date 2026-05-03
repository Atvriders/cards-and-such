import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TslSoloQuestState, TslSoloQuestAction, TslSoloQuestSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function TslSoloQuestGame({ state, dispatch, onGameOver }: GameProps<TslSoloQuestState, TslSoloQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="tsl-wrap"><div className="tsl-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#fbbf24" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="tsl-wrap">
      <div className="tsl-header">
        <span className="tsl-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="tsl-score">{state.score} pts</span>
      </div>
      <div className="tsl-prompt">{p.prompt}</div>
      <div className="tsl-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-tsl-solo-quest-primary":undefined} key={i} className={`tsl-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as TslSoloQuestAction)}>
            <span className="tsl-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="tsl-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="tsl-actions">
        {isResult && <button className="tsl-btn next" onClick={() => dispatch({ type:"next" } as TslSoloQuestAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
