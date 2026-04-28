import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WanderhomeJourneyState, WanderhomeJourneyAction, WanderhomeJourneySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function WanderhomeJourneyGame({ state, dispatch, onGameOver }: GameProps<WanderhomeJourneyState, WanderhomeJourneySettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="journal-wrap"><div className="journal-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#8e44ad" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="journal-wrap">
      <div className="journal-header">
        <span className="journal-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="journal-score">{state.score} pts</span>
      </div>
      <div className="journal-prompt">{p.prompt}</div>
      <div className="journal-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`journal-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as WanderhomeJourneyAction)}>
            <span className="journal-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="journal-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="journal-actions">
        {isResult && <button className="journal-btn next" onClick={() => dispatch({ type:"next" } as WanderhomeJourneyAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
