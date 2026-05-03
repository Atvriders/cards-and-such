import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { ArtefactHistoryState, ArtefactHistoryAction, ArtefactHistorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function ArtefactHistoryGame({ state, dispatch, onGameOver }: GameProps<ArtefactHistoryState, ArtefactHistorySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="ath-wrap"><div className="ath-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#d97706" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="ath-wrap">
      <div className="ath-header">
        <span className="ath-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="ath-score">{state.score} pts</span>
      </div>
      <div className="ath-prompt">{p.prompt}</div>
      <div className="ath-choices">
        {p.choices.map((c, i) => (
          <button data-testid={i===0?"hint-target-artefact-history-primary":undefined} key={i} className={`ath-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as ArtefactHistoryAction)}>
            <span className="ath-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="ath-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="ath-actions">
        {isResult && <button className="ath-btn next" onClick={() => dispatch({ type:"next" } as ArtefactHistoryAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
